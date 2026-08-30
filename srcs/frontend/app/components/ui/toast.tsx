"use client";
import { ToastContainer, toast, type ToastContainerProps } from "react-toastify";
import styles from "./toast.module.css";

type ToastProps = Omit<ToastContainerProps, "rtl"> & {
    locale?: string;
};

export default function Toast({ locale, ...props }: ToastProps) {
    return (
        <ToastContainer
            {...props}
            className={styles.container}
            toastClassName={styles.toast}
            progressClassName={styles.progress}
            rtl={locale === "ar"}
            position={locale === "ar" ? "top-left" : "top-right"}
            autoClose={4000}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
        />
    );
}

export { toast };
