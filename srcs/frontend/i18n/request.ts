import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

// const locales = ["en", "fr", "ar"];

export default getRequestConfig(async ({ requestLocale }) => {
    const locale = await requestLocale;

    if (!locale) notFound();

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
