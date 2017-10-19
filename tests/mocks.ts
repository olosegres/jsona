import {RELATIONSHIP_NAMES_PROP} from '../src/simplePropertyMappers';

export const country2 = {
    model: {
        type: 'country',
        id: '34',
        name: 'Spain',
    },
    json: {
        type: 'country',
        id: '34',
        attributes: {
            name: 'Spain',
        }
    }
};

export const country1 = {
    model: {
        type: 'country',
        id: '86',
        name: 'China',
    },
    json: {
        type: 'country',
        id: '86',
        attributes: {
            name: 'China',
        }
    }
};

export const town1 = {
    model: {
        type: 'town',
        id: '21',
        name: 'Shanghai',
        country: country1.model,
        [RELATIONSHIP_NAMES_PROP]: ['country']
    },
    json: {
        type: 'town',
        id: '21',
        attributes: {
            name: 'Shanghai',
        },
        relationships: {
            country: {
                data: {
                    type: 'country',
                    id: country1.model.id,
                }
            }
        }
    }
};

export const town2 = {
    model: {
        type: 'town',
        id: '80',
        name: 'Barcelona',
        country: country2.model,
        [RELATIONSHIP_NAMES_PROP]: ['country']
    },
    json: {
        type: 'town',
        id: '80',
        attributes: {
            name: 'Barcelona',
        },
        relationships: {
            country: {
                data: {
                    type: 'country',
                    id: country2.model.id,
                }
            }
        }
    }
};

export const specialty1 = {
    model: {
        type: 'specialty',
        id: '1',
        title: 'mycategory1'
    },
    json: {
        type: 'specialty',
        id: '1',
        attributes: {
            title: 'mycategory1'
        }
    }
};

export const specialty2 = {
    model: {
        type: 'specialty',
        id: '2',
        title: 'mycategory2'
    },
    json: {
        type: 'specialty',
        id: '2',
        attributes: {
            title: 'mycategory2'
        }
    }
};

export const user1 = {
    model: {
        type: 'user',
        id: '1',
        name: 'myName1',
        active: false,
        town: town1.model,
        specialty: [specialty1.model],
        [RELATIONSHIP_NAMES_PROP]: ['town', 'specialty']
    },
    json: {
        type: 'user',
        id: '1',
        attributes: {
            name: 'myName1',
            active: false,
        },
        relationships: {
            town: {
                data: {
                    type: 'town',
                    id: town1.model.id,
                }
            },
            specialty: {
                data: [{
                    type: 'specialty',
                    id: specialty1.model.id
                }]
            }
        }
    },
    included: {
        townOnly: [
            town1.json
        ]
    }
};

export const user2 = {
    model: {
        type: 'user',
        id: '2',
        name: 'myName2',
        active: true,
        town: town2.model,
        specialty: [specialty1.model, specialty2.model],
        [RELATIONSHIP_NAMES_PROP]: ['town', 'specialty']
    },
    modelWithoutIncluded: {
        type: 'user',
        id: '2',
        name: 'myName2',
        active: true,
        town: {
            id: town2.model.id,
            type: town2.model.type,
        },
        specialty: [{
            id: specialty1.model.id,
            type: specialty1.model.type,
        }, {
            id: specialty2.model.id,
            type: specialty2.model.type,
        }],
        [RELATIONSHIP_NAMES_PROP]: ['town', 'specialty']
    },
    json: {
        type: 'user',
        id: '2',
        attributes: {
            name: 'myName2',
            active: true,
        },
        relationships: {
            town: {
                data: {
                    type: 'town',
                    id: town2.model.id,
                }
            },
            specialty: {
                data: [{
                    type: 'specialty',
                    id: specialty1.model.id
                }, {
                    type: 'specialty',
                    id: specialty2.model.id
                }]
            }
        }
    },
    includeNames: {
        townOnly: ['town']
    },
    included: {
        townOnly: [
            town2.json
        ]
    }
};

export const article1 = {
    model: {
        type: 'article',
        id: 1,
        likes: 5550,
        author: user1.model,
        country: country1.model,
        [RELATIONSHIP_NAMES_PROP]: ['author', 'country']
    },
    json: {
        type: 'article',
        id: 1,
        attributes: {
            likes: 5550
        },
        relationships: {
            author: {
                data: {
                    type: 'user',
                    id: user1.model.id
                }
            },
            country: {
                data: {
                    type: 'country',
                    id: country1.model.id
                }
            }
        }
    }
};

