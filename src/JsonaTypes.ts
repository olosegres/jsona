
export interface IModelPropertiesMapper {
    getId(model: TJsonaModel): string | number;
    getType(model: TJsonaModel): string;
    getAttributes(model: TJsonaModel): TAnyKeyValueObject;
    getRelationships(model: TJsonaModel): TJsonaRelationships;
}

export interface IJsonPropertiesMapper {
    createModel(type: string): TJsonaModel;
    setId(model: TJsonaModel, id: string | number): void;
    setAttributes(model: TJsonaModel, attributes: TAnyKeyValueObject): void;
    setMeta(model: TJsonaModel, meta: TAnyKeyValueObject): void;
    setRelationships(model: TJsonaModel, relationships: TJsonaRelationships): void;
    setRelationshipLinks(parentModel: TJsonaModel, relationName: string, links: IJsonApiRelationLinks): void;
}

export interface IJsonaModelBuilder {
    build(): TJsonaModel | Array<TJsonaModel>;
}

export type TAnyKeyValueObject = {
    [key: string]: any
};

export type TJsonApiBody = {
    data?: TJsonApiData | TJsonApiData[];
    included?: Array<TJsonApiData>;
};

export type TJsonApiData = {
    type: string;
    id?: string|number;
    attributes?: TAnyKeyValueObject;
    meta?: TAnyKeyValueObject;
    relationships?: TJsonApiRelationships;
};

export type TJsonApiRelationshipData = {
    type: string;
    id: string|number;
};

export type TJsonApiRelation = {
    data: TJsonApiRelationshipData | Array<TJsonApiRelationshipData>
    links?: IJsonApiRelationLinks
};

export type IJsonApiRelationLinks = {
    self: string,
    related: string
};

export type TJsonApiRelationships = {
    [relationName: string]: TJsonApiRelation
};

export type TJsonaUniqueIncluded = {
    [entityTypeId: string]: TJsonApiData
};

/**
 * TJsonaDenormalizedIncludeNames example:
 * 'user.town.country'
 */
export type TJsonaIncludeNamesChain = string;

/**
 * TJsonaDenormalizedIncludeNames example:
 * ['user', 'user.town', 'user.town.country', 'comments', 'comments.author']
 */
export type TJsonaDenormalizedIncludeNames = Array<TJsonaIncludeNamesChain>;

/**
 * TJsonaNormalizedIncludeNamesTree example:
 * {
 *  user: {
 *      town: {
 *          country: null
 *      }
 *  comments: {
 *      author: null
 *  }
 */
export type TJsonaNormalizedIncludeNamesTree = {
    [relationName: string]: null | TJsonaNormalizedIncludeNamesTree
};

export type TJsonaModel = {
    [propertyName: string]: any
};

export type TJsonaRelationshipBuild = () => (TJsonaModel | Array<TJsonaModel>);
export type TJsonaRelationships = {
    [relationName: string]: TJsonaRelationshipBuild | TJsonaModel | Array<TJsonaModel>
};

export type TReduxObject = {
    [entityType: string]: {
        [entityId: string]: TReduxObjectModel
    }
};

export type TReduxObjectModel = {
    id: number | string,
    attributes?: TAnyKeyValueObject,
    relationships?: TJsonApiRelationships
};

export type TReduxObjectRelation = {
    data: {
        // '1' or something like '1,12,44' for one-to-many relationships, ['1', '12', '44'] is reserved for future
        id: string | Array<string>,
        type: string,
    }
}
