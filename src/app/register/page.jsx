'use client';

import {useState, useEffect} from 'react';
import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import {useRouter} from 'next/navigation';

// Эмуляция Telegram Web App SDK.
// В реальном приложении вы получите window.Telegram.WebApp.initDataUnsafe
const telegramWebApp = {
    initDataUnsafe: {
        user: {
            id: 123456789,
            first_name: 'Test',
            last_name: 'User',
        },
    },
};

export default function Register() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        async function checkUser() {
            if (!telegramWebApp.initDataUnsafe.user) {
                console.error('Telegram Web App user data is not available.');
                setIsLoading(false);
                return;
            }

            const {user} = telegramWebApp.initDataUnsafe;
            const {data} = await supabase
                .from('users')
                .select('id')
                .eq('telegram_id', user.id)
                .single();

            if (data) {
                router.push('/');
            } else {
                setIsLoading(false);
            }
        }

        checkUser();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const {user} = telegramWebApp.initDataUnsafe;
        const {error} = await supabase
            .from('users')
            .insert([
                {
                    telegram_id: user.id,
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phoneNumber,
                },
            ]);

        if (error) {
            console.error('Error registering user:', error.message);
            setIsLoading(false);
        } else {
            router.push('/');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Регистрация</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            Имя
                        </label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Фамилия
                        </label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                            Номер телефона
                        </label>
                        <input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                        Зарегистрироваться
                    </button>
                </form>
            </div>
        </div>
    );
}