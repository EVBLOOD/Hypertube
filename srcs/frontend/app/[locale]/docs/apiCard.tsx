"use client";

import Image from "next/image";
import { useId, useState } from "react";
import styles from "./page.module.css";

export type ApiParameter = {
    name: string;
    type: string;
    required?: boolean;
};

export type ApiCardProps = {
    title: string;
    description: string;
    method: "GET" | "PATCH" | "POST" | "DELETE";
    path: string;
    access: "public" | "private";
    permission?: string;
    parameters?: ApiParameter[];
    response: string;
};

export default function ApiCard({
    title,
    description,
    method,
    path,
    access,
    permission,
    parameters,
    response,
}: ApiCardProps) {
    const isPrivate = access === "private";
    const [isExpanded, setIsExpanded] = useState(false);
    const contentId = useId();

    return (
        <article
            className={`${styles.apiCard} ${styles[`method${method}`]}`}
            aria-label={title}
        >
            <button
                className={styles.apiCardHeader}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={contentId}
                onClick={() => setIsExpanded((expanded) => !expanded)}
            >
                <div className={styles.endpoint}>
                    <span className={styles.method}>{method}</span>
                    <h3 className={styles.endpointPath}>{path}</h3>
                </div>
                <div className={styles.headerMeta}>
                    <div className={styles.access}>
                        {isPrivate ? (
                            <Image
                                src="/costumIcons/private_settings.svg"
                                alt=""
                                width={12}
                                height={15}
                            />
                        ) : null}
                        <span>{isPrivate ? permission || "PRIVATE ACCESS" : "PUBLIC ACCESS"}</span>
                    </div>
                    <span className={styles.cardArrow} aria-hidden="true">
                        <svg viewBox="0 0 16 16" focusable="false">
                            <path d={isExpanded ? "m4 10 4-4 4 4" : "m4 6 4 4 4-4"} />
                        </svg>
                    </span>
                </div>
            </button>

            {isExpanded ? (
                <div id={contentId}>
                    <p className={styles.apiDescription}>{description}</p>

                    <div className={styles.apiCardBody}>
                        {parameters?.length ? (
                            <div className={styles.parameters}>
                                <h4>PARAMETERS</h4>
                                <dl>
                                    {parameters.map((parameter) => (
                                        <div className={styles.parameter} key={parameter.name}>
                                            <dt>{parameter.name}</dt>
                                            <dd>
                                                {parameter.type}
                                                {parameter.required ? " (required)" : ""}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        ) : null}

                        <div className={`${styles.response} ${!parameters?.length ? styles.responseFull : ""}`}>
                            <span className={styles.responseLabel}>RESPONSE 200 OK</span>
                            <pre>
                                <code>{response}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            ) : null}
        </article>
    );
}
