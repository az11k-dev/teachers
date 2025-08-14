"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [status, setStatus] = useState("Checking...");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      const user = window.Telegram.WebApp.initDataUnsafe?.user;

      if (user?.id) {
        setUserId(user.id);
        setStatus("✅ Data received");
      } else {
        setStatus("❌ No data received");
      }
    } else {
      setStatus("⚠️ Not in Telegram WebApp");
    }
  }, []);

  return (
    <div style={{
      fontFamily: "sans-serif",
      padding: "20px",
      fontSize: "18px"
    }}>
      <p>Status: {status}</p>
      {userId && <p>User ID: {userId}</p>}
    </div>
  );
      }
