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

    switchAttributes: boolean;
    switchRelationships: boolean;
    switchType: boolean;
    switchChar: string;

    constructor(options?: SwitchCaseModelMapperOptionsType) {
        super();

        const {
            switchAttributes = true,
            switchRelationships = true,
            switchType = true,
            switchChar = '-',
        } = options || {};

        this.switchAttributes = switchAttributes;
        this.switchRelationships = switchRelationships;
        this.switchType = switchType;
        this.switchChar = switchChar;
    }

    getType(model: TJsonaModel) {
        const type = super.getType(model);

        if (!this.switchType || !type) {
            return type;
        }

        return type.replace(/([a-z][A-Z0-9])/g, g => g[0] + this.switchChar + g[1].toLowerCase());
    }

    getAttributes(model: TJsonaModel) {
        const camelCasedAttributes = super.getAttributes(model);

        if (!this.switchAttributes || !camelCasedAttributes) {
            return camelCasedAttributes;
        }

        const kebabAttributes = {};
        Object.keys(camelCasedAttributes).forEach((name) => {
            const kebabName = name.replace(/([a-z][A-Z0-9])/g, g => g[0] + this.switchChar + g[1].toLowerCase());
            kebabAttributes[kebabName] = camelCasedAttributes[name];
        });
        return kebabAttributes;
    }

    getRelationships(model: TJsonaModel) {
        const camelCasedRelationships = super.getRelationships(model);

        if (!this.switchRelationships || !camelCasedRelationships) {
            return camelCasedRelationships;
        }

        const kebabRelationships = {};
        Object.keys(camelCasedRelationships).forEach((name) => {
            const kebabName = name.replace(/([a-z][A-Z0-9])/g, g => g[0] + this.switchChar + g[1].toLowerCase());
            kebabRelationships[kebabName] = camelCasedRelationships[name];
        });
        return kebabRelationships;
    }
}

export class SwitchCaseJsonMapper extends JsonPropertiesMapper implements IJsonPropertiesMapper {

    camelizeAttributes: boolean;
    camelizeRelationships: boolean;
    camelizeType: boolean;
    camelizeMeta: boolean;
    switchChar: string;

    constructor(options?: SwitchCaseJsonMapperOptionsType) {
        super();

        const {
            camelizeAttributes = true,
            camelizeRelationships = true,
            camelizeType = true,
            camelizeMeta = false,
            switchChar = '-'
        } = options || {};

        this.camelizeAttributes = camelizeAttributes;
        this.camelizeRelationships = camelizeRelationships;
        this.camelizeType = camelizeType;
        this.camelizeMeta = camelizeMeta;
        this.switchChar = switchChar;
    }

    createModel(type: string): TJsonaModel {
        if (!this.camelizeType) {
            return {type};
        }

        const regex = new RegExp(`${this.switchChar}([a-z0-9])`, 'g');
        const camelizedType = type.replace(regex, g => g[1].toUpperCase());
        return {type: camelizedType};
    }

    setAttributes(model: TJsonaModel, attributes: TAnyKeyValueObject) {
        if (!this.camelizeAttributes) {
            return super.setAttributes(model, attributes);
        }

        Object.keys(attributes).forEach((propName) => {
            const regex = new RegExp(`${this.switchChar}([a-z0-9])`, 'g');
            const camelName = propName.replace(regex, g => g[1].toUpperCase());
            model[camelName] = attributes[propName];
        });
    }

    setMeta(model: TJsonaModel, meta: TAnyKeyValueObject) {
        if (!this.camelizeMeta) {
            return super.setMeta(model, meta);
        }

        model.meta = {};

        Object.keys(meta).forEach((propName) => {
            const regex = new RegExp(`${this.switchChar}([a-z0-9])`, 'g');
            const camelName = propName.replace(regex, g => g[1].toUpperCase());
            model.meta[camelName] = meta[propName];
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
            const regex = new RegExp(`${this.switchChar}([a-z0-9])`, 'g');
            const camelName = kebabName.replace(regex, g => g[1].toUpperCase());
            if (camelName !== kebabName) {
                model[camelName] = model[kebabName];
                delete model[kebabName];
                model[RELATIONSHIP_NAMES_PROP][i] = camelName;
            }
        });
    }
}
