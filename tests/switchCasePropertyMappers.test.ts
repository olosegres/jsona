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
                nestedFooBar: {
                    nestedFooBar: 1
                }
            };
            const kebabAttributes = propertiesMapper.getAttributes(testModel);
            expect(kebabAttributes['foo-bar']).to.be.equal(1);
            expect(kebabAttributes['foo-foo-bar']).to.be.equal(123);
            expect(kebabAttributes['bar-foo']).to.be.equal(2);
            expect(kebabAttributes['bar-foo-foo']).to.be.equal('foo');
            expect(kebabAttributes['foo']).to.be.equal(3);
            expect(kebabAttributes['foo_bar']).to.be.equal(5);
            expect(kebabAttributes['foo-234']).to.be.equal(234);
            expect(kebabAttributes['nested-foo-bar']).to.be.deep.equal({ 'nested-foo-bar': 1 })
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

        it(`can be configured to transform camelized model's relationship names to snake case`, () => {
            propertiesMapper = new SwitchCaseModelMapper({ switchChar: '_'});
            const relationOne = {};
            const relation2 = {};
            const testModel = {
                relationOne, relation2,
                [RELATIONSHIP_NAMES_PROP]: ['relationOne', 'relation2'],
            };


            const snakeRelationships = propertiesMapper.getRelationships(testModel);
            const snakeRelationshipNames = Object.keys(snakeRelationships);
            expect(snakeRelationshipNames.indexOf('relation_one') !== -1).to.be.true;
            expect(snakeRelationshipNames.indexOf('relation_2') !== -1).to.be.true;
        });

        it(`can be configured to transform camelized model's relationship attributes to snake case`, () => {
            const relationOne = { type: 'relatedModel', id: 1, relatedCamelizedAttr: true };
            const testModel = { type: 'testModel', id: 1, relationOne, [RELATIONSHIP_NAMES_PROP]: ['relationOne'] };

            const dataFormatter = new Jsona({
                modelPropertiesMapper: new SwitchCaseModelMapper({ switchChar: '_'}),
                jsonPropertiesMapper: new SwitchCaseJsonMapper(),
            });

            const json = dataFormatter.serialize({ stuff: testModel, includeNames: ['relation_one'] });

            expect(json.included[0].attributes['related_camelized_attr']).to.be.true;
        });

        it(`can be configured to transform camelized model's attribute names to snake case`, () => {
            propertiesMapper = new SwitchCaseModelMapper({switchChar: '_'});
            const testModel = {
                fooBar: 1,
                fooFooBar: 123,
                bar_foo: 2,
                bar_foo_foo: 'foo',
                foo: 3,
                'foo-bar': 5,
                foo234: 234,
                nestedFooBar: {
                    nestedFooBar: 1
                }
            };
            const snakeAttributes = propertiesMapper.getAttributes(testModel);
            expect(snakeAttributes.foo_bar).to.be.equal(1);
            expect(snakeAttributes.foo_foo_bar).to.be.equal(123);
            expect(snakeAttributes.bar_foo).to.be.equal(2);
            expect(snakeAttributes.bar_foo_foo).to.be.equal('foo');
            expect(snakeAttributes.foo).to.be.equal(3);
            expect(snakeAttributes['foo-bar']).to.be.equal(5);
            expect(snakeAttributes.foo_234).to.be.equal(234);
            expect(snakeAttributes['nested_foo_bar']).to.be.deep.equal({ 'nested_foo_bar': 1 })
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
                nestedFooBar: { 
                    nestedFooBar: 1
                },
                'nested-bar-foo': { 
                    'nested-bar-foo': 2
                },
            };
            propertiesMapper.setAttributes(model, testAttributes);

            expect(model['fooBar']).to.be.equal(1);
            expect(model['fooFooBar']).to.be.equal(123);
            expect(model['barFoo']).to.be.equal(2);
            expect(model['barFooFoo']).to.be.equal('foo');
            expect(model['foo']).to.be.equal(3);
            expect(model['foo_bar']).to.be.equal(5);
            expect(model['foo234']).to.be.equal(234);
            expect(model['nestedFooBar']).to.be.deep.equal({ nestedFooBar: 1 })
            expect(model['nestedBarFoo']).to.be.deep.equal({ nestedBarFoo: 2 })
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

        it(`can be configured to transform snake case json's attribute names to camel case`, () => {
                propertiesMapper = new SwitchCaseJsonMapper({switchChar: '_'});
            const model = {};
            const testAttributes = {
                fooBar: 1,
                fooFooBar: 123,
                bar_foo: 2,
                bar_foo_foo: 'foo',
                foo: 3,
                'foo-bar': 5,
                foo_234: 234,
                nested_foo_bar: {
                    nested_foo_bar: 123
                }
            };
            propertiesMapper.setAttributes(model, testAttributes);

            expect(model['fooBar']).to.be.equal(1);
            expect(model['fooFooBar']).to.be.equal(123);
            expect(model['barFoo']).to.be.equal(2);
            expect(model['barFooFoo']).to.be.equal('foo');
            expect(model['foo']).to.be.equal(3);
            expect(model['foo-bar']).to.be.equal(5);
            expect(model['foo234']).to.be.equal(234);
            expect(model['nestedFooBar']).to.be.deep.equal({ nestedFooBar: 123 })
        });

        it(`can be configured to transform snaked json's relationship names to camel case`, () => {
            propertiesMapper = new SwitchCaseJsonMapper({switchChar: '_'});
            const model = propertiesMapper.createModel('testModelType');
            const relation1 = {some: 'relation'};
            const relation2 = [relation1];
            const relation3 = () => {
                return 123;
            };
            const testRelations1 = {'relation_one': relation1, 'relation_2': relation2};
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
            propertiesMapper = new SwitchCaseModelMapper({switchChar: '_'});

            type TestModelType = {
                relation1: {
                    kebabAttr1: boolean,
                }
            };

            const textJson = {
                data: {
                    type: 'model_type',
                    id: 1,
                    relationships: {
                        'relation_1': {
                            data: {
                                type: 'related_model_1',
                                id: 1,
                            }
                        }
                    }
                },
                included: [{
                    type: 'related_model_1',
                    id: 1,
                    attributes: {
                        'kebab_attr_1': true,
                    }
                }],
            };

            const dataFormatter = new Jsona({
                modelPropertiesMapper: new SwitchCaseModelMapper(),
                jsonPropertiesMapper: new SwitchCaseJsonMapper({ switchChar: '_'}),
            });

            const model = <TestModelType>dataFormatter.deserialize(textJson);
            expect(model.relation1.kebabAttr1).to.be.true;
        });


        it(`should transform kebabized json's meta names to camel case`, () => {
            propertiesMapper = new SwitchCaseJsonMapper({ camelizeMeta: true });
            const model = { meta: {} };
            const testMeta = {
                fooBar: 1,
                'bar-foo': 2,
                foo: 3,
                foo_bar: 5,
                'foo-234': 234,
            };
            propertiesMapper.setMeta(model, testMeta);

            expect(model.meta['fooBar']).to.be.equal(1);
            expect(model.meta['barFoo']).to.be.equal(2);
            expect(model.meta['foo']).to.be.equal(3);
            expect(model.meta['foo_bar']).to.be.equal(5);
            expect(model.meta['foo234']).to.be.equal(234);
        });

        it(`should not transform kebabized json's meta names to camel case`, () => {
            propertiesMapper = new SwitchCaseJsonMapper();
            const model = { meta: {} };
            const testMeta = {
                fooBar: 1,
                'bar-foo': 2,
                foo: 3,
                foo_bar: 5,
                'foo-234': 234,
            };
            propertiesMapper.setMeta(model, testMeta);

            expect(model.meta['fooBar']).to.be.equal(1);
            expect(model.meta['bar-foo']).to.be.equal(2);
            expect(model.meta['foo']).to.be.equal(3);
            expect(model.meta['foo_bar']).to.be.equal(5);
            expect(model.meta['foo-234']).to.be.equal(234);
        });
    });

});
