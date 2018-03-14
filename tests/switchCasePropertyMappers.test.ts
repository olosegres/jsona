import * as chai from 'chai';
import {expect} from 'chai';
import {SwitchCaseJsonMapper, SwitchCaseModelMapper} from "../src/switchCasePropertyMappers";
import {RELATIONSHIP_NAMES_PROP} from "../src/simplePropertyMappers";
import Jsona from '../src';

chai.config.truncateThreshold = 0;

describe('switchCasePropertyMappers', () => {

    describe('SwitchCaseModelMapper', () => {
        let propertiesMapper;

        it(`should transform camelized model's attribute names to kebab case`, () => {
            propertiesMapper = new SwitchCaseModelMapper();
            const testModel = {
                fooBar: 1,
                fooFooBar: 123,
                'bar-foo': 2,
                'bar-foo-foo': 'foo',
                foo: 3,
                foo_bar: 5,
                foo234: 234,
            };
            const kebabAttributes = propertiesMapper.getAttributes(testModel);
            expect(kebabAttributes['foo-bar']).to.be.equal(1);
            expect(kebabAttributes['foo-foo-bar']).to.be.equal(123);
            expect(kebabAttributes['bar-foo']).to.be.equal(2);
            expect(kebabAttributes['bar-foo-foo']).to.be.equal('foo');
            expect(kebabAttributes['foo']).to.be.equal(3);
            expect(kebabAttributes['foo_bar']).to.be.equal(5);
            expect(kebabAttributes['foo-234']).to.be.equal(234);
        });
        it(`should transform camelized model's relationship names to kebab case`, () => {
            propertiesMapper = new SwitchCaseModelMapper();
            const relationOne = {};
            const relation2 = {};
            const testModel = {
                relationOne, relation2,
                [RELATIONSHIP_NAMES_PROP]: ['relationOne', 'relation2'],
            };


            const kebabRelationships = propertiesMapper.getRelationships(testModel);
            const kebabRelationshipNames = Object.keys(kebabRelationships);
            expect(kebabRelationshipNames.indexOf('relation-one') !== -1).to.be.true;
            expect(kebabRelationshipNames.indexOf('relation-2') !== -1).to.be.true;
        });

        it(`should transform camelized model's relationship attributes to kebab case`, () => {
            const relationOne = { type: 'relatedModel', id: 1, relatedCamelizedAttr: true };
            const testModel = { type: 'testModel', id: 1, relationOne, [RELATIONSHIP_NAMES_PROP]: ['relationOne'] };

            const dataFormatter = new Jsona({
                modelPropertiesMapper: new SwitchCaseModelMapper(),
                jsonPropertiesMapper: new SwitchCaseJsonMapper(),
            });

            const json = dataFormatter.serialize({ stuff: testModel, includeNames: ['relation-one'] });

            expect(json.included[0].attributes['related-camelized-attr']).to.be.true;
        });
    });

    describe('SwitchCaseJsonMapper', () => {
        let propertiesMapper;

        it(`should transform kebabized json's attribute names to camel case`, () => {
            propertiesMapper = new SwitchCaseJsonMapper();
            const model = {};
            const testAttributes = {
                fooBar: 1,
                fooFooBar: 123,
                'bar-foo': 2,
                'bar-foo-foo': 'foo',
                foo: 3,
                foo_bar: 5,
                'foo-234': 234,
            };
            propertiesMapper.setAttributes(model, testAttributes);

            expect(model['fooBar']).to.be.equal(1);
            expect(model['fooFooBar']).to.be.equal(123);
            expect(model['barFoo']).to.be.equal(2);
            expect(model['barFooFoo']).to.be.equal('foo');
            expect(model['foo']).to.be.equal(3);
            expect(model['foo_bar']).to.be.equal(5);
            expect(model['foo234']).to.be.equal(234);
        });

        it(`should transform kebabized json's relationship names to camel case`, () => {
            propertiesMapper = new SwitchCaseJsonMapper();
            const model = propertiesMapper.createModel('testModelType');
            const relation1 = {some: 'relation'};
            const relation2 = [relation1];
            const relation3 = () => {
                return 123;
            };
            const testRelations1 = {'relation-one': relation1, 'relation-2': relation2};
            const testRelations2 = {relation3};
            propertiesMapper.setRelationships(model, testRelations1);
            propertiesMapper.setRelationships(model, testRelations2);

            const relation3Descriptor = Object.getOwnPropertyDescriptor(model, 'relation3');

            expect(model.relationOne).to.be.equal(relation1);
            expect(model.relation2).to.be.equal(relation2);
            expect(typeof relation3Descriptor.get).to.be.equal('function');
            expect(model.relation3).to.be.equal(123);
        });


        it(`should transform kebabized json's relationship attributes to camel case`, () => {
            propertiesMapper = new SwitchCaseModelMapper();

            type TestModelType = {
                relation1: {
                    kebabAttr1: boolean,
                }
            };

            const textJson = {
                data: {
                    type: 'model-type',
                    id: 1,
                    relationships: {
                        'relation-1': {
                            data: {
                                type: 'related-model-1',
                                id: 1,
                            }
                        }
                    }
                },
                included: [{
                    type: 'related-model-1',
                    id: 1,
                    attributes: {
                        'kebab-attr-1': true,
                    }
                }],
            };

            const dataFormatter = new Jsona({
                modelPropertiesMapper: new SwitchCaseModelMapper(),
                jsonPropertiesMapper: new SwitchCaseJsonMapper(),
            });

            const model = <TestModelType>dataFormatter.deserialize(textJson);
            expect(model.relation1.kebabAttr1).to.be.true;
        });
    });

});