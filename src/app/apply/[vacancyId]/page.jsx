'use client';

import { useState, useEffect, use } from 'react'; // Import `use` from React
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from 'next/navigation';

export default function ApplyPage({ params }) {
    // Use `React.use()` to unwrap the params promise
    const unwrappedParams = use(params);
    const { vacancyId } = unwrappedParams;

    const router = useRouter();
    const [user, setUser] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createSupabaseBrowserClient();

    // Эмуляция Telegram Web App SDK
    const telegramWebApp = {
        initDataUnsafe: {
            user: {
                id: 123456789,
            },
        },
    };

    useEffect(() => {
        // Your existing useEffect logic remains the same
        async function getUserData() {
            if (!telegramWebApp.initDataUnsafe.user) {
                console.error('Telegram user not found');
                router.push('/register');
                return;
            }

            const { user: telegramUser } = telegramWebApp.initDataUnsafe;
            const { data, error } = await supabase
                .from('users')
                .select('id, first_name, last_name, phone_number')
                .eq('telegram_id', telegramUser.id)
                .single();

            if (error || !data) {
                console.error('User not registered');
                router.push('/register');
            } else {
                setUser(data);
                setIsLoading(false);
            }
        }

        getUserData();
    }, [router]);

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!user) {
            console.error('User is not authenticated.');
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
            setIsLoading(false);
        } else {
            alert('Ваша заявка успешно отправлена!');
            router.push(`/`);
        }
    };

    if (isLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Загрузка...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Подача заявки</h2>
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