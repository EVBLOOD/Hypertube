import { Injectable, RequestMethod } from "@nestjs/common";
import { GUARDS_METADATA, METHOD_METADATA, PATH_METADATA, PARAMTYPES_METADATA, ROUTE_ARGS_METADATA } from "@nestjs/common/constants";
import { DiscoveryService } from "@nestjs/core";
import { getMetadataStorage } from "class-validator";

import documentationFile from "./documentation.json";
import {
    API_DOC_METADATA,
    type ApiDoc,
    type Params,
} from "./decorators/api-doc.decorator";

export interface LocalizedText {
    en: string;
    fr: string;
    ar: string;
}

interface DocumentationEntry {
    summary: LocalizedText;
    description: LocalizedText;
}

export interface ApiEndpointDocumentation extends ApiDoc {
    method: string;
    path: string;
    authorization: "bearer" | "none";
    summary?: LocalizedText;
    description?: LocalizedText;
}

export type ApiDocumentation = Record<string, ApiEndpointDocumentation[]>;

@Injectable()
export class DocsService {
    constructor(private readonly discoveryService: DiscoveryService) {}


    private readonly documentation = documentationFile as Record<string, DocumentationEntry>;

    private getResourceName(path: string): string {
        return path.split("/").filter(Boolean)[0] ?? "root";
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
                if (!Reflect.hasMetadata(API_DOC_METADATA, handler)) return [];

                const requestMethod = Reflect.getMetadata(METHOD_METADATA, handler);
                if (requestMethod === undefined) return [];

                const method = RequestMethod[requestMethod];

                const params = this.getParameters(controller, handlerName);


                const handlerPaths = this.getPaths(
                    Reflect.getMetadata(PATH_METADATA, handler),
                );
                                
                const { target, ...metadata } = this.getDocumentationMetadata(handler);
                const localizedDocumentation = target
                    ? this.documentation[target]
                    : undefined;

                return controllerPaths.flatMap((controllerPath) =>
                    handlerPaths.map((handlerPath) => ({
                        method,
                        path: this.joinPaths(controllerPath, handlerPath),
                        params,
                        authorization: this.requiresBearerToken(controller, handler)? "bearer": "none",
                        target,
                        summary: localizedDocumentation?.summary,
                        description: localizedDocumentation?.description,
                        ...metadata,
                    })),
                );
            },
        );
    }

    private requiresBearerToken(controller: any, handler: any): boolean {
        const guards = [
            ...(Reflect.getMetadata(GUARDS_METADATA, controller) ?? []),
            ...(Reflect.getMetadata(GUARDS_METADATA, handler) ?? []),
        ];

        return guards.some((guard: any) =>
            ["JwtAuthGuard", "ApiScopeGuard"].includes(guard?.name),
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
        const segments = [controllerPath, handlerPath]
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
                const parameterLocation = this.getParamterLocal(Number(type));
                const dtoFields = (parameterLocation === "body" || parameterLocation === "query" ) && metadata?.data === undefined
                    ? this.getDtoFields(paramType)
                    : [];

                return {
                    name,
                    in: parameterLocation,
                    type: dtoFields.length ? dtoFields : paramType?.name ?? "unknown",
                    required: true,
                };
            });
    }

    private getDtoFields(dtoType: any): [string, string][] {

        if (typeof dtoType !== "function" || !dtoType.prototype) {
            return [];
        }

        const validationMetadata = getMetadataStorage().getTargetValidationMetadatas(dtoType, "", true, false);
        
        const propertyNames = [...new Set(
            validationMetadata.map(({ propertyName }) => propertyName)
        )];

        return propertyNames.map((propertyName) => {
            const propertyType = Reflect.getMetadata(
                "design:type",
                dtoType.prototype,
                propertyName,
            );

            return [propertyName, propertyType?.name ?? "unknown"];
        });
    }

}
