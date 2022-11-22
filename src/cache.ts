import {
    IDeserializeCache, TAnyKeyValueObject, TJsonaModel, TJsonApiData, TResourceIdObj
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

    getCachedModel(data:TJsonApiData, resourceIdObject: TResourceIdObj) {
        const entityKey = this.createCacheKey(data, resourceIdObject);
        return this.cachedModels[entityKey] || null;
    }

    handleModel(model: TJsonaModel, data: TJsonApiData, resourceIdObject: TResourceIdObj) {
        const entityKey = this.createCacheKey(data, resourceIdObject);
        const dataWithPayload = data.attributes || data.relationships;

        if (entityKey && dataWithPayload) {
            this.cachedModels[entityKey] = model;
        }
    }

    createCacheKey(data, resourceIdObject?: TResourceIdObj) {
        // resourceIdObject.meta sets to model in simplePropertyMappers.ts, so it should be used here too
        // cache in this case probably will be redundant
        if (!data.id || !data.type) {
            return;
        }

        let resourcePart = resourceIdObject ? `${resourceIdObject.type}-${resourceIdObject.id}` : '';

        if (resourceIdObject?.meta) {
            resourcePart += `-${jsonStringify(resourceIdObject.meta)}`;
        }

        if (data.meta) {
            return `${data.type}-${data.id}-${jsonStringify(data.meta)}-${resourcePart}`;
        }

        return `${data.type}-${data.id}-${resourcePart}`;
    }

}
