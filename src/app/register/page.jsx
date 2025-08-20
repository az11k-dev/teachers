'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from 'next/navigation';

export default function Register() {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [telegramUser, setTelegramUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function initializeUser() {
            if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
                console.error("Telegram WebApp API not available.");
                setError("Iltimos, bu sahifani Telegram ilovasida oching.");
                setIsLoading(false);
                return;
            }

            window.Telegram.WebApp.ready();
            const user = window.Telegram.WebApp.initDataUnsafe?.user;

            if (!user?.id) {
                console.error('Telegram user data not found.');
                setError("Telegramdan foydalanuvchi maʼlumotlarini olish imkoni boʻlmadi.");
                setIsLoading(false);
                return;
            }

            setTelegramUser(user);
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');

            const { data, error: fetchError } = await supabase
                .from('users')
                .select('id')
                .eq('telegram_id', user.id)
                .single();

            if (data) {
                router.push('/');
            } else if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error checking user:', fetchError.message);
                setError('Xatolik yuz berdi. Iltimos, qayta urinib koʻring.');
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        }

        initializeUser();
    }, [router, supabase]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!telegramUser) {
            setError('Foydalanuvchi maʼlumotlari mavjud emas. Iltimos, sahifani yangilang.');
            setIsLoading(false);
            return;
        }

        const { error: insertError } = await supabase
            .from('users')
            .insert({
                telegram_id: telegramUser.id,
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
            });

        if (insertError) {
            console.error('Error registering user:', insertError.message);
            setError('Roʻyxatdan oʻtishda xatolik. Iltimos, qayta urinib koʻring.');
            setIsLoading(false);
        } else {
            router.push('/');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-xl font-medium text-gray-700">Yuklanmoqda...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md text-center">
                    <p className="text-xl font-medium text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-xl w-full">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
                    Roʻyxatdan oʻtish
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            Ism
                        </label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="block w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Familiya
                        </label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="block w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
                        />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Telefon raqam
                        </label>
                        <input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="block w-full px-4 py-3 border text-gray-900 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
                    >
                        Roʻyxatdan oʻtish
                    </button>
                </form>
            </div>
        </div>
    );
}