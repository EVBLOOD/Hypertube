"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import ApiCard, { type ApiCardProps } from "./apiCard";
import styles from "./page.module.css";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import TitleCustom from "@/app/components/ui/titleCustom";
import DocsService, { type ApiDocumentation, type Docs,
} from "@/lib/services/DocsService";

const sections = [
    "Getting Started",
    "API Reference",
    "Authentication",
    "Webhooks",
];

const resourceLabels: Record<string, string> = {
    users: "PROFILE & AUTHENTICATION",
    movies: "CATALOG & STREAMING",
    auth: "AUTHENTICATION",
    comments: "COMMUNITY & DISCUSSION",
    docs: "DOCUMENTATION",
};

function detailsEndpoint(endpoint: Docs, resource: string): ApiCardProps {
    return {
        title: endpoint.summary || `${endpoint.method} ${endpoint.path}`,
        description: endpoint.description || "No description available.",
        method: endpoint.method.toUpperCase(),
        path: endpoint.path,
        access: resource === "users" ? "private" : "public",
        parameters: endpoint.params?.map((parameter) => ({
            name: parameter.name,
            type: parameter.type || parameter.in,
            required: parameter.required,
        })),
    };
}

export default function DocsPage() {
    const Docs = useTranslations("docs");
    const [data, setData] = useState<ApiDocumentation | null>(null);


    useEffect(() => {

        const fetchDocs = async () => {
            try {
                const response = await DocsService.getDocumentation();
                setData(response.data);
            } catch (error) {
                console.error("Error fetching documentation:", error);
            }
        };

        fetchDocs();

    }, []);

    const docs = Object.entries(data ?? {});

    return (
        <main className={`container ${styles.docsPage}`}>
            <div className={styles.sidebar} aria-label="Documentation navigation">
                <p className={styles.sidebarEyebrow}>API REFERENCES</p>
                <nav className={styles.sidebarNav}>
                    {sections.map((section, index) => (
                        <Link key={section} href="#" className={`${styles.sidebarLink} ${index === 0 ? styles.sidebarLinkActive : ""}`}>
                            {section}
                        </Link>
                    ))}
                </nav>
            </div>

            <section className={styles.content}>
                <TitleCustom title={Docs("title")} />
                <DescriptionComponent text={Docs("decription")} className={styles.docsDescription} />

                {docs && docs.map(([doc, endpoints]) => (
                    <section className={styles.apiSection} id={doc} key={doc} >
                        <div className={styles.sectionHeading}>
                            <h2>{doc.toUpperCase()}</h2>
                            <span>{resourceLabels[doc] || "API ENDPOINTS"}</span>
                        </div>
                        <div className={styles.apiCards}>
                            {endpoints.map((endpoint, i) => (
                                <ApiCard key={i} {...detailsEndpoint(endpoint, doc)} />
                            ))}
                        </div>
                    </section>
                ))}
            </section>
        </main>
    );
}
