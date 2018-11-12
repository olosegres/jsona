import {
    IDeserializeCache, TAnyKeyValueObject
} from './JsonaTypes';


export function jsonStringify(json: TAnyKeyValueObject): string {
    let stringified;

    try {
        stringified = JSON.stringify(json);
    } catch (e) {
        stringified = '';
        console.warn(e);
    }

    return stringified;
}

export class DeserializeCache implements IDeserializeCache {

    protected cachedModels = {};

    getCachedModel(data) {
        const entityKey = this.createCacheKey(data);
        return this.cachedModels[entityKey] || null;
    }

    handleModel(model, data) {
        const entityKey = this.createCacheKey(data);
        const dataWithPayload = data.attributes || data.relationships;

        if (entityKey && dataWithPayload) {
            this.cachedModels[entityKey] = model;
        }
    }

    createCacheKey(data) {
        if (data.type && data.id && !data.meta) {
            return `${data.type}-${data.id}`;
        }

        if (data.type && data.id && data.meta) {
            const meta = jsonStringify(data.meta);
            return `${data.type}-${data.id}-${meta}`;
        }

        return '';
    }

}
