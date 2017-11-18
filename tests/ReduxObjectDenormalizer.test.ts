import * as chai from 'chai';
import {expect} from 'chai';
import ReduxObjectDenormalizer from "../src/builders/ReduxObjectDenormalizer";
import {JsonPropertiesMapper} from "../src/simplePropertyMappers";

import {
    reduxObject1,
    article1,
    country2,
    specialty1,
    specialty2,
    user2
} from './mocks';

chai.config.showDiff = true;
chai.config.truncateThreshold = 0;

describe('ReduxObjectDenormalizer', () => {
    let builder;
    let propertiesMapper;

    it('should instantiate without errors', () => {
        propertiesMapper = new JsonPropertiesMapper();
        builder = new ReduxObjectDenormalizer(propertiesMapper);
    });

    it('should have public setters', () => {
        expect(typeof builder.setReduxObject).to.be.equal('function');
        expect(typeof builder.setEntityType).to.be.equal('function');
        expect(typeof builder.setEntityIds).to.be.equal('function');
        expect(typeof builder.setReturnBuilderInRelations).to.be.equal('function');
    });

    describe('build', () => {

        it('should throw Error if propertiesMapper is not set', () => {
            builder = new ReduxObjectDenormalizer(null);
            const build = builder.build.bind(builder);
            expect(build).to.throw(Error, 'propertiesMapper');
        });

        it('should throw Error if reduxObject is not set', () => {
            builder.setPropertiesMapper(propertiesMapper);
            const build = builder.build.bind(builder);
            expect(build).to.throw(Error, 'reduxObject');
        });

        it('should throw Error if entityType is not set', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject({});
            const build = builder.build.bind(builder);
            expect(build).to.throw(Error, 'entityType');
        });

        it('should return null if no needed type in ReduxObject', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject({});
            builder.setEntityType('myEntity');
            expect(builder.build()).to.be.equal(null);
        });

        it('should return null if no needed id in ReduxObject', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject(reduxObject1);
            builder.setEntityType('town');
            builder.setEntityIds('21343');
            expect(builder.build()).to.be.equal(null);
        });

        it('should return null if there is empty object for some type in ReduxObject', () => {
            builder = new ReduxObjectDenormalizer(propertiesMapper);
            builder.setReduxObject({town: {}});
            builder.setEntityType('town');
            expect(builder.build()).to.be.equal(null);
        });

        it('should return one model with correct number type of id', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject(reduxObject1);
            builder.setEntityType('article');
            builder.setEntityIds('1');
            builder.setReturnBuilderInRelations(false);
            expect(builder.build()).to.be.deep.equal(article1.model);
        });

        it('should return collection of models', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject(reduxObject1);
            builder.setEntityType('specialty');
            builder.setEntityIds(['1', '2']);
            expect(builder.build()).to.be.deep.equal([specialty1.model, specialty2.model]);
        });

        it('should return collection of one model with multiple relations', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject(reduxObject1);
            builder.setEntityType('user');
            builder.setEntityIds(['2']);
            expect(builder.build()).to.be.deep.equal([user2.model]);
        });
    });


    describe('buildModel', () => {
        it('should return null if no such type in reduxObject', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject({});
            expect(builder.buildModel('user', '123')).to.be.equal(null);
        });

        it('should return null if no such id in reduxObject', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject({user: {}});
            expect(builder.buildModel('user', '123')).to.be.equal(null);
        });
    });

    describe('buildRelationships', () => {
        it('should return null', () => {
            const model = {};
            expect(builder.buildRelationships()).to.be.equal(null);
            expect(builder.buildRelationships({})).to.be.equal(null);
            expect(builder.buildRelationships(model, {someRelation: null})).to.be.equal(null);
            expect(builder.buildRelationships(model, {someRelation: {data: null}})).to.be.equal(null);
        });

        it('should return relations with builders', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject(reduxObject1);
            builder.setReturnBuilderInRelations(true);
            const model = {};
            const relations1 = builder.buildRelationships(model, reduxObject1.town['80'].relationships);
            expect(typeof relations1.country).to.be.equal('function');
            expect(relations1.country()).to.be.deep.equal(country2.model);
        });

        it('should return relations without builders', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject(reduxObject1);
            builder.setReturnBuilderInRelations(false);
            const model = {};
            const relations1 = builder.buildRelationships(model, reduxObject1.town['80'].relationships);
            expect(relations1.country).to.be.deep.equal(country2.model);
        });
    });

    describe('buildRelationModels', () => {

        it('should return null', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject(reduxObject1);
            builder.setReturnBuilderInRelations(false);

            const builtModel = builder.buildRelationModels({});
            expect(builtModel).to.be.equal(null);
        });

        it('should return one model', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject(reduxObject1);
            builder.setReturnBuilderInRelations(false);

            const builtModel = builder.buildRelationModels(reduxObject1.town['80'].relationships.country.data);
            expect(builtModel).to.be.deep.equal(country2.model);
        });

        it('should return collection of models', () => {
            builder.setPropertiesMapper(propertiesMapper);
            builder.setReduxObject(reduxObject1);
            builder.setReturnBuilderInRelations(false);

            const builtModels = builder.buildRelationModels(reduxObject1.user['2'].relationships.specialty.data);
            expect(builtModels).to.be.deep.equal([specialty1.model, specialty2.model]);
        });
    });

});