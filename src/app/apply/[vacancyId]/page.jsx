'use client';

import {useState, useEffect} from 'react';
import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import {useRouter} from 'next/navigation';
import EmptyState from "@/components/ui/EmptyState";

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
                setError("Iltimos, ushbu sahifani Telegram ilovasida oching.");
                setIsLoading(false);
                return;
            }

            window.Telegram.WebApp.ready();
            const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;

            if (!telegramUser?.id) {
                setError('Telegram foydalanuvchisi topilmadi.');
                setIsLoading(false);
                return;
            }

            const {data: userData, error: userError} = await supabase
                .from('users')
                .select('id, first_name, last_name, phone_number')
                .eq('telegram_id', telegramUser.id)
                .single();

            if (userError || !userData) {
                setError('Foydalanuvchi roʻyxatdan oʻtmagan. Roʻyxatdan oʻtish sahifasiga yoʻnaltirilmoqda...');
                setTimeout(() => router.push('/register'), 2000);
                return;
            }
            setUser(userData);

            const {data: vacancyData, error: vacancyError} = await supabase
                .from('vacancies')
                .select('title')
                .eq('id', vacancyId)
                .single();

            if (vacancyError || !vacancyData) {
                setError('Vakansiya maʼlumotlarini yuklab boʻlmadi.');
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
            setError('Xatolik: Foydalanuvchi avtorizatsiyadan oʻtmagan.');
            setIsLoading(false);
            return;
        }

        if (files.length === 0) {
            setError('Iltimos, kamida bitta fayl tanlang.');
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
                setError(`Faylni yuklashda xatolik: ${uploadError.message}`);
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
            setError(`Arizani yuborishda xatolik: ${insertError.message}`);
        } else {
            const notificationRes = await fetch('/api/notify-admin', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({vacancyId, userId: user.id}),
            });

            if (!notificationRes.ok) {
                console.error('Error sending admin notification:', await notificationRes.text());
            }

            alert('Sizning arizangiz muvaffaqiyatli yuborildi!');
            router.push(`/`);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-xl font-medium text-gray-700">Yuklanmoqda...</p>
            </div>
        );
    }

    if (error) {
        return <EmptyState message={error}/>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-xl w-full">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2 text-center tracking-tight">
                    Ariza topshirish
                </h2>
                <p className="text-xl text-center font-medium text-indigo-600 mb-8">
                    vakansiya: {vacancy?.title || 'Nomaʼlum'}
                </p>

                <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sizning maʼlumotlaringiz:</h3>
                    <div className="text-gray-700 space-y-1">
                        <p>
                            <span className="font-medium">Ism:</span> {user.first_name} {user.last_name}
                        </p>
                        <p>
                            <span className="font-medium">Telefon:</span> {user.phone_number}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-1">
                            Hujjatlarni biriktiring(masalan: Diplom nusxasi, CV, sertifikatlar).
                        </label>
                        <input
                            id="files"
                            name="files"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                        />
                    </div>
                    <div>
                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                            Qo'shimcha malumot
                        </label>
                        <textarea
                            id="feedback"
                            name="feedback"
                            rows="4"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-base"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
                    >
                        {isLoading ? 'Yuborilmoqda...' : 'Arizani yuborish'}
                    </button>
                </form>
            </div>
        </div>
    );
}