import {
    ISerializePropertiesMapper,
    IDeserializePropertiesMapper,
    TJsonaDenormalizedIncludeNames,
    TJsonaNormalizedIncludeNamesTree,
    TJsonaModel,
    TJsonApiBody
} from './JsonaTypes';

import {jsonParse} from './utils';
import ModelsSerializer from './builders/ModelsSerializer';
import JsonDeserializer from './builders/JsonDeserializer';

import {
    SerializePropertiesMapper,
    DeserializePropertiesMapper
} from './simplePropertyMappers';

class Jsona {

    public serializePropertiesMapper: ISerializePropertiesMapper;
    public deserializePropertiesMapper: IDeserializePropertiesMapper;

    constructor({
        serializePropertiesMapper = new SerializePropertiesMapper(),
        deserializePropertiesMapper = new DeserializePropertiesMapper()
    }) {
        this.serializePropertiesMapper = serializePropertiesMapper;
        this.deserializePropertiesMapper = deserializePropertiesMapper;
    }

    /**
     * serialize
     * Creates JSON, compatible with json:api specification from Jsona model(s).
     */
    serialize(
        {stuff, includeNames}: {
            stuff: TJsonaModel | Array<TJsonaModel>,
            includeNames: TJsonaDenormalizedIncludeNames | TJsonaNormalizedIncludeNamesTree
        }
    ): TJsonApiBody {
        if (!stuff) {
            throw new Error('Jsona can not serialize, stuff is not passed');
        }
        if (!this.serializePropertiesMapper) {
            throw new Error('Jsona can not serialize, serializePropertiesMapper is not set');
        }

        const jsonBuilder = new ModelsSerializer(this.serializePropertiesMapper);

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
        if (!this.deserializePropertiesMapper) {
            throw new Error('Jsona can not deserialize, deserializePropertiesMapper is not set');
        }

        const modelBuilder = new JsonDeserializer(this.deserializePropertiesMapper);

        if (typeof body === 'string') {
            modelBuilder.setJsonParsedObject(jsonParse(body));
        } else {
            modelBuilder.setJsonParsedObject(body);
        }

        return modelBuilder.build();
    }

}

export default Jsona;
