"use client";
import { useEffect, useState } from "react";

export default function Home() {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined" && window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready(); // Сообщаем Telegram, что мини-ап готов

            const user = tg.initDataUnsafe?.user;
            if (user?.id) {
                setUserId(user.id);
            }
        }
    }, []);

    return (
        <div>
            {userId ? (
                <p>User ID: {userId}</p>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
}
