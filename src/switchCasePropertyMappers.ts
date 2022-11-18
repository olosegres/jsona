import {
    IModelPropertiesMapper,
    IJsonPropertiesMapper,
    TAnyKeyValueObject,
    TJsonaModel, TJsonaRelationships,
    SwitchCaseModelMapperOptionsType,
    SwitchCaseJsonMapperOptionsType,
} from './JsonaTypes';
import {
    ModelPropertiesMapper, 
    JsonPropertiesMapper,
    RELATIONSHIP_NAMES_PROP,
} from './simplePropertyMappers';
import {
    isPlainObject
} from './utils';

export class SwitchCaseModelMapper extends ModelPropertiesMapper implements IModelPropertiesMapper {

    switchAttributes: boolean;
    switchRelationships: boolean;
    switchType: boolean;
    switchChar: string;
    regex: RegExp;

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
        this.regex = new RegExp(/([a-z][A-Z0-9])/g);
    }

    getType(model: TJsonaModel) {
        const type = super.getType(model);

        if (!this.switchType || !type) {
            return type;
        }

        return this.convertFromCamelCaseString(type);
    }

    getAttributes(model: TJsonaModel) {
        const camelCasedAttributes = super.getAttributes(model);

        if (!this.switchAttributes || !camelCasedAttributes) {
            return camelCasedAttributes;
        }

        return this.convertFromCamelCase(camelCasedAttributes);
    }

    getRelationships(model: TJsonaModel) {
        const camelCasedRelationships = super.getRelationships(model);

        if (!this.switchRelationships || !camelCasedRelationships) {
            return camelCasedRelationships;
        }

        return this.convertFromCamelCase(camelCasedRelationships);
    }

    private convertFromCamelCase(stuff: unknown) {
        if (Array.isArray(stuff)) {
            return stuff.map(item => this.convertFromCamelCase(item));
        }
        
        if(isPlainObject(stuff)) {
            const converted = {};
            Object.entries(stuff).forEach(([propName, value]) => {
                const kebabName = this.convertFromCamelCaseString(propName);
                converted[kebabName] = this.convertFromCamelCase(value);
            })
            return converted;
        }

        return stuff;
    }

    private convertFromCamelCaseString(camelCaseString: string) {
        return camelCaseString.replace(this.regex, g => g[0] + this.switchChar + g[1].toLowerCase());
    }
}

export class SwitchCaseJsonMapper extends JsonPropertiesMapper implements IJsonPropertiesMapper {

    camelizeAttributes: boolean;
    camelizeRelationships: boolean;
    camelizeType: boolean;
    camelizeMeta: boolean;
    switchChar: string;
    regex: RegExp;

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
        this.regex = new RegExp(`${this.switchChar}([a-z0-9])`, 'g');
    }

    createModel(type: string): TJsonaModel {
        if (!this.camelizeType) {
            return {type};
        }

        const camelizedType = this.convertToCamelCaseString(type);
        return {type: camelizedType};
    }

    setAttributes(model: TJsonaModel, attributes: TAnyKeyValueObject) {
        if (!this.camelizeAttributes) {
            return super.setAttributes(model, attributes);
        }

        Object.assign(model, this.convertToCamelCase(attributes));
    }

    setMeta(model: TJsonaModel, meta: TAnyKeyValueObject) {
        if (!this.camelizeMeta) {
            return super.setMeta(model, meta);
        }

        model.meta = this.convertToCamelCase(meta);
    }

    setRelationships(model: TJsonaModel, relationships: TJsonaRelationships) {
        // call super.setRelationships first, just for not to copy paste setRelationships logic
        super.setRelationships(model, relationships);

        if (!this.camelizeRelationships) {
            return;
        }

        // then change relationship names case if needed
        model[RELATIONSHIP_NAMES_PROP].forEach((kebabName, i) => {
            const camelName = this.convertToCamelCaseString(kebabName);
            if (camelName !== kebabName) {
                model[camelName] = model[kebabName];
                delete model[kebabName];
                model[RELATIONSHIP_NAMES_PROP][i] = camelName;
            }
        });
    }

    private convertToCamelCase(stuff: unknown) {
        if (Array.isArray(stuff)) {
            return stuff.map(item => this.convertToCamelCase(item));
        }
        
        if(isPlainObject(stuff)) {
            const converted = {};
            Object.entries(stuff).forEach(([propName, value]) => {
                const camelName = this.convertToCamelCaseString(propName);
                converted[camelName] = this.convertToCamelCase(value);
            });
            return converted;
        }

        return stuff;
    }

    convertToCamelCaseString(notCamelCaseString: string) {
        return notCamelCaseString.replace(this.regex, g => g[1].toUpperCase());
    }
}
