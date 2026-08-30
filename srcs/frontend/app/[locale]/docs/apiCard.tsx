"use client";
import Image from "next/image";
import { useId, useState } from "react";
import styles from "./page.module.css";
import type { ApiCardProps } from "@/types/app";
import { useTranslations } from "next-intl";

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
    const Docs = useTranslations("docs");

    return (
        <article className={`${styles.apiCard} ${styles[`method${method}`]}`}>
            <button className={styles.apiCardHeader} type="button" aria-expanded={isExpanded}
                aria-controls={contentId}
                onClick={() => setIsExpanded((expanded) => !expanded)}>
                <div className={styles.endpoint}>
                    <span className={styles.method}>{method}</span>
                    <h3 className={styles.endpointPath}>{path}</h3>
                    <p className={styles.summary}>{title}</p>
                </div>
                <div className={styles.headerMeta}>
                    <div className={styles.access}>
                        {isPrivate ? (
                            <Image src="/costumIcons/private_settings.svg" alt="" width={12} height={15} />
                        ) : null}
                        <span>{isPrivate ? permission || Docs("privateAccess") : Docs("publicAccess")}</span>
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
                                <dl>{parameters.map((parameter, i) => (
                                    <div key={i}>
                                        { typeof parameter.type === "string" ? (
                                            <div>
                                                <h4 className={styles.in}>{parameter.in}</h4>
                                                <div className={styles.parameter}>
                                                    <dt>{parameter.name}{" "}
                                                        {parameter.required ? "*" : null}
                                                    </dt>
                                                    <dd>{parameter.type}</dd>
                                                </div>
                                            </div>
                                        ) : null }

                                        { typeof parameter.type !== "string" ? (
                                            <div>
                                                <h4 className={styles.in}>{parameter.in}</h4>
                                                {Array.isArray(parameter.type) && (
                                                    <div>{parameter.type.map(([ field, type ]) => (
                                                        <div key={field} className={styles.parameter }>
                                                            <dt>{field}</dt>
                                                            <dd>{type}</dd>
                                                        </div>)
                                                    )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : null }
                                    </div>
                                ))}
                                </dl>
                            </div>
                        ) : null}

                        {/* <div className={`${styles.response} ${!parameters?.length ? styles.responseFull : ""}`}>
                            <span className={styles.responseLabel}>RESPONSE 200 OK</span>
                            <pre>
                                <code>{response || "Response schema not documented."}</code>
                            </pre>
                        </div> */}
                    </div>
                </div>
            ) : null}
        </article>
    );
}
