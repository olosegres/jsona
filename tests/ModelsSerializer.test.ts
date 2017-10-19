/// <reference path="../typings/globals/mocha/index.d.ts" />
import * as chai from 'chai';
import {expect} from 'chai';
import ModelsSerializer from "../src/builders/ModelsSerializer";
import {ModelPropertiesMapper} from "../src/simplePropertyMappers";

import {
    includeNames1,
    user2,
    user1,
    article1,
    article2,
    articleWithoutAuthor,
    country1,
    country2,
    town2,
    town1,
    specialty1,
    specialty2,
} from './mocks';

chai.config.truncateThreshold = 0;

describe('ModelsSerializer', () => {
    let builder;
    let propertiesMapper;

    it('should throw Error if jsonPropertiesMapper is not passed', () => {
        builder = new ModelsSerializer();
        builder.setStuff(user2.model);
        expect(builder.build.bind(builder)).to.throw(Error, 'propertiesMapper');
    });

    it('should instantiate without errors', () => {
        propertiesMapper = new ModelPropertiesMapper();
        builder = new ModelsSerializer(propertiesMapper);
        expect(builder).to.be.an.instanceof(ModelsSerializer);
    });

    it('should handle one model in setStuff', () => {
        builder.setStuff(user2.model);
        expect(builder.staff).to.be.deep.equal(user2.model);
    });

    it('should handle collection of models in setStuff', () => {
        builder.setStuff([user2.model, user1.model]);
        expect(builder.staff).to.be.deep.equal([user2.model, user1.model]);
    });

    it('should setIncludeNames with convertation to TJsonaNormalizedIncludeNamesTree', () => {
        builder.setIncludeNames(includeNames1.denormalized);
        expect(builder.includeNamesTree).to.be.deep.equal(includeNames1.normalized);
    });

    it('should setIncludeNames as they are', () => {
        builder.setIncludeNames(includeNames1.normalized);
        expect(builder.includeNamesTree).to.be.deep.equal(includeNames1.normalized);
    });

    it('should build correct json with one data-item, without included', () => {
        builder = new ModelsSerializer(propertiesMapper);

        builder.setStuff(article1.model);
        const json = builder.build();
        expect(json).to.be.deep.equal({data: article1.json});
    });

    it('should build correct json with one data-item, with included', () => {
        builder = new ModelsSerializer(propertiesMapper);

        builder.setStuff(user2.model);
        builder.setIncludeNames(user2.includeNames.townOnly);
        const json = builder.build();
        expect(json).to.be.deep.equal({data: user2.json, included: user2.included.townOnly});
    });

    it('should build correct json with collection of data items, with included', () => {
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
                country2.json,
                country1.json,
                specialty1.json,
                specialty2.json,
                town1.json,
                town2.json,
                user1.json,
                user2.json,
            ]
        });

    });

    it('should build json with null data for nulled relation', () => {
        builder = new ModelsSerializer(propertiesMapper);

        builder.setStuff(articleWithoutAuthor.model);
        builder.setIncludeNames(articleWithoutAuthor.includeNames);
        const json = builder.build();
        expect(json).to.be.deep.equal({ data: articleWithoutAuthor.json });
    });
});