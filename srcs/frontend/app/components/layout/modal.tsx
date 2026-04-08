'use client';
import styles from './modal.module.css'
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function Modal({children}: {children: ReactNode}) {
   const router = useRouter();

   return (
    <div className={styles.popup}  onClick={() => router.back()}>
        <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
   )
}