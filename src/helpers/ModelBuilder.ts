'use strict';

import {
    IJsonaModel,
    IJsonaModelsFactory,
    IJsonaRelations,
    IJsonApiBody,
    IJsonApiData
} from '../JsonaInterfaces';

class ModelBuilder {

    protected modelsFactory: IJsonaModelsFactory;
    protected body;
    protected includedInObject;

    constructor() {
        this.body = {};
    }

    setModelsFactory(modelsFactory: IJsonaModelsFactory): void {
        this.modelsFactory = modelsFactory;
    }

    setJsonParsedObject(body: IJsonApiBody): void {
        this.body = body;
    }

    getModelsFactory(): IJsonaModelsFactory {
        return this.modelsFactory;
    }

    getJsonParsedObject(): IJsonApiBody {
        return this.body;
    }

    hasItem(): boolean {
        return this.body.data && (this.body.data instanceof Array) === false;
    }

    hasCollection(): boolean {
        return this.body.data && (this.body.data instanceof Array) === true;
    }

    buildItem(): IJsonaModel {
        return this.buildModelByData(this.body.data);
    }

    buildCollection(): IJsonaModel[] {
        var collection = [];

        var items = this.body.data;
        var itemsLength = items.length;

        for (let i = 0; i < itemsLength; i++) {
            var model = this.buildModelByData(items[i]);

            if (model) {
                collection.push(model);
            }
        }

        return collection;
    }

    buildModelByData(data: IJsonApiData): IJsonaModel {

        var model = this.modelsFactory.getModel(data.type);

        model.setId(data.id);
        model.setType(data.type);
        model.setAttributes(data.attributes);

        var relationships = this.buildRelationsByData(data);

        if (relationships) {
            model.setRelationships(<IJsonaRelations> relationships);
        } 

        return model;
    }

    buildRelationsByData(data: IJsonApiData): IJsonaRelations | void {
        var readyRelations = {};

        if (data.relationships) {
            for (let k in data.relationships) {
                var relation = data.relationships[k];

                if (relation.data && relation.data instanceof Array) {
                    readyRelations[k] = [];

                    var relationItemsLength = relation.data.length;
                    for (let i = 0; i < relationItemsLength; i++) {
                        let dataItem = this.buildDataFromIncluded(
                            relation.data[i].id,
                            relation.data[i].type
                        );
                        readyRelations[k].push(
                            this.buildModelByData(dataItem)
                        );
                    }
                } else if (relation.data) {
                    let dataItem = this.buildDataFromIncluded(relation.data.id, relation.data.type);
                    readyRelations[k] = this.buildModelByData(dataItem);
                }
            }
        }

        if (Object.keys(readyRelations).length) {
            return <IJsonaRelations> readyRelations;
        }
    }

    buildDataFromIncluded(id: string | number, type: string): IJsonApiData {
        var included = this.buildIncludedInObject();
        var dataItem = included[type + id];

        if (dataItem) {
            return dataItem;
        } else {
            return { id: id, type: type };
        }
    }

    buildIncludedInObject(): { [key: string]: IJsonApiData } {
        if (!this.includedInObject) {
            this.includedInObject = {};

            if (this.body.included) {
                let includedLength = this.body.included.length;
                for (let i = 0; i < includedLength; i++) {
                    let item = this.body.included[i];
                    this.includedInObject[item.type + item.id] = item;
                }
            }
        }

        return this.includedInObject;
    }
}

export default ModelBuilder;