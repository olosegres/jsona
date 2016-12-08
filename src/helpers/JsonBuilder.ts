'use strict';

import {
    IJsonaModel,
    IJsonApiBody,
    IJsonApiData,
    IJsonaRequestedFields,
    IJsonaIncludeTree,
    IJsonaUniqueIncluded
} from '../JsonaInterfaces';

import isIncludeTree from './isIncludeTree';

class JsonBuilder {

    protected item: IJsonaModel;
    protected collection: IJsonaModel[];
    protected error: Object;
    protected meta: Object;
    protected requestedFields: IJsonaRequestedFields;
    protected requestedIncludesTree: IJsonaIncludeTree;
    protected withAllIncludes: boolean;

    setItem(item: IJsonaModel): void {
        this.item = item;
    }

    setCollection(collection: IJsonaModel[]): void {
        this.collection = collection;
    }

    setError(error: Object): void {
        this.error = error;
    }

    setMeta(meta: Object): void {
        this.meta = meta;
    }

    setRequestedFields(requestedFields: IJsonaRequestedFields) {
        this.requestedFields = requestedFields;
    }

    setRequestedIncludesTree(requestedIncludesTree: IJsonaIncludeTree) {
        this.requestedIncludesTree = requestedIncludesTree;
    }

    setWithAllIncludes(withAllIncludes: boolean) {
        this.withAllIncludes = withAllIncludes;
    }

    buildBody(): IJsonApiBody {
        var body: IJsonApiBody = {};
        var meta = {};
        var included: IJsonApiData[] = [];
        var uniqueIncluded: IJsonaUniqueIncluded = {};

        if (!!this.item) {

            body['data'] = this.buildDataByModel(this.item);

            let includedByModel = this.buildIncludedByModel(
                this.item,
                this.requestedIncludesTree
            );
            if (Object.keys(includedByModel).length) {
                (<any>Object).assign(uniqueIncluded, includedByModel);
            }
        } else if (!!this.collection) {
            let collectionLength = this.collection.length;
            let data = [];
            let uniqueIncluded = {};

            for (let i = 0; i < collectionLength; i++) {
                data.push(
                    this.buildDataByModel(this.collection[i])
                );

                let includedByModel = this.buildIncludedByModel(
                    this.collection[i],
                    this.requestedIncludesTree
                );
                if (Object.keys(includedByModel).length) {
                    (<any>Object).assign(uniqueIncluded, includedByModel);
                }
            }

            body['data'] = data;
        }

        if (Object.keys(uniqueIncluded).length) {
            body['included'] = [];
            for (let k in uniqueIncluded) {
                body['included'].push(uniqueIncluded[k]);
            }
        }

        if (!!this.error) {
            body['error'] = this.error;
        }

        if (!!this.meta) {
            body['meta'] = this.meta;
        }

        return body;
    }

    buildDataByModel(model: IJsonaModel) {
        let data = {
            id: model.getId(),
            type: model.getType(),
            attributes: model.getAttributes(),
        };

        let relationships = this.buildRelationshipsByModel(model);
        if (relationships && Object.keys(relationships).length) {
            data['relationships'] = relationships;
        }

        return data;
    }

    buildRelationshipsByModel(model: IJsonaModel) {
        let relationships = {};
        let relations = model.getRelationships();

        for (let k in relations) {
            let relation = relations[k];

            if (relation instanceof Array) {
                let relationship = [];
                let relationLength = relation.length;

                for (let i = 0; i <= relationLength; i++) {
                    relationship.push({
                        data: {
                            id: relation[i].getId(),
                            type: relation[i].getType()
                        }
                    });
                }

                relationships[k] = relationship;
            } else {
                relationships[k] = {
                    data: {
                        id: relation.getId(),
                        type: relation.getType()
                    }
                };
            }
        }

        return relationships;
    }

    buildIncludedByModel(
        model: IJsonaModel,
        includeTree: IJsonaIncludeTree
    ): IJsonaUniqueIncluded | Object {

        if (this.withAllIncludes) {
            return this.buildIncludedWithAllRelationships(model);
        } else if (isIncludeTree(includeTree)) {
            return this.buildIncludedWithIncludeThree(model, includeTree);
        } else {
            return {};
        }
    }

    buildIncludedWithIncludeThree(
        model: IJsonaModel,
        includeTree: IJsonaIncludeTree
    ): IJsonaUniqueIncluded | Object {

        var included = {};
        var modelRelationships = model.getRelationships();
 
        for (let k in includeTree) {
            if (modelRelationships[k]) {
                let relation = modelRelationships[k];

                if (relation instanceof Array) {
                    let relationItems: Array<IJsonaModel> = relation;
                    let relationItemsLength = relationItems.length;

                    for (let i; i <= relationItemsLength; i++) {
                        let relationItem: IJsonaModel = relationItems[i];

                        let includeKey = relationItem.getType() + relationItem.getId();
                        let includedItem = {};
                        includedItem[includeKey] = this.buildDataByModel(relationItem);
                        (<any>Object).assign(included, includedItem);

                        if (isIncludeTree(includeTree[k])) {
                            (<any>Object).assign(
                                included,
                                this.buildIncludedByModel(relationItem, (<IJsonaIncludeTree>includeTree[k]))
                            );
                        }
                    }
                } else {
                    let includeKey = relation.getType() + relation.getId();
                    let includedItem = {};
                    let relationItem: IJsonaModel = relation;

                    includedItem[includeKey] = this.buildDataByModel(relation);
                    (<any>Object).assign(included, includedItem);

                    if (isIncludeTree(includeTree[k])) {
                        (<any>Object).assign(
                            included,
                            this.buildIncludedByModel(relation, (<IJsonaIncludeTree>includeTree[k]))
                        );
                    }
                }
            }
        }

        return included;
    }

    buildIncludedWithAllRelationships(model: IJsonaModel): IJsonaUniqueIncluded | Object {
        var modelRelationships = model.getRelationships();

        var included = {};

        Object.keys(modelRelationships).forEach((k: string) => {
            if (modelRelationships[k] instanceof Array) {
                modelRelationships[k].forEach((relation: IJsonaModel) => {
                    var includeKey = relation.getType() + relation.getId();

                    if (included[includeKey] === undefined) {
                        included[includeKey] = this.buildDataByModel(relation);
                    }
                    Object.assign(included, this.buildIncludedWithAllRelationships(relation));
                });
            } else {
                var includeKey = modelRelationships[k].getType() + modelRelationships[k].getId();

                if (included[includeKey] === undefined) {
                    included[includeKey] = this.buildDataByModel(modelRelationships[k]);
                }
                Object.assign(included, this.buildIncludedWithAllRelationships(modelRelationships[k]));
            }
        });

        return included;
    }
}

export default JsonBuilder;