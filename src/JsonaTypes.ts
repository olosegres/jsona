export interface TJsonaModelsFactory {
    getModel(entityType: string): TJsonaModel;
}

export interface ISerializePropertiesMapper {
    getId(model: TJsonaModel): string | number;
    getType(model: TJsonaModel): string;
    getAttributes(model: TJsonaModel): TAnyKeyValueObject;
    getRelationships(model: TJsonaModel): TJsonaRelationships;
}

export interface IDeserializePropertiesMapper {
    createModel(type: string): TJsonaModel;
    setId(model: TJsonaModel, id: string | number): void;
    setAttributes(model: TJsonaModel, attributes: TAnyKeyValueObject): void;
    setRelationships(model: TJsonaModel, relationships: TJsonaRelationships): void;
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
    relationships?: TJsonApiRelationships;
};

export type TJsonApiRelationshipData = {
    type: string;
    id: string|number;
};

export type TJsonApiRelationships = {
    [relationName: string]: {
        data: TJsonApiRelationshipData | Array<TJsonApiRelationshipData>
    }
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

export type TJsonaRelationships = {
    [relationName: string]: TJsonaModel | Array<TJsonaModel>
};