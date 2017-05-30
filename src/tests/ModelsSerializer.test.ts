/// <reference path="../../typings/globals/mocha/index.d.ts" />
import * as chai from 'chai';
import {expect} from 'chai';
import ModelsSerializer from "../builders/ModelsSerializer";
import {SerializePropertiesMapper} from "../simplePropertyMappers";

import {
    includeNames1,
    user1,
    user2,
    article1,
    article2,
    country2,
    country1,
    town2,
    town1,
    specialty1,
    specialty2
} from './mocks';

chai.config.includeStack = true;
chai.config.showDiff = false;
chai.config.truncateThreshold = 0;

describe('ModelsSerializer', () => {
    let builder;
    let propertiesMapper;

    it('should instantiate without errors', () => {
        propertiesMapper = new SerializePropertiesMapper();
        builder = new ModelsSerializer(propertiesMapper);
        expect(builder).to.be.an.instanceof(ModelsSerializer);
    });

    it('should handle one model in setStuff', () => {
        builder.setStuff(user1.model);
        expect(builder.staff).to.be.deep.equal(user1.model);
    });

    it('should handle collection of models in setStuff', () => {
        builder.setStuff([user1.model, user2.model]);
        expect(builder.staff).to.be.deep.equal([user1.model, user2.model]);
    });

    it('should setIncludeNames with convertation to TJsonaNormalizedIncludeNamesTree', () => {
        builder.setIncludeNames(includeNames1.denormalized);
        expect(builder.includeNamesTree).to.be.deep.equal(includeNames1.normalized);
    });

    it('should setIncludeNames as they are', () => {
        builder.setIncludeNames(includeNames1.normalized);
        expect(builder.includeNamesTree).to.be.deep.equal(includeNames1.normalized);
    });

    it('shoild build correct json with one data-item, without included', () => {
        builder = new ModelsSerializer(propertiesMapper);

        builder.setStuff(user1.model);
        const json = builder.build();
        expect(json).to.be.deep.equal({data: user1.json});
    });

    it('shoild build correct json with one data-item, with included', () => {
        builder = new ModelsSerializer(propertiesMapper);

        builder.setStuff(user1.model);
        builder.setIncludeNames(user1.includeNames.townOnly);
        const json = builder.build();
        expect(json).to.be.deep.equal({data: user1.json, included: user1.included.townOnly});
    });

    it('shoild build correct json with collection of data items, with included', () => {
        builder = new ModelsSerializer(propertiesMapper);

        builder.setStuff([article1.model, article2.model]);

        builder.setIncludeNames([
            'author.town.contry',
            'author.specialty',
            'country'
        ]);

        const json = builder.build();

        expect(json).to.be.deep.equal({
            data: [
                article1.json, article2.json
            ],
            included: [ // sorting order make sense
                country1.json,
                country2.json,
                specialty1.json,
                specialty2.json,
                town1.json,
                town2.json,
                user1.json,
                user2.json,
            ]
        });

    });
});