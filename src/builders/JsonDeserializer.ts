import {
    IJsonPropertiesMapper,
    TJsonaModel,
    TJsonaRelationships,
    TJsonApiBody,
    TJsonApiData,
    IJsonaDeserializer,
    IDeserializeCache, TResourceIdObj,
} from '../JsonaTypes';

export class JsonDeserializer implements IJsonaDeserializer {

    protected pm: IJsonPropertiesMapper;
    protected dc: IDeserializeCache;
    protected body;
    protected dataInObject;
    protected preferNestedDataFromData = false;
    protected includedInObject;

    constructor(propertiesMapper, deserializeCache, options) {
        this.setPropertiesMapper(propertiesMapper);
        this.setDeserializeCache(deserializeCache);

        if (!options) {
            return;
        }

        if (options.preferNestedDataFromData) {
            this.preferNestedDataFromData = true;
        }
    }

    setDeserializeCache(dc): void {
        this.dc = dc;
    }

    setPropertiesMapper(pm): void {
        this.pm = pm;
    }

    setJsonParsedObject(body: TJsonApiBody): void {
        this.body = body;
    }

    build(): TJsonaModel | Array<TJsonaModel> {
        const {data} = this.body;
        let stuff;

        if (Array.isArray(data)) {
            stuff = [];
            const collectionLength = data.length;

            for (let i = 0; i < collectionLength; i++) {
                if (data[i]) {
                    const model = this.buildModelByData(data[i]);

                    if (model) {
                        stuff.push(model);
                    }
                }
            }
        } else if (data) {
            stuff = this.buildModelByData(data);
        }

        return stuff;
    }

    buildModelByData(data: TJsonApiData, resourceIdObj: TResourceIdObj = {}): TJsonaModel {
        const cachedModel = this.dc.getCachedModel(data);

        if (cachedModel) {
            return cachedModel;
        }

        const model = this.pm.createModel(data.type);

        this.dc.handleModel(model, data); // should be called before this.pm.setRelationships(model, relationships);

        if (model) {
            this.pm.setId(model, data.id);

            if (data.attributes) {
                this.pm.setAttributes(model, data.attributes);
            }

            if (data.meta && this.pm.setMeta) {
                this.pm.setMeta(model, data.meta);
            }

            if (data.links && this.pm.setLinks) {
                this.pm.setLinks(model, data.links);
            }

            if (resourceIdObj.meta) {
                this.pm.setResourceIdObjMeta(model, resourceIdObj.meta);
            }

            const relationships: null | TJsonaRelationships = this.buildRelationsByData(data, model);

            if (relationships) {
                this.pm.setRelationships(model, relationships);
            }
        }

        return model;
    }

    buildRelationsByData(data: TJsonApiData, model: TJsonaModel): TJsonaRelationships | null {
        const readyRelations = {};

        if (data.relationships) {
            for (let k in data.relationships) {
                const relation = data.relationships[k];

                if (Array.isArray(relation.data)) {
                    readyRelations[k] = [];

                    const relationDataLength = relation.data.length;
                    let resourceIdObj;

                    for (let i = 0; i < relationDataLength; i++) {
                        resourceIdObj = relation.data[i];

                        if (!resourceIdObj) {
                            return;
                        }

                        let dataItem = this.buildDataFromIncludedOrData(
                            resourceIdObj.id,
                            resourceIdObj.type
                        );
                        readyRelations[k].push(
                            this.buildModelByData(dataItem, resourceIdObj)
                        );
                    }
                } else if (relation.data) {
                    let dataItem = this.buildDataFromIncludedOrData(relation.data.id, relation.data.type);
                    readyRelations[k] = this.buildModelByData(dataItem, relation.data);
                } else if (relation.data === null) {
                    readyRelations[k] = null;
                }

                if (relation.links) {
                    const {setRelationshipLinks} = this.pm;
                    if (setRelationshipLinks) {
                        setRelationshipLinks(model, k, relation.links);
                    }
                }

                if (relation.meta) {
                    const {setRelationshipMeta} = this.pm;
                    if (setRelationshipMeta) {
                        setRelationshipMeta(model, k, relation.meta);
                    }
                }
            }
        }

        if (Object.keys(readyRelations).length) {
            return <TJsonaRelationships> readyRelations;
        }

        return null;
    }

    buildDataFromIncludedOrData(id: string | number, type: string): TJsonApiData {

        if (this.preferNestedDataFromData) {
            const dataObject = this.buildDataInObject();
            const dataItemFromData = dataObject[type + id];

            if (dataItemFromData) {
                return dataItemFromData;
            }
        }

        const includedObject = this.buildIncludedInObject();
        const dataItemFromIncluded = includedObject[type + id];

        if (dataItemFromIncluded) {
            return dataItemFromIncluded;
        }

        if (!this.preferNestedDataFromData) {
            const dataObject = this.buildDataInObject();
            const dataItemFromData = dataObject[type + id];

            if (dataItemFromData) {
                return dataItemFromData;
            }
        }

        return { id: id, type: type };
    }

    buildDataInObject(): { [key: string]: TJsonApiData } {
        if (!this.dataInObject) {
            this.dataInObject = {};

            const { data } = this.body;
            const dataLength = data.length;

            if (data && dataLength) {
                for (let i = 0; i < dataLength; i++) {
                    let item = data[i];
                    this.dataInObject[item.type + item.id] = item;
                }
            } else if (data) {
                this.dataInObject[data.type + data.id] = data;
            }
        }

        return this.dataInObject;
    }

    buildIncludedInObject(): { [key: string]: TJsonApiData } {
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

export default JsonDeserializer;