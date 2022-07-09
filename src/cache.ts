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
        if (!data.id || !data.type) {
            return; // if there is no id we should not use cache (it may happens on creating new resources)
        }

        const keyDataPart = data.meta ? (
            `${data.type}-${data.id}-${jsonStringify(data.meta)}`
        ) : (
            `${data.type}-${data.id}`
        );

        const keyResourcePart = resourceIdObject.meta ? (
            // resourceIdObject.meta sets to model in simplePropertyMappers.ts, so it should be used here too
            `${resourceIdObject.type}-${resourceIdObject.id}-${jsonStringify(resourceIdObject.meta)}`
        ) : (
            `${resourceIdObject.type}-${resourceIdObject.id}`
        );

        return `${keyDataPart}-${keyResourcePart}`;
    }

}
