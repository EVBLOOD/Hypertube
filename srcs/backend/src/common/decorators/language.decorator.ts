import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const SUPPORTED_LANGUAGES = ["ar", "en", "fr"] as const;
export const LANGUAGES_AND_DEFAULT = ["ar", "en", "fr", "df"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type DefaultLanguage = (typeof LANGUAGES_AND_DEFAULT)[number];
export const DEFAULT_LANGUAGE = "df";

export const Language = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): DefaultLanguage => {
        const request = ctx.switchToHttp().getRequest();
        if (!request) return DEFAULT_LANGUAGE;

        const getFirstString = (val: unknown): string => {
            if (typeof val === "string") return val;
            if (Array.isArray(val) && typeof val[0] === "string") return val[0];
            return "";
        };

        const queryLang = getFirstString(request.query?.lang);
        const customHeaderLang = getFirstString(request.headers?.["x-lang"]);
        const acceptHeaderRaw = getFirstString(request.headers?.["accept-language"]);
        const acceptHeaderLang = acceptHeaderRaw.split(",")[0]?.split("-")[0]?.trim() || "";

        const rawLang = (queryLang || customHeaderLang || acceptHeaderLang).toLowerCase();

        const isSupported = SUPPORTED_LANGUAGES.includes(
            rawLang as SupportedLanguage,
        );

        return isSupported ? (rawLang as SupportedLanguage) : DEFAULT_LANGUAGE;
    },
);
