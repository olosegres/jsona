import {
    IModelPropertiesMapper,
    IJsonPropertiesMapper,
    TJsonaDenormalizedIncludeNames,
    TJsonaNormalizedIncludeNamesTree,
    TJsonaModel,
    TJsonApiBody,
    TReduxObject
} from './JsonaTypes';

import {jsonParse} from './utils';
import ModelsSerializer from './builders/ModelsSerializer';
import JsonDeserializer from './builders/JsonDeserializer';
import ReduxObjectDenormalizer from './builders/ReduxObjectDenormalizer';

import {
    ModelPropertiesMapper,
    JsonPropertiesMapper
} from './simplePropertyMappers';

class Jsona {

    public modelPropertiesMapper: IModelPropertiesMapper = new ModelPropertiesMapper();
    public jsonPropertiesMapper: IJsonPropertiesMapper = new JsonPropertiesMapper();

    constructor(params?: {
        modelPropertiesMapper: IModelPropertiesMapper,
        jsonPropertiesMapper: IJsonPropertiesMapper
    }) {
        if (params && params.modelPropertiesMapper) {
            this.modelPropertiesMapper = params.modelPropertiesMapper;
        }
        if (params && params.jsonPropertiesMapper) {
            this.jsonPropertiesMapper = params.jsonPropertiesMapper;
        }
    }

    /**
     * serialize
     * Creates JSON, compatible with json:api specification from Jsona model(s).
     */
    serialize(
        {stuff, includeNames}: {
            stuff: TJsonaModel | Array<TJsonaModel>,
            includeNames?: TJsonaDenormalizedIncludeNames | TJsonaNormalizedIncludeNamesTree
        }
    ): TJsonApiBody {
        if (!stuff) {
            throw new Error('Jsona can not serialize, stuff is not passed');
        }

        const jsonBuilder = new ModelsSerializer(this.modelPropertiesMapper);

        jsonBuilder.setStuff(stuff);

        if (includeNames) {
            jsonBuilder.setIncludeNames(includeNames);
        }

        return jsonBuilder.build();
    }

    /**
     * deserialize
     * Creates Jsona model(s) from JSON, compatible with json:api specification.
     */
    deserialize(body: TJsonApiBody | string): TJsonaModel | Array<TJsonaModel> {
        if (!body) {
            throw new Error('Jsona can not deserialize, body is not passed');
        }

        const modelBuilder = new JsonDeserializer(this.jsonPropertiesMapper);

        if (typeof body === 'string') {
            modelBuilder.setJsonParsedObject(jsonParse(body));
        } else {
            modelBuilder.setJsonParsedObject(body);
        }

        return modelBuilder.build();
    }

    /**
     * denormalizeReduxObject
     * Creates Jsona model(s) from ReduxObject, that creates by json-api-normalizer
     * https://github.com/yury-dymov/json-api-normalizer
     *
     */
    denormalizeReduxObject(
        {reduxObject, entityType, entityIds, returnBuilderInRelations = false}: {
            reduxObject: TReduxObject,
            entityType: string,
            entityIds?: string | Array<string>,
            returnBuilderInRelations: boolean,
        }
    ): null | TJsonaModel | Array<TJsonaModel> {

        if (!reduxObject) {
            throw new Error('Jsona can not denormalize ReduxObject, incorrect reduxObject passed');
        }
        if (!entityType) {
            throw new Error('Jsona can not denormalize ReduxObject, entityType is not passed');
        }

        if (!reduxObject[entityType]) {
            return null;
        }

        const modelBuilder = new ReduxObjectDenormalizer(this.jsonPropertiesMapper);

        modelBuilder.setReduxObject(reduxObject);
        modelBuilder.setEntityType(entityType);
        modelBuilder.setReturnBuilderInRelations(returnBuilderInRelations);

        if (entityIds) {
            modelBuilder.setEntityIds(
                Array.isArray(entityIds) ? entityIds : entityIds.toString()
            );
        }

        return modelBuilder.build();
    }

}

export default Jsona;
