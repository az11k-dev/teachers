// src/components/RedirectOnNewSession.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectOnNewSession() {
    const router = useRouter();

    useEffect(() => {
        const sessionFlag = sessionStorage.getItem("visited_session");

        if (!sessionFlag) {
            sessionStorage.setItem("visited_session", "true");
            router.replace("/register");
        }
    }, [router]);

    return null;
}