'use strict';

import {
    IJsonaModel
} from '../JsonaInterfaces';

import BaseJsonaModel from './BaseJsonaModel';

class SimpleJsonaModel extends BaseJsonaModel {

    getRelationships(): { [relation: string]: IJsonaModel | IJsonaModel[] } | {} {
        var relationships = {};

        for (let k in this) {
            if (this[k] instanceof BaseJsonaModel) {
                relationships[k] = this[k];
            }
        }

        return relationships;
    }
}

export default SimpleJsonaModel;