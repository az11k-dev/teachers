"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [status, setStatus] = useState("⏳ Checking...");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.Telegram) {
      setStatus("❌ Telegram API not loaded");
      return;
    }

    if (!window.Telegram.WebApp) {
      setStatus("⚠️ Not in Telegram WebApp");
      return;
    }

    window.Telegram.WebApp.ready();

    const user = window.Telegram.WebApp.initDataUnsafe?.user;
    if (user?.id) {
      setUserId(user.id);
      setStatus("✅ Data received");
    } else {
      setStatus("❌ No initData from Telegram");
    }
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", fontSize: "18px" }}>
      <p>Status: {status}</p>
      {userId && <p>User ID: {userId}</p>}
    </div>
  );
      }
