import {useEffect, useState} from "react";
import {supabase} from "../lib/supabaseClient.jsx";

export default function AuthPage() {
    const [loading, setLoading] = useState(true);
    const [userExists, setUserExists] = useState(false);
    const [isTelegram, setIsTelegram] = useState(false);
    const [user, setUser] = useState({});

    useEffect(() => {
        // Check if the Telegram object exists on the window
        if (!window.Telegram || !window.Telegram.WebApp) {
            console.error("This app must be opened in a Telegram Mini App environment.");
            setLoading(false);
            setIsTelegram(false);
            return;
        }

        const tg = window.Telegram.WebApp;
        tg.ready();
        setIsTelegram(true);

        const tgUser = tg.initDataUnsafe.user;
        setUser(tgUser);
        if (!tgUser) {
            alert("Unable to retrieve user data from Telegram.");
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const {data, error} = await supabase
                    .from("users")
                    .select("id")
                    .eq("telegram_id", tgUser.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    // PGRST116 is the error code for "no rows found"
                    console.error("Supabase fetch error:", error);
                    // Handle other errors gracefully
                }

                if (data) {
                    // User found
                    setUserExists(true);
                } else {
                    // No user found, so insert a new one
                    const {error: insertError} = await supabase.from("users").insert([
                        {
                            telegram_id: tgUser.id,
                            full_name: `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim(),
                        },
                    ]);
                    if (insertError) {
                        console.error("Supabase insert error:", insertError);
                    }
                    setUserExists(false);
                }
            } catch (err) {
                console.error("An unexpected error occurred:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // --- Render Logic ---

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!isTelegram) {
        return (
            <div className="p-4 text-center">
                <h1>Please open this page in the Telegram app.</h1>
                <p>This is a Telegram Mini App and requires the Telegram environment to run.</p>
            </div>
        );
    }

    return (
        <div className="p-4 text-center">
            {userExists ? (
                <h1>Welcome back! ✅ {user.first_name || "Name"}</h1>
            ) : (
                <h1>Registration complete! 🎉</h1>
            )}
        </div>
    );
}