'use client';

import {useState, useEffect} from 'react';
import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import {useRouter} from 'next/navigation';
import EmptyState from "@/components/ui/EmptyState"; // Assuming you have this component

export default function ApplyPage({params}) {
    const {vacancyId} = params;

    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const [user, setUser] = useState(null);
    const [vacancy, setVacancy] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initializePage = async () => {
            if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
                setError("Пожалуйста, откройте эту страницу в приложении Telegram.");
                setIsLoading(false);
                return;
            }

            window.Telegram.WebApp.ready();
            const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;

            if (!telegramUser?.id) {
                setError('Пользователь Telegram не найден.');
                setIsLoading(false);
                // Optionally redirect
                // router.push('/register');
                return;
            }

            // 1. Fetch user data
            const {data: userData, error: userError} = await supabase
                .from('users')
                .select('id, first_name, last_name, phone_number')
                .eq('telegram_id', telegramUser.id)
                .single();

            if (userError || !userData) {
                setError('Пользователь не зарегистрирован. Перенаправление на страницу регистрации...');
                // You might want to delay this to show the message first
                setTimeout(() => router.push('/register'), 2000);
                return;
            }
            setUser(userData);

            // 2. Fetch vacancy data to display title
            const {data: vacancyData, error: vacancyError} = await supabase
                .from('vacancies')
                .select('title')
                .eq('id', vacancyId)
                .single();

            if (vacancyError || !vacancyData) {
                setError('Не удалось загрузить данные о вакансии.');
                setIsLoading(false);
                return;
            }
            setVacancy(vacancyData);

            setIsLoading(false);
        };

        initializePage();
    }, [router, supabase, vacancyId]);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!user) {
            setError('Ошибка: Пользователь не авторизован.');
            setIsLoading(false);
            return;
        }

        const filePaths = [];
        for (const file of files) {
            const filePath = `applications/${user.id}/${vacancyId}/${file.name}`;
            const {error: uploadError} = await supabase.storage
                .from('application-documents')
                .upload(filePath, file);

            if (uploadError) {
                setError(`Ошибка загрузки файла: ${uploadError.message}`);
                setIsLoading(false);
                return;
            }
            filePaths.push(filePath);
        }

        const {error: insertError} = await supabase
            .from('applications')
            .insert({
                vacancy_id: vacancyId,
                user_id: user.id,
                feedback: feedback,
                file_paths: filePaths,
            });

        if (insertError) {
            setError(`Ошибка отправки заявки: ${insertError.message}`);
        } else {
            // New Code: Sending notification to the admin
            const notificationRes = await fetch('/api/notify-admin', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({vacancyId, userId: user.id}),
            });

            if (!notificationRes.ok) {
                console.error('Error sending admin notification:', await notificationRes.text());
            }

            alert('Ваша заявка успешно отправлена!');
            router.push(`/`);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Загрузка...</p>
            </div>
        );
    }

    if (error) {
        return <EmptyState message={error}/>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Подача заявки на
                    вакансию: {vacancy?.title || 'Неизвестно'}</h2>
                <div className="text-center">
                    <p>
                        Имя: {user.first_name} {user.last_name}
                    </p>
                    <p>
                        Телефон: {user.phone_number}
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