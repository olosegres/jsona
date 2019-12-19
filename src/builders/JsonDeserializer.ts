import {
    IJsonPropertiesMapper,
    TJsonaModel,
    TJsonaRelationships,
    TJsonApiBody,
    TJsonApiData,
    IJsonaModelBuilder,
    IDeserializeCache,
} from '../JsonaTypes';

function createEntityKey(data: TJsonApiData) {
    if (data.type && data.id) {
        return `${data.type}-${data.id}`;
    }

    return '';
}

class JsonDeserializer implements IJsonaModelBuilder {

    protected pm: IJsonPropertiesMapper;
    protected dc: IDeserializeCache;
    protected body;
    protected includedInObject;
    protected cachedModels = {};

    constructor(propertiesMapper, deserializeCache) {
        this.setPropertiesMapper(propertiesMapper);
        this.setDeserializeCache(deserializeCache);
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
            const indices = [];

            for (let i = 0; i < collectionLength; i++) {
                if (data[i]) {
                    const model = this.buildModelByData(data[i], false);

                    if (model) {
                        stuff.push(model);
                        indices.push(i);
                    }
                }
            }

            for (let i = 0; i < stuff.length; i++) {
                const relationships: null | TJsonaRelationships = this.buildRelationsByData(data[indices[i]], stuff[i]);

                if (relationships) {
                    this.pm.setRelationships(stuff[i], relationships);
                }
            }
        } else if (data) {
            stuff = this.buildModelByData(data, true);
        }

        return stuff;
    }

    buildModelByData(data: TJsonApiData, doRelations: boolean): TJsonaModel {
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

            if (doRelations) {
                const relationships: null | TJsonaRelationships = this.buildRelationsByData(data, model);

                if (relationships) {
                    this.pm.setRelationships(model, relationships);
                }
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

                    const relationItemsLength = relation.data.length;
                    let relationItem;

                    for (let i = 0; i < relationItemsLength; i++) {
                        relationItem = relation.data[i];

                        if (!relationItem) {
                            return;
                        }

                        let dataItem = this.buildDataFromIncludedOrData(
                            relationItem.id,
                            relationItem.type
                        );
                        readyRelations[k].push(
                            this.buildModelByData(dataItem, true)
                        );
                    }
                } else if (relation.data) {
                    let dataItem = this.buildDataFromIncludedOrData(relation.data.id, relation.data.type);
                    readyRelations[k] = this.buildModelByData(dataItem, true);
                } else if (relation.data === null) {
                    readyRelations[k] = null;
                }

                if (relation.links) {
                    const {setRelationshipLinks} = this.pm;
                    if (setRelationshipLinks) { // support was added in patch release
                        setRelationshipLinks(model, k, relation.links);
                    }
                }

                if (relation.meta) {
                    const {setRelationshipMeta} = this.pm;
                    if (setRelationshipMeta) { // support was added in patch release
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
        const included = this.buildIncludedInObject();
        const dataItem = included[type + id];

        if (dataItem) {
            return dataItem;
        } else {
            return { id: id, type: type };
        }
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
