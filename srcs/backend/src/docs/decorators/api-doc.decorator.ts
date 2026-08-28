import { SetMetadata } from "@nestjs/common";

export const API_DOC_METADATA = "api-doc";

export type ParamType = string | [field: string, type: string][];

export interface Params {
    name: string;
    in: "body" | "query" | "param" | "header" | "unknown";
    type?: ParamType;
    required: boolean;
}

export interface ApiDoc {
    summary?: string;
    description?: string;
    params?: Params[];
}

export const ApiDoc = (options: ApiDoc = {}): ClassDecorator & MethodDecorator => SetMetadata(API_DOC_METADATA, options);
