import { useEffect, useState } from "react";


export default function useDebounce<T>(value: T, delay: number) {
    const [deboucedValue, setDeboucedValue] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDeboucedValue(value)
        }, delay);
        return () => {
            clearTimeout(timer);
        }
    }, [value, delay]);

    return deboucedValue;
}