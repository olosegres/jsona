
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
    setLinks(model: TJsonaModel, links: TAnyKeyValueObject): void;
    setResourceIdObjMeta(model: TJsonaModel, meta: TResourceIdObj): void;
    setRelationships(model: TJsonaModel, relationships: TJsonaRelationships): void;
    setRelationshipLinks(parentModel: TJsonaModel, relationName: string, links: TJsonApiLinks): void;
    setRelationshipMeta(parentModel: TJsonaModel, relationName: string, meta: TAnyKeyValueObject): void;
}

export interface IJsonaModelBuilder {
    build(): TJsonaModel | Array<TJsonaModel>;
}

export interface IDeserializeCache {
    getCachedModel(data: TJsonApiData): TJsonaModel | null;
    handleModel(model: TJsonaModel, data: TJsonApiData): void;
    createCacheKey(data: TJsonApiData): string;
}

export interface IDeserializeCacheConstructor {
    new(): IDeserializeCache;
}

export interface IJsonaDeserializer extends IJsonaModelBuilder {
    setDeserializeCache(dc: IDeserializeCache): void;
    setPropertiesMapper(pm: IJsonPropertiesMapper): void;
    setJsonParsedObject(body: TJsonApiBody): void;
    buildModelByData(data: TJsonApiData): TJsonaModel;
    buildRelationsByData(data: TJsonApiData, model: TJsonaModel): TJsonaRelationships | null;
    buildDataFromIncludedOrData(id: string | number, type: string): TJsonApiData;
    buildDataInObject(): { [key: string]: TJsonApiData };
    buildIncludedInObject(): { [key: string]: TJsonApiData };
}

export interface IJsonDeserializerConstructor {
    new(propertiesMapper: IJsonPropertiesMapper, deserializeCache: IDeserializeCache, options);
}

export interface IModelsSerializer {
    setPropertiesMapper(propertiesMapper: IModelPropertiesMapper);
    setStuff(stuff);
    setIncludeNames(includeNames: TJsonaDenormalizedIncludeNames | TJsonaNormalizedIncludeNamesTree);
    build(): TJsonApiBody;
    buildDataByModel(model: TJsonaModel | null): TJsonApiData;
    buildRelationshipsByModel(model: TJsonaModel);
    buildIncludedByModel(
        model: TJsonaModel,
        includeTree: TJsonaNormalizedIncludeNamesTree,
        builtIncluded: TJsonaUniqueIncluded
    ): void;
    buildIncludedItem(
        relationModel: TJsonaModel,
        subIncludeTree: TJsonaNormalizedIncludeNamesTree,
        builtIncluded: TJsonaUniqueIncluded
    );
}

export interface IModelsSerializerConstructor {
    new(propertiesMapper?: IModelPropertiesMapper): IModelsSerializer;
}

export type TDeserializeOptions = {
    preferNestedDataFromData?: boolean,
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
    links?: TJsonApiLinks;
    relationships?: TJsonApiRelationships;
};

export type TJsonApiRelationshipData = {
    type: string;
    id: string|number;
    meta?: TAnyKeyValueObject
};

export type TJsonApiRelation = {
    data: TJsonApiRelationshipData | Array<TJsonApiRelationshipData>
    links?: TJsonApiLinks
    meta?: TAnyKeyValueObject
};

export type TJsonApiLinks = {
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

export type TResourceIdObj = {
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

export type SwitchCaseModelMapperOptionsType = {
    switchAttributes?: boolean,
    switchRelationships?: boolean,
    switchType?: boolean,
    switchChar?: string,
};
export type SwitchCaseJsonMapperOptionsType = {
    camelizeAttributes?: boolean,
    camelizeRelationships?: boolean,
    camelizeType?: boolean,
    camelizeMeta?: boolean,
    switchChar?: string,
};
