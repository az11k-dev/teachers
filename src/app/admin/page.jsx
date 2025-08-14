'use client';

import {useState, useEffect} from 'react';
import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";

// Эмуляция Telegram Web App SDK
const telegramWebApp = {
    initDataUnsafe: {
        user: {
            id: 123456789, // Замените на ID вашего админа для тестирования
        },
    },
};

export default function AdminPage() {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [comment, setComment] = useState('');
    const [action, setAction] = useState(null);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        // Проверка, является ли пользователь админом
        const adminId = 123456789;
        if (telegramWebApp.initDataUnsafe.user.id !== adminId) {
            setIsAdmin(false);
            setIsLoading(false);
            return;
        }

        setIsAdmin(true);
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        // В реальной жизни нужно будет получить school_id админа
        // Мы для примера загрузим все заявки
        setIsLoading(true);
        const {data, error} = await supabase
            .from('applications')
            .select('*, users(first_name, last_name, phone_number, telegram_id), vacancies(title, school_id)')
            .order('created_at', {ascending: false});

        if (error) {
            console.error('Error fetching applications:', error.message);
        } else {
            setApplications(data);
        }
        setIsLoading(false);
    };

    const handleStatusChange = async () => {
        if (!selectedApplication || !action) return;

        setIsLoading(true);
        const {error} = await supabase
            .from('applications')
            .update({
                status: action,
                admin_comment: comment,
            })
            .eq('id', selectedApplication.id);

        if (error) {
            console.error('Error updating status:', error.message);
            setIsLoading(false);
        } else {
            // **Новый код: Отправляем уведомление**
            console.log(selectedApplication.users.telegram_id);
            const notificationRes = await fetch('/api/notify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId: selectedApplication.users.telegram_id,
                    status: action,
                    comment: comment,
                }),
            });

            if (!notificationRes.ok) {
                console.error('Error sending notification:', await notificationRes.text());
            }

            alert(`Заявка ${selectedApplication.id} была ${action === 'accepted' ? 'принята' : 'отклонена'}.`);
            setSelectedApplication(null);
            setComment('');
            setAction(null);
            fetchApplications(); // Обновляем список
        }
        setIsLoading(false);
    };


    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Доступ запрещён.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Загрузка заявок...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Панель администратора</h1>
            {applications.length === 0 ? (
                <p className="text-center">Заявок пока нет.</p>
            ) : (
                <ul className="space-y-4">
                    {applications.map((app) => (
                        <li key={app.id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold">{app.vacancies.title}</h2>
                                    <p className="text-sm text-gray-500">
                                        От: {app.users.first_name} {app.users.last_name} ({app.users.phone_number})
                                    </p>
                                    <p className="text-sm text-gray-500">Статус: {app.status}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedApplication(app);
                                            setAction('accepted');
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400"
                                        disabled={app.status !== 'pending'}
                                    >
                                        Принять
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedApplication(app);
                                            setAction('rejected');
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-400"
                                        disabled={app.status !== 'pending'}
                                    >
                                        Отклонить
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-700">{app.feedback}</p>
                        </li>
                    ))}
                </ul>
            )}

            {selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-xl font-bold mb-4">
                            {action === 'accepted' ? 'Принять' : 'Отклонить'} заявку
                        </h3>
                        <p className="mb-4">
                            Вы уверены, что хотите {action === 'accepted' ? 'принять' : 'отклонить'} заявку?
                            Вы можете добавить комментарий.
                        </p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            placeholder="Комментарий администратора (необязательно)"
                        />
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setSelectedApplication(null)}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleStatusChange}
                                className={`px-4 py-2 text-white rounded-md ${
                                    action === 'accepted' ? 'bg-green-600' : 'bg-red-600'
                                }`}
                            >
                                Подтвердить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}