import {
    IModelPropertiesMapper,
    IJsonPropertiesMapper,
    TAnyKeyValueObject,
    TJsonaModel,
    TJsonaRelationships, TJsonaRelationshipBuild, IJsonApiRelationLinks
} from './JsonaTypes';

export const RELATIONSHIP_NAMES_PROP = 'relationshipNames';

export class ModelPropertiesMapper implements IModelPropertiesMapper {

    getId(model: TJsonaModel) {
        return model.id;
    }

    getType(model: TJsonaModel) {
        return model.type;
    }

    getAttributes(model: TJsonaModel) {
        let exceptProps = ['id', 'type', RELATIONSHIP_NAMES_PROP];

        if (Array.isArray(model[RELATIONSHIP_NAMES_PROP])) {

            exceptProps.push(...model[RELATIONSHIP_NAMES_PROP]);

        } else if (model[RELATIONSHIP_NAMES_PROP]) {
            console.warn(
                `Can't getAttributes correctly, '${RELATIONSHIP_NAMES_PROP}' property of ${model.type}-${model.id} model
                isn't array of relationship names`,
                model[RELATIONSHIP_NAMES_PROP]
            );
        }

        const attributes = {};
        Object.keys(model).forEach((attrName) => {
            if (exceptProps.indexOf(attrName) === -1) {
                attributes[attrName] = model[attrName];
            }
        });

        return attributes;
    }

    getRelationships(model: TJsonaModel) {
        const relationshipNames = model[RELATIONSHIP_NAMES_PROP];

        if (!relationshipNames || Array.isArray(relationshipNames) && !relationshipNames.length) {
            return;
        } else if (relationshipNames && !Array.isArray(relationshipNames)) {
            console.warn(
                `Can't getRelationships correctly,
                '${RELATIONSHIP_NAMES_PROP}' property of ${model.type}-${model.id} model
                isn't array of relationship names`,
                model[RELATIONSHIP_NAMES_PROP]
            );
            return;
        }

        const relationships = {};
        relationshipNames.forEach((relationName) => {
            relationships[relationName] = model[relationName];
        });
        return relationships;
    }
}

export class JsonPropertiesMapper implements IJsonPropertiesMapper {

    createModel(type: string): TJsonaModel {
        return {type};
    }

    setId(model: TJsonaModel, id: string | number) {
        model.id = id;
    }

    setAttributes(model: TJsonaModel, attributes: TAnyKeyValueObject) {
        Object.keys(attributes).forEach((propName) => {
            model[propName] = attributes[propName];
        });
    }

    setRelationships(model: TJsonaModel, relationships: TJsonaRelationships) {
        const relationsCache = {};

        Object.keys(relationships).forEach((propName) => {
            if (typeof relationships[propName] === 'function') {
                const buildRelation = <TJsonaRelationshipBuild> relationships[propName];
                const cacheProp = `${propName}`;
                Object.defineProperty(
                    model,
                    propName,
                    {
                        enumerable: true,
                        set: (value) => {
                            relationsCache[cacheProp] = value;
                        },
                        get: () => {
                            if (relationsCache.hasOwnProperty(cacheProp) === false) {
                                relationsCache[cacheProp] = buildRelation();
                            }
                            return relationsCache[cacheProp];
                        },
                    },
                );
            } else {
                model[propName] = relationships[propName];
            }
        });

        const newNames = Object.keys(relationships);
        const currentNames = model[RELATIONSHIP_NAMES_PROP];

        if (currentNames && currentNames.length) {
            model[RELATIONSHIP_NAMES_PROP] = [...currentNames, ...newNames].filter((value, i, self) => self.indexOf(value) === i);
        } else {
            model[RELATIONSHIP_NAMES_PROP] = newNames;
        }
    }

    setRelationshipLinks(parentModel: TJsonaModel, relationName: string, links: IJsonApiRelationLinks) {
        // inherit your IJsonPropertiesMapper and overload this method, if you want to handle links
    }
}
