import { Injectable, RequestMethod } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { DiscoveryService } from "@nestjs/core";

import { API_DOC_METADATA, type ApiDocOptions } from "./decorators/api-doc.decorator";

export interface ApiEndpointDocumentation extends Omit<ApiDocOptions, "summary" | "description"> {
    method: string;
    path: string;
}

export type ApiDocumentation = Record<string, ApiEndpointDocumentation[]>;

const API_PREFIX = "api";

@Injectable()
export class DocsService {
    constructor(private readonly discoveryService: DiscoveryService) {}

    getDocumentation(): ApiDocumentation {
        const endpoints = this.discoveryService
            .getControllers()
            .flatMap((wrapper) => this.describeController(wrapper.metatype));

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
        const controllerPaths = this.getPaths(Reflect.getMetadata(PATH_METADATA, controller));

        console.log("Controller paths:", controllerPaths);

        return Object.getOwnPropertyNames(controller.prototype).flatMap(
            (handlerName) => {
                
                if (handlerName === "constructor") return [];
                
                const handler = controller.prototype[handlerName];
                const requestMethod = Reflect.getMetadata(METHOD_METADATA, handler);
                const method = RequestMethod[requestMethod];

                const handlerPaths = this.getPaths(
                    Reflect.getMetadata(PATH_METADATA, handler),
                );
                                
                const { ...metadata } = this.getDocumentationMetadata(handler);


                console.log(controllerPaths, handlerPaths, method, metadata);


                return controllerPaths.flatMap((controllerPath) =>
                    handlerPaths.map((handlerPath) => ({
                        method,
                        path: this.joinPaths(controllerPath, handlerPath),
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
