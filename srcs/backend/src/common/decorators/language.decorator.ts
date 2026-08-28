import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const SUPPORTED_LANGUAGES = ["ar", "en", "fr"] as const;
export const LANGUAGES_AND_DEFAULT = ["ar", "en", "fr", "df"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type DefaultLanguage = (typeof LANGUAGES_AND_DEFAULT)[number];
export const DEFAULT_LANGUAGE = "df";

export const Language = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): DefaultLanguage => {
        const request = ctx.switchToHttp().getRequest();

        const queryLang = request.query?.lang;
        const customHeaderLang = request.headers["x-lang"];
        const acceptHeaderLang = request.headers["accept-language"]
            ?.split(",")[0]
            ?.split("-")[0]
            ?.toLowerCase();

        const rawLang = (
            queryLang ||
            customHeaderLang ||
            acceptHeaderLang ||
            ""
        ).toLowerCase();

        const isSupported = SUPPORTED_LANGUAGES.includes(
            rawLang as SupportedLanguage,
        );

        return isSupported ? (rawLang as SupportedLanguage) : DEFAULT_LANGUAGE;
    },
);
