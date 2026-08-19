import { SetMetadata } from "@nestjs/common";

export const API_DOC_METADATA = "api-doc";

export interface ApiDocOptions {
    summary?: string;
    description?: string;
}

export const ApiDoc = (
    options: ApiDocOptions = {},
): ClassDecorator & MethodDecorator => SetMetadata(API_DOC_METADATA, options);
