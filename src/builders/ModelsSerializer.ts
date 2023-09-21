import {
    TJsonaModel,
    TJsonApiBody,
    TJsonApiData,
    TJsonaDenormalizedIncludeNames,
    TJsonaNormalizedIncludeNamesTree,
    TJsonaUniqueIncluded,
    IModelPropertiesMapper,
    IModelsSerializer,
} from '../JsonaTypes';

import {createIncludeNamesTree} from '../utils';

export class ModelsSerializer implements IModelsSerializer {

    protected propertiesMapper: IModelPropertiesMapper;
    protected stuff: TJsonaModel | Array<TJsonaModel>;
    protected includeNamesTree: TJsonaNormalizedIncludeNamesTree;
    private buildIncludedIndex: number;

    constructor(propertiesMapper?: IModelPropertiesMapper) {
        propertiesMapper && this.setPropertiesMapper(propertiesMapper);
        this.buildIncludedIndex = 0;
    }

    setPropertiesMapper(propertiesMapper: IModelPropertiesMapper) {
        this.propertiesMapper = propertiesMapper;
    }

    setStuff(stuff: TJsonaModel | TJsonaModel[]) {
        this.stuff = stuff;
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
        const {stuff, propertiesMapper} = this;

        if (!propertiesMapper || typeof propertiesMapper !== 'object') {
            throw new Error('ModelsSerializer cannot build, propertiesMapper is not set');
        } else if (!stuff || typeof stuff !== 'object') {
            throw new Error('ModelsSerializer cannot build, stuff is not set');
        }

        const body: TJsonApiBody = {};
        const uniqueIncluded: TJsonaUniqueIncluded = {};

        if (stuff && Array.isArray(stuff)) {
            const collectionLength = stuff.length;
            const data = [];

            for (let i = 0; i < collectionLength; i++) {
                data.push(
                  this.buildDataByModel(stuff[i])
                );

                this.buildIncludedByModel(
                  stuff[i],
                  this.includeNamesTree,
                  uniqueIncluded
                );
            }

            body['data'] = data;

        } else if (stuff) {
            body['data'] = this.buildDataByModel(stuff);

            this.buildIncludedByModel(
              stuff,
              this.includeNamesTree,
              uniqueIncluded
            );
        } else if (stuff === null) {
            body['data'] = null;
        }

        if (Object.keys(uniqueIncluded).length) {
            body['included'] = Object.values(uniqueIncluded);
        }

        return body;
    }

    buildDataByModel(model: TJsonaModel | null): TJsonApiData {
        const id = this.propertiesMapper.getId(model);
        const type = this.propertiesMapper.getType(model);
        const attributes = this.propertiesMapper.getAttributes(model);
        const data = { type,
            ...(typeof id !== 'undefined' ? { id } : {}),
            ...(typeof attributes !== 'undefined' ? { attributes } : {}),
        };

        if (typeof data.type !== 'string' || !data.type) {
            console.warn('ModelsSerializer cannot buildDataByModel, type is not set or incorrect', model);
            throw new Error('ModelsSerializer cannot buildDataByModel, type is not set or incorrect');
        }

        const relationships = this.buildRelationshipsByModel(model);

        if (relationships && Object.keys(relationships).length) {
            data['relationships'] = relationships;
        }

        return data;
    }

    buildResourceObjectPart(relation: TJsonaModel) {
        const id = this.propertiesMapper.getId(relation);
        const type = this.propertiesMapper.getType(relation);

        return {
            type,
            ...(typeof id === 'undefined' ? {} : { id }),
        };
    }

    buildRelationshipsByModel(model: TJsonaModel) {
        const relations = this.propertiesMapper.getRelationships(model);

        if (!relations || !Object.keys(relations).length) {
            return;
        }

        const relationships = {};

        Object.keys(relations).forEach((k) => {
            const relation = relations[k];

            if (Array.isArray(relation)) {
                const relationshipData = [];

                for (const relationItem of relation) {
                    const relationshipDataItem = this.buildResourceObjectPart(relationItem);

                    if ('type' in relationshipDataItem) {
                        relationshipData.push(relationshipDataItem);
                    } else {
                        console.error(
                          `Can't create data item for relationship ${k},
                            it doesn't have 'id' or 'type', it was skipped`,
                          relationItem
                        );
                    }
                }

                relationships[k] = {
                    data: relationshipData
                };
            } else if (relation) {
                const item = this.buildResourceObjectPart(relation);

                if ('type' in item) {
                    relationships[k] = {
                        data: item
                    };
                } else {
                    console.error(
                      `Can't create data for relationship ${k}, it doesn't have 'type', it was skipped`,
                      relation
                    );
                }
            } else {
                relationships[k] = {
                    data: relation
                };
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

        const modelRelationships = this.propertiesMapper.getRelationships(model);
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
        const id = this.propertiesMapper.getId(relationModel);
        const type = this.propertiesMapper.getType(relationModel);
        let includeKey = type + id;

        if (!id || !builtIncluded[includeKey]) {
            // create data by current entity if such included is not yet created
            if (includeKey in builtIncluded) {
                includeKey += this.buildIncludedIndex;
                this.buildIncludedIndex += 1;
            }
            builtIncluded[includeKey] = this.buildDataByModel(relationModel);

            if (subIncludeTree) {
                this.buildIncludedByModel(relationModel, subIncludeTree, builtIncluded);
            }
        }
    }

}

export default ModelsSerializer;