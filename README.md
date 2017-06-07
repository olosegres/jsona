# Jsona
Framework agnostic library that provide data formatters to simplify work with JSON API [v1.0 specification](http://jsonapi.org/format/1.0/).

[![NPM](https://img.shields.io/npm/v/jsona.svg)](https://www.npmjs.com/package/jsona/) [![Build Status](https://travis-ci.org/olosegres/jsona.svg?branch=master)](https://travis-ci.org/olosegres/jsona)

*NOTE:* This README describes 1.x.x version. You can read [README for old versions 0.2.x here](README_0_2.md)

### What it gives?
- converter from json to simplified objects (some denormalized structure)
- converter from "reduxObject" to simplified objects (`reduxObject` is a result object of [json-api-normalizer](https://github.com/yury-dymov/json-api-normalizer)
- converter from simplified objects to json (json in according with JSON API specification)

### How to use
You need to instantiate Jsona ones, then use it's public methods to convert data.
```
const dataFormatter = new Jsona();
```

#### deserialize - creates simplified object(s) from json
```javascript
const json = {
    data: {
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
    },
    included: [{
        type: 'country',
        id: '32',
        attributes: {
            name: 'Spain',
        }
    }]
};

const model = dataFormatter.deserialize(json);
console.log(model); // will output:
/* {
    type: 'town',
    id: '21',
    name: 'Shanghai',
    country: {
        type: 'country',
        id: '34',
        name: 'Spain'
    }
} */
```

#### serialize - creates json from simplified object(s)
```javascript
const newJson = dataFormatter.serialize({
    stuff: model,
    includeNames: 'country'
});
console.log(newJson); // will output:
/* {
    data: {
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
    },
    included: [{
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
const model = dataFormatter.denormalizeReduxObject({reduxObject, entityType: 'town', entityIds: '123'});
console.log(newJson); // if there is such town and country in reduxObject, it will output:
/* {
    type: 'town',
    id: '21',
    name: 'Shanghai',
    country: {
        type: 'country',
        id: '34',
        name: 'Spain'
    }
} */
```

*NOTE:* You can control process of building this objects, just use your own [propertyMappers](src/simplePropertyMappers.ts) when Jsona instantiates.
So, it may be easier to use, if you will create a proxy module in your project, something like this:
```javascript
import Jsona from 'jsona';
import {MyModelPropertiesMapper, MyJsonPropertiesMapper} from 'myPropertyMappers';

export default const dataFormatter = new Jsona({
    modelPropertiesMapper: MyModelPropertiesMapper,
    jsonPropertiesMapper: MyJsonPropertiesMapper
});
```

### License
Jsona, examples provided in this repository and in the documentation are [MIT licensed](./LICENSE).