export interface IJsonApiBody {
    data?: IJsonApiData | IJsonApiData[];
    included?: Array<IJsonApiData>;
    meta?: Object;
    links?: Object;
    error?: Object;
}

export interface IJsonApiData {
    type: string;
    id?: string|number;
    attributes?: Object;
    relationships?: Object;
    links?: Object;
}

export interface IPlainObjectModel {
    id?: string | number;
    type?: string;
    attributes?: Object;
    relationships?: Object;
}

export interface IJsonaUniqueIncluded {
    [entityType: string]: IJsonApiData
}

export interface IJsonaIncludeTree {
    [entityType: string]: IJsonaIncludeTree | string[]
}

export interface IJsonaRequestedFields {
    [entityType: string]: string[]
}

export interface IJsonaModelsFactory {
    getModel(entityType: string): IJsonaModel;
}

export interface IJsonaModel {
    getId(): string | number;
    getType(): string;
    getAttributes(): Object;
    getRelationships(): Object;

    setId(id: string | number): void;
    setType(entityType: string): void;
    setAttributes(attributes: Object): void;
    setRelationships(relationships: { [relationName: string]: IJsonaModel | IJsonaModel[] }): void;
}

export interface IJsonaRelations {
    [relationName: string]: IJsonaModel | IJsonaModel[]
}

export interface IJsonaSerializeParams {
    item?: IJsonaModel,
    collection?: IJsonaModel[],
    meta?: Object,
    error?: Object,
    requestedIncludes?: IJsonaIncludeTree
    requestedFields?: IJsonaRequestedFields
}
