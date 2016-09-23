'use strict';

import {
    IJsonaModel
} from '../JsonaInterfaces';

class BaseJsonaModel implements IJsonaModel {

    type: string;
    id: string | number;

    getType(): string {
        return this.type;
    }

    getId(): string|number {
        return this.id;
    }

    getAttributes(): Object {
        var attributes = {};

        var excludeProps = ['type', 'id'];

        var relationships = this.getRelationships();

        if (relationships) {
            excludeProps.concat(Object.getOwnPropertyNames(relationships));
        }

        var properties = Object.getOwnPropertyNames(this);
        var propertiesLength = properties.length;

        for (let i = 0; i <= propertiesLength; i++) {
            var attr = properties[i];
            if (this.hasOwnProperty(attr) && excludeProps.indexOf(attr) === -1) {
                attributes[attr] = this[attr];
            }
        }

        return attributes;
    }

    getRelationships(): { [relation: string]: IJsonaModel | IJsonaModel[] } | {} {
        return {};
    }

    setId(id: string | number): void {
        this.id = id;
    }

    setType(entityType: string): void {
        this.type = entityType;
    }

    setAttributes(attributes: Object): void {
        for (let k in attributes) {
            this[k] = attributes[k];
        }
    }

    setRelationships(relationships: { [relation: string]: IJsonaModel | IJsonaModel[] }): void {
        for (let k in relationships) {
            this[k] = relationships[k];
        }
    }

}

export default BaseJsonaModel;