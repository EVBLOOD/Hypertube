import { Injectable, RequestMethod } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA, PARAMTYPES_METADATA, ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { DiscoveryService } from "@nestjs/core";

import { API_DOC_METADATA, type ApiDoc, type Params } from "./decorators/api-doc.decorator";

export interface ApiEndpointDocumentation extends Omit<ApiDoc, "summary" | "description"> {
    method: string;
    path: string;
}

export type ApiDocumentation = Record<string, ApiEndpointDocumentation[]>;

@Injectable()
export class DocsService {
    constructor(private readonly discoveryService: DiscoveryService) {}

    private getResourceName(path: string): string {
        return path.split("/").filter(Boolean)[1] ?? "root";
    }

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


        return Object.getOwnPropertyNames(controller.prototype).flatMap(
            (handlerName) => {
                
                if (handlerName === "constructor") return [];
                
                const handler = controller.prototype[handlerName];
                const requestMethod = Reflect.getMetadata(METHOD_METADATA, handler);

                const method = RequestMethod[requestMethod];

                const params = this.getParameters(controller, handlerName);


                const handlerPaths = this.getPaths(
                    Reflect.getMetadata(PATH_METADATA, handler),
                );
                                
                const { ...metadata } = this.getDocumentationMetadata(handler);

                return controllerPaths.flatMap((controllerPath) =>
                    handlerPaths.map((handlerPath) => ({
                        method,
                        path: this.joinPaths(controllerPath, handlerPath),
                        params,
                        ...metadata,
                    })),
                );
            },
        );
    }

    private getDocumentationMetadata(target: object): ApiDoc {
        return Reflect.getMetadata(API_DOC_METADATA, target) ?? {};
    }

    private getPaths(path: string | string[] | undefined): string[] {
        if (Array.isArray(path)) {
            return path.length ? path : [""];
        }

        return [path ?? ""];
    }

    private joinPaths(controllerPath: string, handlerPath: string): string {
        const segments = ["api", controllerPath, handlerPath]
            .flatMap((path) => path.split("/"))
            .filter(Boolean);
        return `/${segments.join("/")}`;
    }

    private getParamterLocal(type: Number): Params["in"] {
        if (type === 3) return "body";
        if (type === 4) return "query";
        if (type === 5) return "param";
        if (type === 6) return "header";
        return "unknown";
    }

    private getParameters(controller: any, handlerName: string): Params[] {
        const routeArgs = Reflect.getMetadata(ROUTE_ARGS_METADATA, controller, handlerName) ?? {};
        const paramTypes = Reflect.getMetadata(PARAMTYPES_METADATA, controller.prototype, handlerName) ?? [];

        console.log("handlerName", handlerName);
        console.log("routeArgs", routeArgs);
        console.log("paramTypes", paramTypes);

        return Object.entries(routeArgs).filter(([key]) => {
                const [type] = key.split(":");
                const numericType = Number(type);
                return [3, 4, 5, 6, 8, 9, 12].includes(numericType);
            })
            .map(([key, metadata]: [string, any]) => {
                const [type, index] = key.split(":");
                const paramIndex = Number(index);
                const paramType = paramTypes[paramIndex];
                const name = metadata?.data ?? `param${paramIndex}`;

                return {
                    name,
                    in: this.getParamterLocal(Number(type)),
                    type: paramType?.name ?? "unknown",
                    required: true,
                };
            });
    }

}
