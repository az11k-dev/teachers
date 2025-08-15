// src/app/admin/AdminPanel.jsx (Это твой старый компонент, но обновленный)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function AdminPanel({ applications: initialApplications, adminSchoolIds }) {
    const supabase = createSupabaseBrowserClient();

    const [applications, setApplications] = useState(initialApplications);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [comment, setComment] = useState('');
    const [action, setAction] = useState(null);
    const [error, setError] = useState(null);

    // This function will be used to re-fetch data after an update
    const fetchApplications = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('applications')
            .select('*, users(first_name, last_name, phone_number, telegram_id), vacancies(title, school_id, schools(name))')
            .in('vacancies.school_id', adminSchoolIds)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching applications:', error.message);
            setError('Ошибка загрузки заявок. Пожалуйста, попробуйте снова.');
        } else {
            setApplications(data);
        }
        setIsLoading(false);
    };

    const handleStatusChange = async () => {
        if (!selectedApplication || !action) return;
        setIsLoading(true);

        const { error: updateError } = await supabase
            .from('applications')
            .update({
                status: action,
                admin_comment: comment,
            })
            .eq('id', selectedApplication.id);

        if (updateError) {
            console.error('Error updating status:', updateError.message);
            setError('Ошибка обновления статуса. Попробуйте еще раз.');
            setIsLoading(false);
        } else {
            const notificationRes = await fetch('/api/notify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegramId: selectedApplication.users.telegram_id,
                    status: action,
                    comment: comment,
                    vacancyTitle: selectedApplication.vacancies.title,
                }),
            });

            if (!notificationRes.ok) {
                console.error('Error sending notification:', await notificationRes.text());
            }

            setSelectedApplication(null);
            setComment('');
            setAction(null);
            await fetchApplications(); // Re-fetch applications to show the updated status
        }
    };


    if (error) {
        return <EmptyState message={error} />;
    }

    if (applications.length === 0) {
        return <EmptyState message="Заявок пока нет." />;
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Панель администратора</h1>
            <ul className="space-y-4">
                {applications.map((app) => (
                    <li key={app.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">Заявка на: {app.vacancies.title}</h2>
                                <p className="text-sm text-gray-500">Школа: {app.vacancies.schools?.name || 'Неизвестно'}</p>
                                <p className="text-sm text-gray-500">
                                    От: {app.users.first_name} {app.users.last_name} ({app.users.phone_number})
                                </p>
                                <p className="text-sm text-gray-500">
                                    Статус: <span className="font-medium">{app.status}</span>
                                </p>
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
                        <p className="text-gray-700">**Комментарий:** {app.feedback || "Нет комментария."}</p>
                        {app.file_paths && app.file_paths.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700">Прикрепленные файлы:</p>
                                <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
                                    {app.file_paths.map((path, index) => (
                                        <li key={index}>
                                            <a href={supabase.storage.from('application-documents').getPublicUrl(path).data.publicUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {path.split('/').pop()}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4 text-center">
                            {action === 'accepted' ? 'Принять заявку' : 'Отклонить заявку'}
                        </h3>
                        <p className="mb-4">
                            Вы уверены, что хотите {action === 'accepted' ? 'принять' : 'отклонить'} заявку на вакансию **{selectedApplication.vacancies.title}**?
                            Вы можете добавить комментарий для пользователя.
                        </p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            placeholder="Комментарий администратора (необязательно)"
                        />
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setSelectedApplication(null);
                                    setComment('');
                                    setAction(null);
                                }}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleStatusChange}
                                disabled={isLoading}
                                className={`px-4 py-2 text-white rounded-md ${
                                    action === 'accepted' ? 'bg-green-600' : 'bg-red-600'
                                } disabled:opacity-50`}
                            >
                                {isLoading ? 'Обработка...' : 'Подтвердить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}