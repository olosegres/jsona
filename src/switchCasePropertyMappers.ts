import {
    IModelPropertiesMapper,
    IJsonPropertiesMapper,
    TAnyKeyValueObject,
    TJsonaModel, TJsonaRelationships,
    SwitchCaseModelMapperOptionsType,
    SwitchCaseJsonMapperOptionsType,
} from './JsonaTypes';
import {ModelPropertiesMapper, JsonPropertiesMapper} from './';
import {RELATIONSHIP_NAMES_PROP} from "./simplePropertyMappers";

export class SwitchCaseModelMapper extends ModelPropertiesMapper implements IModelPropertiesMapper {

    kebabizeAttributes: boolean;
    kebabizeRelationships: boolean;
    kebabizeType: boolean;

    constructor(options?: SwitchCaseModelMapperOptionsType) {
        super();

        const {
            kebabizeAttributes = true,
            kebabizeRelationships = true,
            kebabizeType = true,
        } = options || {};

        this.kebabizeAttributes = kebabizeAttributes;
        this.kebabizeRelationships = kebabizeRelationships;
        this.kebabizeType = kebabizeType;
    }

    getType(model: TJsonaModel) {
        const type = super.getType(model);

        if (!this.kebabizeType || !type) {
            return type;
        }

        return type.replace(/([a-z][A-Z0-9])/g, function (g) { return g[0] + '-' + g[1].toLowerCase() });
    }

    getAttributes(model: TJsonaModel) {
        const camelCasedAttributes = super.getAttributes(model);

        if (!this.kebabizeAttributes || !camelCasedAttributes) {
            return camelCasedAttributes;
        }

        const kebabAttributes = {};
        Object.keys(camelCasedAttributes).forEach((name) => {
            const kebabName = name.replace(/([a-z][A-Z0-9])/g, function (g) { return g[0] + '-' + g[1].toLowerCase() });
            kebabAttributes[kebabName] = camelCasedAttributes[name];
        });
        return kebabAttributes;
    }

    getRelationships(model: TJsonaModel) {
        const camelCasedRelationships = super.getRelationships(model);

        if (!this.kebabizeRelationships || !camelCasedRelationships) {
            return camelCasedRelationships;
        }

        const kebabRelationships = {};
        Object.keys(camelCasedRelationships).forEach((name) => {
            const kebabName = name.replace(/([a-z][A-Z0-9])/g, function (g) { return g[0] + '-' + g[1].toLowerCase() });
            kebabRelationships[kebabName] = camelCasedRelationships[name];
        });
        return kebabRelationships;
    }
}

export class SwitchCaseJsonMapper extends JsonPropertiesMapper implements IJsonPropertiesMapper {

    camelizeAttributes: boolean;
    camelizeRelationships: boolean;
    camelizeType: boolean;

    constructor(options?: SwitchCaseJsonMapperOptionsType) {
        super();

        const {
            camelizeAttributes = true,
            camelizeRelationships = true,
            camelizeType = true,
        } = options || {};

        this.camelizeAttributes = camelizeAttributes;
        this.camelizeRelationships = camelizeRelationships;
        this.camelizeType = camelizeType;
    }

    createModel(type: string): TJsonaModel {
        if (!this.camelizeType) {
            return {type};
        }

        const camelizedType = type.replace(/-([a-z0-9])/g, function (g) { return g[1].toUpperCase(); });
        return {type: camelizedType};
    }

    setAttributes(model: TJsonaModel, attributes: TAnyKeyValueObject) {
        if (!this.camelizeAttributes) {
            return super.setAttributes(model, attributes);
        }

        Object.keys(attributes).forEach((propName) => {
            const camelName = propName.replace(/-([a-z0-9])/g, function (g) { return g[1].toUpperCase(); });
            model[camelName] = attributes[propName];
        });
    }

    setRelationships(model: TJsonaModel, relationships: TJsonaRelationships) {
        // call super.setRelationships first, just for not to copy paste setRelationships logic
        super.setRelationships(model, relationships);

        if (!this.camelizeRelationships) {
            return;
        }

        // then change relationship names case if needed
        model[RELATIONSHIP_NAMES_PROP].forEach((kebabName, i) => {
            const camelName = kebabName.replace(/-([a-z]|[0-9])/g, function (g) { return g[1].toUpperCase(); });
            if (camelName !== kebabName) {
                model[camelName] = model[kebabName];
                delete model[kebabName];
                model[RELATIONSHIP_NAMES_PROP][i] = camelName;
            }
        });
    }
}
