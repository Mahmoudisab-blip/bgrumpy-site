"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import styles from "./AdminAccess.module.css";

export default function AdminAccess() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let ignore = false;

    fetch("/api/admin/session", {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((payload: { authenticated?: boolean }) => {
        if (!ignore) {
          setAuthenticated(Boolean(payload.authenticated));
        }
      })
      .catch(() => {
        if (!ignore) {
          setAuthenticated(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (!authenticated) {
    return null;
  }

  return (
    <Link className={styles.adminAccess} href="/admin">
      <ShieldCheck strokeWidth={1.7} aria-hidden="true" />
      Admin
    </Link>
  );
}
