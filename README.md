# Jsona
JSON API [v1.0 specification](http://jsonapi.org/format/1.0/) serializer and deserializer for use on the server and in the browser.
* From JSON to simplified objects
* Back from simplified objects to JSON (in according with [json:api specification](http://jsonapi.org/format/1.0/))
* Also from "reduxObject" to simplified objects (`reduxObject` is a result object of [json-api-normalizer](https://github.com/yury-dymov/json-api-normalizer))

[![NPM](https://img.shields.io/npm/v/jsona.svg)](https://www.npmjs.com/package/jsona/)
[![dependencies](https://img.shields.io/static/v1?label=dependencies&message=none&color=success)](https://www.npmjs.com/package/jsona/)
[![downloads](https://img.shields.io/npm/dm/jsona.svg)](https://www.npmjs.com/package/jsona/)

#### What problem does it solve?
When you work with API standardized to [json:api specification](http://jsonapi.org/format/1.0/), you're dealing with a special and optimized JSON data format in the request and response body.
You can get data of several entities that are related to each other, but you'll receive it in array (included).
You may need to send modified back to server (or new data) in accordance with specification.

This may puzzle you with the following questions:

* How to get necessary entity from `included` array many times more inconvenient and optimal?
* How to describe data from server, working with typings (TypeScript, Flow)?
* How to send JSON to the server without manually assembling JSON in accordance with specification?

### Installation

```
npm i jsona --save
```
or

```
yarn add jsona
```


### How to use

You need to instantiate Jsona once, then use its public methods to convert data.
```javascript
import Jsona from 'jsona';
const dataFormatter = new Jsona();
```

#### deserialize - creates simplified object(s) from json
```javascript
const json = {
    data: {
          type: 'town',
          id: '123',
          attributes: {
              name: 'Barcelona'
          },
          relationships: {
              country: {
                  data: {
                      type: 'country',
                      id: '32'
                  }
              }
          }
    },
    included: [{
        type: 'country',
        id: '32',
        attributes: {
            name: 'Spain'
        }
    }]
};

const town = dataFormatter.deserialize(json);
console.log(town); // will output:
/* {
    type: 'town',
    id: '123',
    name: 'Barcelona',
    country: {
        type: 'country',
        id: '32',
        name: 'Spain'
    },
    relationshipNames: ['country']
} */
```

#### serialize - creates json from simplified object(s)
```javascript
const user = {
    type: 'user',
    id: 1,
    categories: [{ type: 'category', id: '1', name: 'First category' }],
    town: {
        type: 'town',
        id: '123',
        name: 'Barcelona',
        country: {
            type: 'country',
            id: '32',
            name: 'Spain'
        },
        relationshipNames: ['country']
    },
    relationshipNames: ['categories', 'town']
};

const newJson = dataFormatter.serialize({
    stuff: user, // can handle array
    includeNames: ['categories', 'town.country'] // can include deep relations via dot
});

console.log(newJson); // will output:
/* {
    data: {
        type: 'user',
        id: 1,
        relationships: {
            categories: {
                data: [{ type: 'category', id: '1' }]
            },
            town: {
                data: { type: 'town', id: '123' }
            }
        }
    },
    included: [{
        type: 'category',
        id: '1',
        attributes: {
            name: 'First category',
        }
    }, {
        type: 'town',
        id: '123',
        attributes: {
             name: 'Barcelona',
        },
        relationships: {
             country: {
                 data: {
                     type: 'country',
                     id: '32',
                 }
             }
        }
    }, {
        type: 'country',
        id: '32',
        attributes: {
            name: 'Spain',
        }
    }]
}*/
```

#### denormalizeReduxObject - creates simplified object(s) from reduxObject
"reduxObject" - result object of [json-api-normalizer](https://github.com/yury-dymov/json-api-normalizer)

```javascript
const reduxObject = reduxStore.entities; // depends on where you store it
const town = dataFormatter.denormalizeReduxObject({reduxObject, entityType: 'town', entityIds: '123'});
console.log(town); // if there is such town and country in reduxObject, it will output:
/* {
    type: 'town',
    id: '123',
    name: 'Barcelona',
    country: {
        type: 'country',
        id: '34',
        name: 'Spain'
    },
    relationshipNames: ['country']
} */
```

### Customize

#### Build process and property names
You can control process of building simplified objects, just use your own [propertyMappers](src/simplePropertyMappers.ts) when Jsona instantiates.

With [IJsonPropertiesMapper](src/JsonaTypes.ts) you can implement your way of creation simplified objects (data models) from JSON, with [IModelPropertiesMapper](src/JsonaTypes.ts) implement how to give back values from data model to JSON.

It gives unlimited possibilities to integrate Jsona with react, redux, angular2

Example of passing your own [propertyMappers](src/simplePropertyMappers.ts) to Jsona:
```javascript
import Jsona from 'jsona';
import {MyModelPropertiesMapper, MyJsonPropertiesMapper} from 'myPropertyMappers';

export const dataFormatter = new Jsona({
    modelPropertiesMapper: MyModelPropertiesMapper,
    jsonPropertiesMapper: MyJsonPropertiesMapper
});
```
Also, there is built-in [switchCasePropertyMappers](src/switchCasePropertyMappers.ts), that you can use if need to automatically transform property names from kebab, snake, camel case and back. 

#### Cache
For faster creation of simplified objects from json, it uses a cache for already processed json-entity, see [DeserializeCache](src/cache.ts) that uses by default.
It possible to provide your own [IDeserializeCache](src/JsonaTypes.ts) manager:
```javascript
import Jsona from 'jsona';
import {MyOwnDeserializeCache} from './index';

export const dataFormatter = new Jsona({
    DeserializeCache: MyOwnDeserializeCache
});
```

### License
Jsona, examples provided in this repository and in the documentation are [MIT licensed](./LICENSE).
