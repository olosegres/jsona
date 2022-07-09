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

    getCachedModel(data, resourceIdObject) {
        const entityKey = this.createCacheKey(data, resourceIdObject);
        return this.cachedModels[entityKey] || null;
    }

    handleModel(model, data, resourceIdObject) {
        const entityKey = this.createCacheKey(data, resourceIdObject);
        const dataWithPayload = data.attributes || data.relationships;

        if (entityKey && dataWithPayload) {
            this.cachedModels[entityKey] = model;
        }
    }

    createCacheKey(data, resourceIdObject) {
        // resourceIdObject.meta sets to model in simplePropertyMappers.ts, so it should be used here too
        // cache in this case probably will be redundant
        if (!data.id || !data.type || resourceIdObject.meta) {
            return;
        }

        const resourcePart = `${resourceIdObject.type}-${resourceIdObject.id}`;

        if (data.meta) {
            return `${data.type}-${data.id}-${jsonStringify(data.meta)}-${resourcePart}`;
        }

        return `${data.type}-${data.id}-${resourcePart}`;
    }

}
