"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./page.module.css";
import type { ApiCardProps, ApiParameter } from "@/types/app";

function exampleValue(type: string) {
    if (/number|int|float/i.test(type)) return 0;
    if (/boolean/i.test(type)) return false;
    return "string";
}

function defaultBody(parameters?: ApiParameter[]) {
    const body = parameters?.find((parameter) => parameter.in === "body");

    if (!body) return "";

    if (Array.isArray(body.type)) {
        return JSON.stringify(Object.fromEntries(body.type.map(([field, type]) => [field, exampleValue(type)])), null, 2);
    }

    return JSON.stringify({ [body.name]: exampleValue(body.type) }, null, 2);
}

function defaultUrl(path: string, parameters?: ApiParameter[]) {
    const withPlaceholders = path.replace(/:([^/]+)/g, "{$1}");

    const query = parameters?.flatMap((parameter) => parameter.in !== "query" ? [] : Array.isArray(parameter.type)
        ? parameter.type.map(([field]) => `${encodeURIComponent(field)}=`)
        : [`${encodeURIComponent(parameter.name)}=`]) ?? [];

    return query.length ? `${withPlaceholders}?${query.join("&")}` : withPlaceholders;
}

export default function ApiCard({ 
        title, 
        description, 
        method, 
        path, 
        access, 
        permission, 
        parameters, 
        authorizationToken 
    } : ApiCardProps) {

    const [isExpanded, setIsExpanded] = useState(false);
    const [isTrying, setIsTrying] = useState(false);
    const [requestUrl, setRequestUrl] = useState(() => defaultUrl(path, parameters));
    const [requestBody, setRequestBody] = useState(() => defaultBody(parameters));
    const [result, setResult] = useState<{ status: number; body: string } | null>(null);
    const [requestError, setRequestError] = useState("");
    const [isSending, setIsSending] = useState(false);
    const contentId = useId();
    const Docs = useTranslations("docs");
    const isPrivate = access === "private";
    const needsBody = useMemo(() => parameters?.some((parameter) => parameter.in === "body"), [parameters]);

    async function executeRequest() {
        setRequestError(""); 
        setResult(null);
        if (isPrivate && !authorizationToken){ 
            setRequestError(Docs("authorizationRequired")); 
            return; 
        }
        let body: string | undefined;
        if (needsBody && requestBody.trim()) {
            try { 
                body = JSON.stringify(JSON.parse(requestBody)); 
            }
            catch { 
                setRequestError(Docs("invalidJson")); 
                return; 
            }
        }
        setIsSending(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_API_URL || ""}${requestUrl}`, {
                method, credentials: "include",
                headers: { 
                    Accept: "application/json", 
                    ...(body ? { "Content-Type": "application/json" } : {}), 
                    ...(isPrivate && authorizationToken ? { Authorization: `Bearer ${authorizationToken}` } : {}) 
                },
                ...(body ? { body } : {}),
            });
            const text = await response.text();

            try { 
                setResult({ 
                    status: response.status, 
                    body: JSON.stringify(JSON.parse(text), null, 2) 
                }); 
            }
            catch { 
                setResult({ 
                    status: response.status, 
                    body: text || Docs("emptyResponse") 
                }); 
            }
        } catch { 
            setRequestError(Docs("requestFailed"));
        }
        finally { 
            setIsSending(false);
        }
    }

    return <article className={`${styles.apiCard} ${styles[`method${method}`]}`}>
        <button className={styles.apiCardHeader}
            type="button"
            aria-expanded={isExpanded}
            aria-controls={contentId}
            onClick={() => setIsExpanded((expanded) => !expanded)}>
            <div className={styles.endpoint}>
                <span className={styles.method}>{method}</span>
                <h3 className={styles.endpointPath}>{path}</h3>
                <p className={styles.summary}>{title}</p>
            </div>
            <div className={styles.headerMeta}>
                <div className={styles.access}>
                    {isPrivate ? <Image src="/costumIcons/private_settings.svg" alt="" width={12} height={15} /> : null}
                    <span>{isPrivate ? permission || Docs("privateAccess") : Docs("publicAccess")}</span>
                </div>
                <span className={styles.cardArrow} aria-hidden="true">
                    <svg viewBox="0 0 16 16" focusable="false">
                        <path d={isExpanded ? "m4 10 4-4 4 4" : "m4 6 4 4 4-4"} />
                    </svg>
                </span>
            </div>
        </button>
        {isExpanded ? <div id={contentId}>
            <p className={styles.apiDescription}>{description}</p>
            <div className={styles.apiCardBody}>
                {parameters?.length ? 
                <div className={styles.parameters}>
                    <dl>{parameters.map((parameter, i) => 
                        <div key={i}>
                            <h4 className={styles.in}>{parameter.in}</h4>
                            {typeof parameter.type === "string" ? 
                            <div className={styles.parameter}>
                                <dt>{parameter.name}{parameter.required ? " *" : null}</dt>
                                <dd>{parameter.type}</dd>
                            </div> : 
                            parameter.type.map(([field, type]) => 
                            <div key={field} className={styles.parameter}>
                                <dt>{field}</dt>
                                <dd>{type}</dd>
                            </div>)}
                        </div>)}
                    </dl>
                </div> : null}
                <div className={styles.tryPanel}>
                    <div className={styles.tryHeading}>
                        <span>{Docs("request")}</span>
                        <button 
                            type="button"
                            className={styles.tryButton} 
                            onClick={() => setIsTrying((trying) => !trying)}>{isTrying ? Docs("cancel") : Docs("tryItOut")}
                        </button>
                    </div>{isTrying ? <div className={styles.tryForm}>
                    <label>
                        <span>{Docs("requestUrl")}</span>
                        <input value={requestUrl} onChange={(event) => setRequestUrl(event.target.value)} />
                    </label>
                    {needsBody ? <label>
                        <span>{Docs("requestBody")}</span>
                        <textarea value={requestBody} onChange={(event) => setRequestBody(event.target.value)} spellCheck="false" /></label> : null}
                        {requestError ? <p className={styles.requestError}>{requestError}</p> : null}
                        <button type="button" 
                            className={styles.executeButton} 
                            onClick={executeRequest} 
                            disabled={isSending}>{isSending ? Docs("sending") : Docs("execute")}
                        </button>
                    </div>
                    : null}
                </div>
            </div>
            {result ? <div className={styles.response}>
                <span className={styles.responseLabel}>{Docs("response")} {result.status}</span>
                <pre>
                    <code>{result.body}</code>
                </pre>
            </div> 
            : null}
        </div> : null}
    </article>;
}
