import { SetMetadata } from "@nestjs/common";

export const API_DOC_METADATA = "api-doc";

export interface ApiDocParamOptions {
    type?: string;
    description?: string;
}

export interface ApiDocOptions {
    summary?: string;
    description?: string;
    tags?: string[];
    params?: Record<string, ApiDocParamOptions>;
}

export const ApiDoc = (
    options: ApiDocOptions = {},
): ClassDecorator & MethodDecorator => SetMetadata(API_DOC_METADATA, options);
