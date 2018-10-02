import {
    IJsonaModelBuilder,
    IJsonPropertiesMapper,
    TJsonaModel,
    TJsonaRelationships,
    TReduxObject,
    TReduxObjectModel,
    TJsonApiRelationships,
    TJsonApiRelationshipData
} from '../JsonaTypes';

class ReduxObjectDenormalizer implements IJsonaModelBuilder {

    protected propertiesMapper: IJsonPropertiesMapper;
    protected reduxObject: TReduxObject;
    protected entityType: string;
    protected ids?: string | Array<string>;
    protected returnBuilderInRelations: boolean;
    protected cachedModels = {};

    constructor(propertiesMapper) {
        this.setPropertiesMapper(propertiesMapper);
    }

    setPropertiesMapper(propertiesMapper: IJsonPropertiesMapper) {
        this.propertiesMapper = propertiesMapper;
    }

    setReduxObject(reduxObject: TReduxObject) {
        this.reduxObject = reduxObject;
    }
    setEntityType(entityType: string) {
        this.entityType = entityType;
    }

    setEntityIds(ids: string | Array<string>) {
        this.ids = ids;
    }

    setReturnBuilderInRelations(returnBuilderInRelations: boolean) {
        this.returnBuilderInRelations = returnBuilderInRelations;
    }

    build(): null | TJsonaModel | Array<TJsonaModel> {
        const {reduxObject, entityType, propertiesMapper} = this;

        if (!propertiesMapper || typeof propertiesMapper !== 'object') {
            throw new Error('ReduxObjectDenormalizer cannot build, propertiesMapper is not set');
        } else if (!reduxObject || typeof reduxObject !== 'object') {
            throw new Error('ReduxObjectDenormalizer cannot build, reduxObject is not set');
        } else if (!entityType) {
            throw new Error('ReduxObjectDenormalizer cannot build, entityType is not set');
        }

        if (!reduxObject[entityType]) {
            return null;
        }

        let {ids} = this;

        if (!ids) {
            ids = Object.keys(reduxObject[entityType]);
        }

        if (Array.isArray(ids)) {

            if (!ids.length) {
                return null;
            }

            const models = [];

            ids.forEach((id) => {
                const model = this.buildModel(entityType, id);
                if (model) {
                    models.push(model);
                }
            });

            return models;
        }

        return this.buildModel(entityType, ids);
    }

    buildModel(type: string, id: string | number): null | TJsonaModel {
        const {reduxObject} = this;

        if (!reduxObject[type]) {
            return null;
        }

        const reduxObjectModel: TReduxObjectModel = reduxObject[type][id];

        if (!reduxObjectModel) {
            return null;
        }

        // checks for built model in cachedModels is a protection from creating models on recursive relationships
        const entityKey = `${type}-${id}`;
        let model = this.cachedModels[entityKey];

        if (!model) {
            model = this.propertiesMapper.createModel(type);

            if (model) {
                this.cachedModels[entityKey] = model;

                this.propertiesMapper.setId(model, reduxObjectModel.id);

                if (reduxObjectModel.attributes) {
                    this.propertiesMapper.setAttributes(model, reduxObjectModel.attributes);
                }

                const relationships = this.buildRelationships(model, reduxObjectModel.relationships);

                if (relationships) {
                    this.propertiesMapper.setRelationships(model, relationships)
                }
            }
        }

        return model;
    }

    buildRelationships(model: TJsonaModel, reduxObjectRelationships: TJsonApiRelationships): null | TJsonaRelationships {

        if (!reduxObjectRelationships) {
            return null;
        }
        const relationNames = Object.keys(reduxObjectRelationships);

        if (!relationNames.length) {
            return null;
        }

        const relations = {};

        relationNames.forEach((relationName) => {
            const relation = reduxObjectRelationships[relationName];

            if (relation && relation.data) {
                if (this.returnBuilderInRelations) {
                    relations[relationName] = this.buildRelationModels.bind(this, relation.data);
                } else {
                    relations[relationName] = this.buildRelationModels(relation.data);
                }
            }

            if (relation && relation.links) {
                this.propertiesMapper.setRelationshipLinks(model, relationName, relation.links);
            }

            if (relation && relation.meta) {
                const {setRelationshipMeta} = this.propertiesMapper;
                if (setRelationshipMeta) { // support was added in patch release
                    setRelationshipMeta(model, relationName, relation.meta);
                }
            }
        });

        return Object.keys(relations).length ? relations : null;
    }

    buildRelationModels(
        data: TJsonApiRelationshipData | Array<TJsonApiRelationshipData>
    ): null | TJsonaModel | Array<TJsonaModel> {

        if (Array.isArray(data)) {
            const relationModels = [];

            data.forEach((dataItem) => {
                const model = this.buildModel(dataItem.type, dataItem.id);
                relationModels.push(model || dataItem);
            });

            return relationModels;
        } else if (data.id && data.type) {
            return this.buildModel(data.type, data.id) || data;
        }

        return null;
    }
}

export default ReduxObjectDenormalizer;
