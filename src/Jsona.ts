'use strict';

import {
    IJsonaModel,
    IJsonaSerializeParams,
    IJsonaModelsFactory,
    IJsonaIncludeTree,
    IJsonaRequestedFields,
    IJsonApiBody
} from './JsonaInterfaces';

import JsonBuilder from './helpers/JsonBuilder';
import ModelBuilder from './helpers/ModelBuilder';
import SimpleModelsFactory from './helpers/SimpleModelsFactory';

class Jsona {

    protected modelsFactory: IJsonaModelsFactory;
    protected propertiesMapper: IJsonaModel;

    /**
     * Create a Jsona Service instance
     * @param {IJsonaModelsFactory} modelsFactory - The factory, that will provide instance for each of JSON API entities,
     *                                              that will be serialized or deserialized
     */
	constructor(
        modelsFactory: IJsonaModelsFactory = new SimpleModelsFactory()
	) {
		this.modelsFactory = modelsFactory;
	}

    /**
     * Serialize models, and additional data to JSON API compatible object.
     * @param {IJsonaModel} params.item - Filled with data model,
                                          that will be used to build a "data" and "include" parts.
     * @param {Array<IJsonaModel>} params.collection - Array of filled with data models,
     *                                                 that will be used to build a "data" and "include" parts.
     * @param {Object} params.meta - any JSON-compatible data
     * @param {Object} params.error - any JSON-compatible data
     * @param {IJsonaIncludeTree} params.requestedIncludes - object must describe what data should be put in "included" part of JSON. 
     * @param {IJsonaRequestedFields} params.requestedFields - object must describe what attributes of entities should be put
     *                                                         in "data" and "included" parts of JSON.
     * @param {boolean} params.stringify - Stringify results object or not.
     * @return {IJsonApiBody|string}
     */
    serialize(params: IJsonaSerializeParams): IJsonApiBody {
        var item: IJsonaModel = params.item;
        var collection: IJsonaModel[] = params.collection;
        var meta: Object = params.meta;
        var error: Object = params.error;
        var requestedIncludes: IJsonaIncludeTree = params.requestedIncludes;
        var requestedFields: IJsonaRequestedFields = params.requestedFields;

		var jsonBuilder = new JsonBuilder();

        !!requestedIncludes && jsonBuilder.setRequestedIncludesTree(requestedIncludes);
		!!requestedFields && jsonBuilder.setRequestedFields(requestedFields);

		!!item && jsonBuilder.setItem(item);
		!!collection && jsonBuilder.setCollection(collection);
		!!meta && jsonBuilder.setMeta(meta);
		!!error && jsonBuilder.setError(error);

		return jsonBuilder.buildBody();
	}

    deserialize(body: IJsonApiBody | string) {
		var modelBuilder = new ModelBuilder();

        if (typeof body !== 'object') {
            modelBuilder.setJsonParsedObject(this.jsonParse(body));
        } else {
            modelBuilder.setJsonParsedObject(body);
        }

        modelBuilder.setModelsFactory(this.modelsFactory);

        var deserialized = {
            hasItem: false,
            hasCollection: false,
            item: null,
            collection: null
        };

        if (modelBuilder.hasItem()) {
            deserialized['hasItem'] = true;
            deserialized['item'] = modelBuilder.buildItem();
        } else if (modelBuilder.hasCollection()) {
            deserialized['hasCollection'] = true;
            deserialized['collection'] = modelBuilder.buildCollection();
        }

        return deserialized;
	}

    jsonParse(stringified: string): Object {
        var parsed;

        try {
            parsed = JSON.parse(stringified);
        } catch (e) {
            parsed = {};
        }

        return parsed;
    }

    jsonStringify(object: string): Object {
        var stringified;

        try {
            stringified = JSON.stringify(object);
        } catch (e) {
            stringified = '{}';
        }

        return stringified;
    }
}

export default Jsona;
