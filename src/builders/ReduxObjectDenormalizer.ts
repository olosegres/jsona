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

        if (typeof ids === 'string') {
            return this.buildModel(entityType, ids);
        }

        if (!ids) {
            ids = Object.keys(reduxObject[entityType]);
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

    buildModel(type: string, id: string | number): null | TJsonaModel {
        const {reduxObject} = this;

        if (!reduxObject[type]) {
            return null;
        }

        const reduxObjectModel: TReduxObjectModel = reduxObject[type][id];

        if (!reduxObjectModel) {
            return null;
        }

        const model = this.propertiesMapper.createModel(type);

        this.propertiesMapper.setId(model, id);
        this.propertiesMapper.setAttributes(model, reduxObjectModel.attributes);

        const relationships = this.buildRelationships(model, reduxObjectModel.relationships);

        if (relationships) {
            this.propertiesMapper.setRelationships(model, relationships)
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
                if (model) {
                    relationModels.push(model);
                }
            });

            return relationModels;
        } else if (data.id && data.type) {
            return this.buildModel(data.type, data.id);
        }

        return null;
    }
}

export default ReduxObjectDenormalizer;