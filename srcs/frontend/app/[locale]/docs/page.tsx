import Link from "next/link";
import styles from "./page.module.css";
import TitleCustom from "@/app/components/ui/titleCustom";
import DescriptionComponent from "@/app/components/ui/descriptionComponent";
import { useTranslations } from "next-intl";
import ApiCard, { type ApiCardProps } from "./apiCard";

const sections = [
    "Getting Started",
    "API Reference",
    "Authentication",
    "Webhooks",
];

const userApis: ApiCardProps[] = [
    {
        title: "Get user profile",
        description:
            "Retrieve high-level metadata for a specific vault identity. Includes watch-history, preference flags, and active streams.",
        method: "GET",
        path: "/users/{user_id}",
        access: "private",
        permission: "OAUTH2: READ_PROFILE",
        parameters: [
            { name: "user_id", type: "integer", required: true },
        ],
        response: '{ "id": 42, "username": "cinephile", "privacy": "public" }',
    },
    {
        title: "Update my profile",
        description: "Update the authenticated user's profile and privacy settings.",
        method: "PATCH",
        path: "/users/me",
        access: "private",
        permission: "OAUTH2: WRITE_PROFILE",
        parameters: [
            { name: "body", type: "UpdateUserDto", required: true },
        ],
        response: '{ "message": "Profile updated successfully" }',
    },
];

const movieApis: ApiCardProps[] = [
    {
        title: "Search movies",
        description:
            "Search the public movie catalog and filter results by query and genre.",
        method: "GET",
        path: "/movies/search",
        access: "public",
        parameters: [
            { name: "query", type: "string", required: true },
            { name: "genre", type: "enum [noir, tech, cult]" },
        ],
        response:
            '{\n  "results": [\n    { "id": "tt0110912", "title": "Pulp Fiction" }\n  ]\n}',
    },
];

export default function DocsPage() {
    const Docs = useTranslations("docs");

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

                <section className={styles.apiSection} id="users" aria-labelledby="users-title">
                    <div className={styles.sectionHeading}>
                        <h2 id="users-title">/USERS</h2>
                        <span>PROFILE &amp; AUTHENTICATION</span>
                    </div>
                    <div className={styles.apiCards}>
                        {userApis.map((api) => (
                            <ApiCard key={api.path} {...api} />
                        ))}
                    </div>
                </section>

                <section className={styles.apiSection} id="movies" aria-labelledby="movies-title">
                    <div className={styles.sectionHeading}>
                        <h2 id="movies-title">/MOVIES</h2>
                        <span>CATALOG &amp; STREAMING</span>
                    </div>
                    <div className={styles.apiCards}>
                        {movieApis.map((api) => (
                            <ApiCard key={api.path} {...api} />
                        ))}
                    </div>
                </section>
            </section>
        </main>
    );
}
