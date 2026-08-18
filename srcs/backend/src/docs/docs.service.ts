import { Injectable, RequestMethod } from "@nestjs/common";
import { METHOD_METADATA, PARAMTYPES_METADATA,
    PATH_METADATA, ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { DiscoveryService } from "@nestjs/core";

import { API_DOC_METADATA, type ApiDocParamOptions, type ApiDocOptions,
} from "./decorators/api-doc.decorator";

export interface ApiEndpointDocumentation extends Omit<ApiDocOptions, "params"> {
    method: string;
    path: string;
    params: ApiParameterDocumentation[];
}

export interface ApiParameterDocumentation extends ApiDocParamOptions {
    name: string;
    in: "path" | "query" | "body" | "header";
    type: string;
}

export type ApiDocumentation = Record<string, ApiEndpointDocumentation[]>;

const API_PREFIX = "api";

@Injectable()
export class DocsService {
    constructor(private readonly discoveryService: DiscoveryService) {}

    getDocumentation(): ApiDocumentation {
        const endpoints = this.discoveryService
            .getControllers()
            .flatMap((wrapper) => this.describeController(wrapper.metatype))
            .sort((left, right) =>
                `${left.path}:${left.method}`.localeCompare(
                    `${right.path}:${right.method}`,
                ),
            );

        return endpoints.reduce<ApiDocumentation>((documentation, endpoint) => {
            const resourceName = this.getResourceName(endpoint.path);

            (documentation[resourceName] ??= []).push(endpoint);
            return documentation;
        }, {});
    }

    private describeController(controller: any): ApiEndpointDocumentation[] {
        if (!controller?.prototype) {
            return [];
        }
        const controllerPaths = this.getPaths(
            Reflect.getMetadata(PATH_METADATA, controller),
        );

        const controllerDocumentation = this.getDocumentationMetadata(controller);

        return Object.getOwnPropertyNames(controller.prototype).flatMap(
            (handlerName) => {
                if (handlerName === "constructor") {
                    return [];
                }

                const handler = controller.prototype[handlerName];
                
                const requestMethod = Reflect.getMetadata( METHOD_METADATA, handler ) as RequestMethod | undefined;
                
                if (typeof handler !== "function" || requestMethod === undefined) {
                    return [];
                }

                console.log(requestMethod, handlerName, controller.name);

                const method = RequestMethod[requestMethod];
                const handlerPaths = this.getPaths(
                    Reflect.getMetadata(PATH_METADATA, handler),
                );
                const documentation = {
                    ...controllerDocumentation,
                    ...this.getDocumentationMetadata(handler),
                };
                const { params: documentedParams, ...metadata } = documentation;

                return controllerPaths.flatMap((controllerPath) =>
                    handlerPaths.map((handlerPath) => ({
                        method,
                        path: this.joinPaths(controllerPath, handlerPath),
                        params: [],
                        ...metadata,
                    })),
                );
            },
        );
    }

    private getDocumentationMetadata(target: object): ApiDocOptions {
        return Reflect.getMetadata(API_DOC_METADATA, target) ?? {};
    }

    private getPaths(path: string | string[] | undefined): string[] {
        if (Array.isArray(path)) {
            return path.length ? path : [""];
        }

        return [path ?? ""];
    }

    private joinPaths(controllerPath: string, handlerPath: string): string {
        const segments = [API_PREFIX, controllerPath, handlerPath]
            .flatMap((path) => path.split("/"))
            .filter(Boolean);

        return `/${segments.join("/")}`;
    }

    private getResourceName(path: string): string {
        return path.split("/").filter(Boolean)[1] ?? "root";
    }
}
