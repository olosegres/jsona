import {
    TJsonaModel,
    TJsonApiBody,
    TJsonApiData,
    TJsonaDenormalizedIncludeNames,
    TJsonaNormalizedIncludeNamesTree,
    TJsonaUniqueIncluded,
    ISerializePropertiesMapper
} from '../JsonaTypes';

import {createIncludeNamesTree} from '../utils';

class ModelsSerializer {

    protected pm: ISerializePropertiesMapper;
    protected staff: TJsonaModel | Array<TJsonaModel>;
    protected includeNamesTree: TJsonaNormalizedIncludeNamesTree;

    constructor(propertiesMapper) {
        this.setPropertiesMapper(propertiesMapper);
    }

    setPropertiesMapper(pm) {
        this.pm = pm;
    }

    setStuff(staff) {
        this.staff = staff;
    }

    setIncludeNames(includeNames: TJsonaDenormalizedIncludeNames | TJsonaNormalizedIncludeNamesTree) {
        if (Array.isArray(includeNames)) {
            const includeNamesTree = {};
            includeNames.forEach((namesChain) => {
                createIncludeNamesTree(namesChain, includeNamesTree);
            });
            this.includeNamesTree = includeNamesTree;
        } else {
            this.includeNamesTree = includeNames;
        }
    }

    build(): TJsonApiBody {
        const body: TJsonApiBody = {};
        const included: Array<TJsonApiData> = [];
        const uniqueIncluded: TJsonaUniqueIncluded = {};
        const {staff} = this;

        if (staff && Array.isArray(staff)) {
            const collectionLength = staff.length;
            const data = [];

            for (let i = 0; i < collectionLength; i++) {
                data.push(
                    this.buildDataByModel(staff[i])
                );

                this.buildIncludedByModel(
                    staff[i],
                    this.includeNamesTree,
                    uniqueIncluded
                );
            }

            body['data'] = data;

        } else if (staff) {
            body['data'] = this.buildDataByModel(staff);

            this.buildIncludedByModel(
                staff,
                this.includeNamesTree,
                uniqueIncluded
            );
        }

        if (Object.keys(uniqueIncluded).length) {
            body['included'] = [];
            const includeUniqueKeys = Object.keys(uniqueIncluded).sort();
            includeUniqueKeys.forEach((k) => {
                body['included'].push(uniqueIncluded[k]);
            });
        }

        return body;
    }

    buildDataByModel(model: TJsonaModel) {
        const data = {
            id: this.pm.getId(model),
            type: this.pm.getType(model),
            attributes: this.pm.getAttributes(model),
        };

        const relationships = this.buildRelationshipsByModel(model);

        if (relationships && Object.keys(relationships).length) {
            data['relationships'] = relationships;
        }

        return data;
    }

    buildRelationshipsByModel(model: TJsonaModel) {
        const relations = this.pm.getRelationships(model);

        if (!relations || !Object.keys(relations).length) {
            return;
        }

        const relationships = {};

        Object.keys(relations).forEach((k) => {
            const relation = relations[k];

            if (Array.isArray(relation)) {
                const relationshipData = [];
                const relationLength = relation.length;

                for (let i = 0; i < relationLength; i++) {
                    const item = {
                        id: this.pm.getId(relation[i]),
                        type: this.pm.getType(relation[i])
                    };

                    if (item.id && item.type) {
                        relationshipData.push(item);
                    } else {
                        console.error(
                            `Can't create data item[${i}] for relationship ${k},
                            it doesn't have 'id' or 'type', it was skipped`,
                            relation[i]
                        );
                    }
                }

                relationships[k] = {
                    data: relationshipData
                };
            } else {
                const item = {
                    id: this.pm.getId(relation),
                    type: this.pm.getType(relation)
                };
                if (item.type) {
                    relationships[k] = {
                        data: item
                    };
                } else {
                    console.error(
                        `Can't create data for relationship ${k}, it doesn't have 'type', it was skipped`,
                        relation
                    );
                }
            }
        });

        return relationships;
    }

    buildIncludedByModel(
        model: TJsonaModel,
        includeTree: TJsonaNormalizedIncludeNamesTree,
        builtIncluded: TJsonaUniqueIncluded = {}
    ): void {
        if (!includeTree || !Object.keys(includeTree).length) {
            return;
        }

        const modelRelationships = this.pm.getRelationships(model);
        if (!modelRelationships || !Object.keys(modelRelationships).length) {
            return;
        }

        const includeNames = Object.keys(includeTree);
        const includeNamesLength = includeNames.length;

        for (let i = 0; i < includeNamesLength; i++) {
            const currentRelationName = includeNames[i];
            const relation: TJsonaModel | Array<TJsonaModel> = modelRelationships[currentRelationName];

            if (relation) {
                if (Array.isArray(relation)) {
                    let relationModelsLength = relation.length;

                    for (let r = 0; r < relationModelsLength; r++) {
                        const relationModel: TJsonaModel = relation[r];
                        this.buildIncludedItem(relationModel, includeTree[currentRelationName], builtIncluded);
                    }
                } else {
                    this.buildIncludedItem(relation, includeTree[currentRelationName], builtIncluded);
                }
            }
        }
    }

    buildIncludedItem(
        relationModel: TJsonaModel,
        subIncludeTree: TJsonaNormalizedIncludeNamesTree,
        builtIncluded: TJsonaUniqueIncluded
    ) {
        const includeKey = this.pm.getType(relationModel) + this.pm.getId(relationModel);

        if (!builtIncluded[includeKey]) {
            // create data by current entity if such included is not yet created
            builtIncluded[includeKey] = this.buildDataByModel(relationModel);

            if (subIncludeTree) {
                this.buildIncludedByModel(relationModel, subIncludeTree, builtIncluded);
            }
        }
    }

}

export default ModelsSerializer;