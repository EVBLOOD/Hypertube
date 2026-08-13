"use client";

import styles from "./footer.module.css";

export default function Footer() {
    return (
        <div
            className={styles.footerAll}
            style={{ backgroundColor: "var(--popup-background)" }}
        >
            <div className={`container ${styles.borderWrap}`}>
                <span className={styles.logo}>HYPERTUBE</span>
                <span>© 2026 HYPERTUBE FILM VAULT. ALL RIGHTS RESERVED.</span>
                <div className={styles.borderInfos}>
                    <span>Technical Specs</span>
                    <span>Privacy Protocol</span>
                    <span>API Documentation</span>
                </div>
            </div>
        </div>
    );
}
