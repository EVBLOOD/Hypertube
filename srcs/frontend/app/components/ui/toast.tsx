"use client";
import { useCallback, useEffect, useRef, 
        useState, useSyncExternalStore, 
        type ReactNode} from "react";
import styles from "./toast.module.css";

const AUTO_CLOSE = 4000;

type ToastType = "success" | "error" | "info" | "warning";

type ToastItem = {
    id: number;
    message: ReactNode;
    type: ToastType;
};

type ToastListener = () => void;

let nextToastId = 0;
let activeToasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function subscribe(listener: ToastListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function notify() {
    listeners.forEach((listener) => listener());
}

function addToast(type: ToastType, message: ReactNode) {
    const id = ++nextToastId;
    activeToasts = [...activeToasts, { id, message, type }];
    notify();
    return id;
}

function dismissToast(id?: number) {
    if (id === undefined) {
        activeToasts = [];
    } else {
        activeToasts = activeToasts.filter((toastItem) => toastItem.id !== id);
    }
    notify();
}

function getToasts() {
    return activeToasts;
}

export const toast = {
    success: (message: ReactNode) => addToast("success", message),
    error: (message: ReactNode) => addToast("error", message),
    info: (message: ReactNode) => addToast("info", message),
    warning: (message: ReactNode) => addToast("warning", message),
    dismiss: dismissToast,
};

type ToastProps = {
    locale?: string;
};

const icons: Record<ToastType, string> = {
    success: "✓",
    error: "!",
    info: "i",
    warning: "!",
};

function ToastItemView({ item }: { item: ToastItem }) {
    const [isPaused, setIsPaused] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startedAtRef = useRef<number | null>(null);
    const remainingRef = useRef(AUTO_CLOSE);

    const dismiss = useCallback(() => dismissToast(item.id), [item.id]);

    const clearTimer = useCallback(() => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const startTimer = useCallback(() => {
        clearTimer();
        startedAtRef.current = Date.now();
        timeoutRef.current = setTimeout(dismiss, remainingRef.current);
    }, [clearTimer, dismiss]);

    const resumeTimer = useCallback(() => {
        startTimer();
        setIsPaused(false);
    }, [startTimer]);

    const pauseTimer = useCallback(() => {
        if (startedAtRef.current !== null) {
            remainingRef.current = Math.max( 0, remainingRef.current - (Date.now() - startedAtRef.current) );
            startedAtRef.current = null;
        }
        clearTimer();
        setIsPaused(true);
    }, [clearTimer]);

    useEffect(() => {
        startTimer();

        const pauseOnFocusLoss = () => pauseTimer();
        const resumeOnFocus = () => {
            if (remainingRef.current > 0) resumeTimer();
        };

        window.addEventListener("blur", pauseOnFocusLoss);
        window.addEventListener("focus", resumeOnFocus);

        return () => {
            clearTimer();
            window.removeEventListener("blur", pauseOnFocusLoss);
            window.removeEventListener("focus", resumeOnFocus);
        };
    }, [clearTimer, pauseTimer, resumeTimer, startTimer]);

    return (
        <div className={`${styles.toast} ${styles[item.type]}`}
            role={item.type === "error" ? "alert" : "status"}
            onClick={dismiss}
            onFocus={pauseTimer}
            onBlur={resumeTimer}
            onMouseEnter={pauseTimer}
            onMouseLeave={resumeTimer}
        >
            <span className={styles.icon} aria-hidden="true">
                {icons[item.type]}
            </span>
            <span className={styles.message}>{item.message}</span>
            <button className={styles.close} type="button" aria-label="Dismiss notification"
                onClick={(event) => { event.stopPropagation(); dismiss(); }}
            >×</button>
            <span
                className={styles.progress}
                style={{
                    animationDuration: `${AUTO_CLOSE}ms`,
                    animationPlayState: isPaused ? "paused" : "running",
                }}
            />
        </div>
    );
}

export default function Toast({ locale }: ToastProps) {
    const toasts = useSyncExternalStore(subscribe, getToasts, getToasts);
    const isRtl = locale === "ar";

    return (
        <div className={`${styles.container} ${isRtl ? styles.left : styles.right}`} 
            aria-live="polite" aria-atomic="false">
            {[...toasts].reverse().map((item) => (
                <ToastItemView key={item.id} item={item} />
            ))}
        </div>
    );
}
