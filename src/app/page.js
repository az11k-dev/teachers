"use client";
import { useState, useEffect } from "react";

export default function Home() {
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            if (typeof window !== "undefined" && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                tg.ready();
                const user = tg.initDataUnsafe?.user;
                if (user?.id) {
                    setUserId(user.id);
                } else {
                    setError("No user data found — are you in Telegram Mini App?");
                }
            } else {
                setError("Telegram WebApp API not available.");
            }
        } catch (err) {
            setError("Error: " + err.message);
        }
    }, []);

    if (error) return <p>{error}</p>;
    if (!userId) return <p>Loading...</p>;

    return <p>User ID: {userId}</p>;
}
