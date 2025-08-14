'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from 'next/navigation';

export default function ApplyPage({ params }) {
    const { vacancyId } = params;

    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const [user, setUser] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getUserData() {
            if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
                console.error("Telegram WebApp API not available.");
                setError("Пожалуйста, откройте эту страницу в приложении Telegram.");
                setIsLoading(false);
                return;
            }

            window.Telegram.WebApp.ready();
            const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;

            if (!telegramUser?.id) {
                console.error('Telegram user data not found.');
                router.push('/register');
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('users')
                .select('id, first_name, last_name, phone_number')
                .eq('telegram_id', telegramUser.id)
                .single();

            if (fetchError || !data) {
                console.error('User not registered or an error occurred:', fetchError?.message);
                router.push('/register');
            } else {
                setUser(data);
                setIsLoading(false);
            }
        }

        getUserData();
    }, [router, supabase]);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!user) {
            console.error('User is not authenticated.');
            setError('Ошибка: Пользователь не авторизован. Пожалуйста, обновите страницу.');
            setIsLoading(false);
            return;
        }

        const filePaths = [];
        if (files.length > 0) {
            for (const file of files) {
                const filePath = `applications/${user.id}/${vacancyId}/${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('application-documents')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    setError(`Ошибка загрузки файла: ${uploadError.message}`);
                    setIsLoading(false);
                    return;
                }
                filePaths.push(filePath);
            }
        }

        const { error: insertError } = await supabase
            .from('applications')
            .insert({
                vacancy_id: vacancyId,
                user_id: user.id,
                feedback: feedback,
                file_paths: filePaths,
            });

        if (insertError) {
            console.error('Error submitting application:', insertError);
            setError(`Ошибка отправки заявки: ${insertError.message}`);
            setIsLoading(false);
        } else {
            alert('Ваша заявка успешно отправлена!');
            router.push(`/`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Загрузка...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Подача заявки на вакансию: {vacancyId}</h2>
                <div className="text-center">
                    <p>
                        **Имя:** {user.first_name} {user.last_name}
                    </p>
                    <p>
                        **Телефон:** {user.phone_number}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                            Комментарий
                        </label>
                        <textarea
                            id="feedback"
                            name="feedback"
                            rows="4"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="files" className="block text-sm font-medium text-gray-700">
                            Прикрепить документы
                        </label>
                        <input
                            id="files"
                            name="files"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                        {isLoading ? 'Отправка...' : 'Отправить заявку'}
                    </button>
                </form>
            </div>
        </div>
    );
}