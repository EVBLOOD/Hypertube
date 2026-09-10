"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, type MouseEvent } from "react";
import ApiCard from "./apiCard";
import styles from "./page.module.css";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import TitleCustom from "@/app/components/ui/titleCustom";
import DocsService from "@/lib/services/DocsService";
import type { ApiCardProps, ApiDocumentation, Docs, LocalizedText,
} from "@/types/app";
import LoadingPage from "@/app/components/layout/loading";

const AUTH_TOKEN_COOKIE = "authTokenDocs";
const AUTH_TOKEN_MAX_AGE = 60 * 60;

function getAuthTokenFromCookie() {
    if (typeof document === "undefined") 
        return "";

    const cookie = document.cookie.split("; ")
        .find((value) => value.startsWith(`${AUTH_TOKEN_COOKIE}=`));

    return cookie ? decodeURIComponent(cookie.slice(AUTH_TOKEN_COOKIE.length + 1)) : "";
}

function setAuthTokenCookie(token: string) {
    if (typeof document === "undefined") return;

    if (!token) {
        document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0`;
        return;
    }

    document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${AUTH_TOKEN_MAX_AGE}`;
}

function getLocalizedText(text: LocalizedText | undefined, locale: string) {
    if (!text) return undefined;

    return text[locale as keyof LocalizedText] ?? text.en;
}

function detailsEndpoint(
    endpoint: Docs,
    locale: string,
    authorizationToken: string,
): ApiCardProps {
    return {
        title: getLocalizedText(endpoint.summary, locale) || "",
        description: getLocalizedText(endpoint.description, locale) || "No description available.",
        method: endpoint.method.toUpperCase(),
        path: endpoint.path,
        access: endpoint.authorization === "bearer" ? "private" : "public",
        authorization: endpoint.authorization,
        authorizationToken,
        parameters: endpoint.params?.map((parameter) => ({
            name: parameter.name,
            in: parameter.in,
            type: parameter.type || parameter.in,
            required: parameter.required,
        })),
    };
}

export default function DocsPage() {
    const Docs = useTranslations("docs");
    const locale = useLocale();
    const [data, setData] = useState<ApiDocumentation | null>(null);
    const [activeSection, setActiveSection] = useState("");
    const [authToken, setAuthToken] = useState(getAuthTokenFromCookie);
    const [isAuthorizing, setIsAuthorizing] = useState(false);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const response = await DocsService.getDocumentation();
                setData(response.data);

                const hash = window.location.hash.slice(1) || "";
                setActiveSection(hash);
            } catch (error) {
                console.debug("Error fetching documentation:", error);
            }
        };

        fetchDocs();
    }, []);

    function handleAuthTokenChange(token: string) {
        const trimmedToken = token.trim();
        setAuthToken(trimmedToken);
        setAuthTokenCookie(trimmedToken);
    }

    function handleSectionClick(event: MouseEvent<HTMLAnchorElement>, doc: string) {
        event.preventDefault();

        const section = document.getElementById(doc);
        if (!section) return;

        setActiveSection(doc);
        window.history.pushState(null, "", `#${encodeURIComponent(doc)}`);
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const docs = Object.entries(data ?? {});
    if (!data) return <LoadingPage message={"API Documentation Loading..."} />;

    return (
        <main className={`container ${styles.docsPage}`}>
            <div className={styles.sidebar} aria-label="Documentation navigation">
                <p className={styles.sidebarEyebrow}>{Docs("apiRef")}</p>
                <nav className={styles.sidebarNav}>
                    {docs.map(([doc]) => (
                        <Link key={doc}
                            href={`#${doc}`}
                            onClick={(e) => handleSectionClick(e, doc)}
                            className={`${styles.sidebarLink} ${activeSection === doc ? styles.sidebarLinkActive : ""}`}
                            aria-current={activeSection === doc ? "location" : undefined}>
                            {doc.toUpperCase()}
                        </Link>
                    ))}
                </nav>
            </div>

            <section className={styles.content}>
                <TitleCustom title={Docs("title")} />
                <DescriptionComponent text={Docs("decription")} />
                <div className={styles.authentication}>
                    <div className={styles.authenticationHeading}>
                        <div>
                            <p className={styles.authenticationDescription}>{Docs("authText")}</p>
                            <h4>BEARER AUTHENTICATION</h4>
                        </div>
                        <button className={styles.authorizeButton} type="button"
                            onClick={() => setIsAuthorizing((open) => !open)}>
                            {authToken ? Docs("authorized") : Docs("authorize")}
                        </button>
                    </div>
                    {isAuthorizing ? (
                        <label className={styles.tokenField}>
                            <span>{Docs("token")}</span>
                            <input type="password" value={authToken}
                                onChange={(event) => 
                                    handleAuthTokenChange(event.target.value)}
                                placeholder={Docs("tokenPlaceholder")} autoComplete="off" />
                        </label>
                    ) : null}
                    <pre><code>
                    {authToken ?
                    "Authorization: Bearer ••••••••" 
                    : "Authorization: Bearer <token>"}
                    </code></pre>
                </div>
                {docs.map(([doc, endpoints]) => (
                    <section className={styles.apiSection} id={doc} key={doc}>
                        <div className={styles.sectionHeading}>
                            <h2>{doc.toUpperCase()}</h2>
                        </div>
                        <div className={styles.apiCards}>
                            {endpoints.map((endpoint, i) => (
                                <ApiCard key={i} {...detailsEndpoint(endpoint, locale, authToken)} />
                            ))}
                        </div>
                    </section>
                ))}
            </section>
        </main>
    );
}
