"use client";
import { AnimationIcon } from "@/components/icons/AnimationIcon";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home(): React.JSX.Element {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <AnimationIcon className="w-16 h-16" />
        <Link href="/personalization">Personalization Page</Link>
      </main>
    </div>
  );
}
