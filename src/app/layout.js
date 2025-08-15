"use client";

import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Script from "next/script";
import {useEffect, useState} from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({children}) {
    const [styleVars, setStyleVars] = useState({
        "--tg-viewport-height": "100vh",
        "--tg-viewport-stable-height": "100vh",
    });

    useEffect(() => {
        const vh = window.Telegram?.WebApp?.viewportHeight || window.innerHeight;
        setStyleVars({
            "--tg-viewport-height": `${vh}px`,
            "--tg-viewport-stable-height": `${vh}px`,
        });
    }, []);

    return (
        <html lang="en" style={styleVars}>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
        <Script
            src="https://telegram.org/js/telegram-web-app.js"
            strategy="beforeInteractive"
        />
        </body>
        </html>
    );
}