export const article2 = {
    model: {
        type: 'article',
        id: 2,
        likes: 100,
        author: user2.model,
        country: country2.model,
        [RELATIONSHIP_NAMES_PROP]: ['author', 'country']
    },
    json: {
        type: 'article',
        id: 2,
        attributes: {
            likes: 100
        },
        relationships: {
            author: {
                data: {
                    type: 'user',
                    id: user2.model.id,
                }
            },
            country: {
                data: {
                    type: 'country',
                    id: country2.model.id,
                }
            }
        }
    },
    includeNames: [
        'author.town.contry',
        'author.specialty',
        'country'
    ],
};

export const articleWithoutAuthor = {
    model: {
        type: 'article',
        id: 3,
        likes: 0,
        author: null,
        [RELATIONSHIP_NAMES_PROP]: ['author']
    },
    json: {
        type: 'article',
        id: 3,
        attributes: {
            likes: 0,
        },
        relationships: {
            author: {
                data: null,
            },
        },
    },
    includeNames: [
        'author'
    ],
};

const circularModel = {
    type: 'model',
    id: '1',
    relationshipNames: ['simpleRelation'],
};

const circularSubmodel = {
    type: 'subModel',
    id: '1',
    relationshipNames: ['circularRelation'],
};

circularModel.simpleRelation = circularSubmodel;
circularSubmodel.circularRelation = circularModel;

export const circular = {
    model: circularModel,
    json: {
        "data": {
            "type": "model",
            "id": "1",
            "relationships": {
                "simpleRelation": {
                    "data": {
                        "type": "subModel",
                        "id": "1"
                    }
                },
            }
        },
        "included": [
            {
                "type": "subModel",
                "id": "1",
                "relationships": {
                    "circularRelation": {
                        "data": {
                            "type": "model",
                            "id": "1"
                        }
                    }
                }
            }
        ]
    },
};

export const includeNames1 = {
    denormalized: [
        'articles.author.town.country',
        'articles.country',
        'country',
    ],
    normalized: {
        country: null,
        articles: {
            author: {
                town: {
                    country: null
                }
            },
            country: null
        }
    }
};

export const reduxObject1 = {
    "article": {
        "1": {
            "id": 1,
            "attributes": {"likes": 5550},
            "relationships": {
                "author": {"data": {"id": '1', "type": "user"}},
                "country": {"data": {"id": '86', "type": "country"}}
            }
        },
        "2": {
            "id": 2,
            "attributes": {"likes": 100},
            "relationships": {
                "author": {"data": {"id": '2', "type": "user"}},
                "country": {"data": {"id": '34', "type": "country"}}
            }
        }
    },
    "country": {
        "34": {"id": '34', "attributes": {"name": "Spain"}},
        "86": {"id": '86', "attributes": {"name": "China"}}},
    "specialty": {
        "1": {"id": "1", "attributes": {"title": "mycategory1"}},
        "2": {"id": "2", "attributes": {"title": "mycategory2"}}
    },
    "town": {
        "21": {
            "id": '21',
            "attributes": {"name": "Shanghai"},
            "relationships": {"country": {"data": {"id": '86', "type": "country"}}}
        },
        "80": {
            "id": '80',
            "attributes": {"name": "Barcelona"},
            "relationships": {"country": {"data": {"id": '34', "type": "country"}}}
        }
    },
    "user": {
        "1": {
            "id": '1',
            "attributes": {"name": "myName1", "active": false},
            "relationships": {
                "town": {"data": {"id": '21', "type": "town"}},
                "specialty": {
                    "data": [{"id": "1", "type": "specialty"}]
                }
            }
        },
        "2": {
            "id": '2',
            "attributes": {"name": "myName2", "active": true},
            "relationships": {
                "town": {
                    "data": {"id": '80', "type": "town"}},
                "specialty": {
                    "data": [
                        {"id": "1", "type": "specialty"},
                        {"id": "2", "type": "specialty"}
                    ]
                }
            }
        }
    }
};


export const circular = {
    model: circularModel,
    json: {
        "data": {
            "type": "model",
            "id": "1",
            "relationships": {
                "simpleRelation": {
                    "data": {
                        "type": "subModel",
                        "id": "1"
                    }
                },
            }
        },
        "included": [
            {
                "type": "subModel",
                "id": "1",
                "relationships": {
                    "circularRelation": {
                        "data": {
                            "type": "model",
                            "id": "1"
                        }
                    }
                }
            }
        ]
    },
};

export const reduxObjectWithCircular = {
    model: {
        '1': {
            "id": "1",
            "relationships": {
                "simpleRelation": {
                    "data": {
                        "type": "subModel",
                        "id": "1"
                    }
                },
            }
        }
    },
    subModel: {
        '1': {
            "id": "1",
            "relationships": {
                "circularRelation": {
                    "data": {
                        "type": "model",
                        "id": "1"
                    }
                },
            }
        }
    },
};