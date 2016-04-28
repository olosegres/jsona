'use strict';

import {
    IJsonaModelsFactory,
    IJsonaModel
} from '../JsonaInterfaces';

import SimpleJsonaModel from '../models/SimpleJsonaModel';

class SimpleModelsFactory implements IJsonaModelsFactory {

    getModel(entityType: string): IJsonaModel {
        var model = new SimpleJsonaModel();

        model.setType(entityType);

        return model;
    }

}

export default SimpleModelsFactory;