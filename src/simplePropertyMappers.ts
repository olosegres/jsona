import {
    IModelPropertiesMapper,
    IJsonPropertiesMapper,
    TAnyKeyValueObject,
    TJsonaModel,
    TJsonaRelationships, TJsonaRelationshipBuild, TJsonApiLinks, TResourceIdObj
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
            if (model[relationName] !== undefined) {
                relationships[relationName] = model[relationName];
            }
        });
        return relationships;
    }
}

export function defineRelationGetter(
    model,
    relationName,
    buildRelation: TJsonaRelationshipBuild
) {
    Object.defineProperty(
        model,
        relationName,
        {
            enumerable: true,
            configurable: true,
            set: (value) => {
                delete model[relationName];
                model[relationName] = value;
            },
            get: () => {
                delete model[relationName];
                return model[relationName] = buildRelation();
            },
        },
    );
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

    setMeta(model: TJsonaModel, meta: TAnyKeyValueObject) {
        model.meta = meta;
    }

    setLinks(model: TJsonaModel, links: TJsonApiLinks) {
        model.links = links;
    }

    setResourceIdObjMeta(model: TJsonaModel, meta: TResourceIdObj) {
        model.resourceIdObjMeta = meta;
    }

    setRelationships(model: TJsonaModel, relationships: TJsonaRelationships) {

        Object.keys(relationships).forEach((propName) => {
            if (typeof relationships[propName] === 'function') {
                defineRelationGetter(model, propName, <TJsonaRelationshipBuild> relationships[propName]);
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

    setRelationshipLinks(parentModel: TJsonaModel, relationName: string, links: TJsonApiLinks) {
        // inherit your IJsonPropertiesMapper and overload this method, if you want to handle relationship links
    }

    setRelationshipMeta(parentModel: TJsonaModel, relationName: string, links: TAnyKeyValueObject) {
        // inherit your IJsonPropertiesMapper and overload this method, if you want to handle relationship meta
    }
}
