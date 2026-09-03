"use client";

import { useTranslations } from "next-intl";
import ErrorPage from "../../components/layout/error";



export default function NotFound() {
    const t = useTranslations("NotFound");
    return (
        <ErrorPage
            errorCode={404}
            errorMessage={t("errorMessage")}
        />
    );
};