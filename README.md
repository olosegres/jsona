# Jsona
Framework agnostic library that provide systemized way to work with JSON API [v1.0 spetification](http://jsonapi.org/format/1.0/) in your JavaScript / TypeScript code.

[![NPM](https://nodei.co/npm/jsona.png?compact=true)](https://www.npmjs.com/package/jsona/)

### Why you may need it?

If you use or build API, that specified by *json:api* and:
- want to use more comfortable interface, than plain json:api object gives (such as array in `included`) to work with data in code;
- dont't want to think how to build correct json in accordance with standard for POST/PUT/PATH requests;
- like to have deal with typed data and you want to map API's entities to objects, that instantiated with unique constructors (classes);

### What it gives?

Ability to automatically convert request body (json, formatted in accordance with specification *json:api*) to instances of predefined by you classes and back to correct json, easy.

**Simple example**
```javascript
import {Jsona} from 'jsona';

// it suppose that we already defined special classes, such as data models
// and EntitiesFactory, that will help Jsona to map json:api entities to our data models and back
import MyEntitiesFactory from './MyEntitiesFactory';
import TestEntity1 from './entities/TestEntity1';
import TestEntity2 from './entities/TestEntity2';

const testJson = {
  "data": {
    "id": 123,
    "type": "testentity1",
    "attributes": {
      "foo1": "bar1"
    },
    "relationships": {
      "testrelation": {
        "data": {
          "id": 321,
          "type": "testentity2"
        }
      }
    }
  },
  "included": [{
    "id": 321,
    "type": "testentity2",
    "attributes": {
      "foo2": "bar2"
    }
  }]
};

const dataFormatter = new Jsona(new MyEntitiesFactory());

// testJson may be stringified json or plain object
const deserialized = dataFormatter.deserialize(testJson);

console.log(deserialized); // will output something similar to:
//   {
//       hasCollection: false
//       hasItem: true
//       item: TestEntity1 {
//           foo1: "bar1"
//           id: 123
//           type: "testentity1"
//           testrelation: TestEntity2 {
//               foo2: "bar2"
//               id: 321
//               type: "testentity2"
//           }
//       }
//       collection: null
//   }

```

### Examples of helpers and models that you may change and use in your project
Library written in TypeScript, but examples below uses ES6-7 and partly Flow.

**MyEntitiesFactory.js**
```javascript
import Town from './entities/Town';
import Country from './entities/Country';
import Region from './entities/Region';

class MyEntitiesFactory {

   constructor() {
       this.map = {
           'town': Town,
           'country': Country,
           'region': Region,
       };
   }

   getClass(entityType) {
       return this.map[entityType];
   }

   getModel(entityType) {
       var mappedClass = this.map[entityType];

       if (!mappedClass) {
           throw new Error(`MyEntitiesFactory dont know about entity with type [${entityType}]`);
       }

       return new mappedClass();
   }
}

export default MyEntitiesFactory;
```

**jsonaHelpers.js**
```javascript
import {Jsona} from 'jsona';
import MyEntitiesFactory from './MyEntitiesFactory';

/**
* @var {MyEntitiesFactory} entitiesFactory - factory, that will using in Jsona for instantiate entities for each defined type
*/
const entitiesFactory = new MyEntitiesFactory();
const dataFormatter = new Jsona(entitiesFactory);

export function fromJsonToItem(jsonApiBody) {
   const deserialized = dataFormatter.deserialize(jsonApiBody);

   if (deserialized.hasItem) {
       return {
           item: deserialized.item,
           meta: deserialized.meta,
       };
   }

   console.error('fromJsonToItem cant deserialize object', jsonApiBody);
   return {};
}

export function fromJsonToCollection(jsonApiBody) {
   const deserialized = dataFormatter.deserialize(jsonApiBody);

   if (deserialized.hasCollection) {
       return {
           collection: deserialized.collection,
           meta: deserialized.meta,
       };
   }

   console.error('fromJsonToCollection cant deserialize object', jsonApiBody);
   return {};
}

export function fromCollectionToJson(collection, requestedIncludes, withAllIncludes = false) {
   return dataFormatter.serialize({collection, requestedIncludes, withAllIncludes});
}

export function fromItemToJson(item, requestedIncludes, withAllIncludes = false) {
   return dataFormatter.serialize({item, requestedIncludes, withAllIncludes});
}

export function fromJsonToItemOrCollection(jsonApiBody) {
   const deserialized = dataFormatter.deserialize(jsonApiBody);

   return {
       item: deserialized.item || null,
       collection: deserialized.collection || null,
       meta: deserialized.meta || null,
   };
}

export default {
   fromJsonToCollection,
   fromJsonToItem,
   fromCollectionToJson,
   fromItemToJson,
   fromJsonToItemOrCollection,
};
```

**Town.js** (example of model)
```javascript
import MyBaseEntity from './MyBaseEntity';
import Region from './Region';
import Country from './Country';

class Town extends MyBaseEntity {
   id: string;
   type: string;

   name: string;
   nameGenitive: string;
   timeZone: string;

   region: Region;
   country: Country;

   getRelationships() {
       return {
           region: this.region,
           country: this.country
       }
   }
}

export default Town;
```

**MyBaseEntity.js**
```javascript
import {BaseJsonaModel} from 'jsona';

class MyBaseEntity extends BaseJsonaModel {
   constructor(props) {
        super();

        Object.keys(params).forEach((k) => {
            this[k] = params[k];
        });
   }
}

export default MyBaseEntity;
```

### License
Jsona, examples provided in this repository and in the documentation are [MIT licensed](./LICENSE).