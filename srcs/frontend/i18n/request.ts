import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

const locales = ["en", "fr", "ar"];

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale) notFound();
    console.log(`../messages/${locale}.json`);
    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
