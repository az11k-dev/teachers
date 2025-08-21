'use client';

import {useState, useEffect} from 'react';
import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import {useRouter} from 'next/navigation';
import {LuFile, LuDownload, LuEye, LuMessageSquare, LuMailOpen} from "react-icons/lu";
import {BiArrowBack, BiCheck, BiXCircle} from "react-icons/bi";

export default function AdminPage() {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminSchoolIds, setAdminSchoolIds] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [comment, setComment] = useState('');
    const [action, setAction] = useState(null);
    const [error, setError] = useState(null);
    const [user, setUser] = useState({});

    useEffect(() => {
        async function initializeAdminPanel() {
            if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
                console.error("Telegram WebApp API not available.");
                setError("Iltimos, bu sahifani Telegram ilovasida oching.");
                setIsLoading(false);
                return;
            }

            window.Telegram.WebApp.ready();
            const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;

            if (!telegramUser) {
                setIsAdmin(false);
                setIsLoading(false);
                return;
            }

            const {data: userData, error: userError} = await supabase
                .from('users')
                .select('id, role')
                .eq('telegram_id', telegramUser?.id)
                .single();
            setUser(userData);

            if (userError || userData.role !== 'admin') {
                setIsAdmin(false);
                setIsLoading(false);
                return;
            }

            const {data: schoolData, error: schoolError} = await supabase
                .from('school_admins')
                .select('school_id')
                .eq('user_id', userData.id);

            if (schoolError || schoolData.length === 0) {
                setIsAdmin(false);
                setIsLoading(false);
                setError("Sizga birorta ham maktab tayinlanmagan.");
                return;
            }

            const schoolIds = schoolData.map(item => item.school_id);
            setAdminSchoolIds(schoolIds);
            setIsAdmin(true);
            await fetchApplications(schoolIds);
        }

        initializeAdminPanel();
    }, [supabase]);

    const fetchApplications = async (schoolIds) => {
        setIsLoading(true);
        const {data, error} = await supabase
            .from('applications')
            .select('*, users(first_name, last_name, phone_number, telegram_id), vacancies(title, school_id, schools(name))')
            .in('vacancies.school_id', schoolIds)
            .not('vacancies', 'is', null)
            .order('created_at', {ascending: false});

        if (error) {
            console.error('Error fetching applications:', error.message);
            setError('Arizalarni yuklashda xatolik. Iltimos, qayta urinib koʻring.');
        } else {
            setApplications(data);
        }
        setIsLoading(false);
    };

    const handleStatusChange = async () => {
        if (!selectedApplication || !action) return;
        setIsLoading(true);

        const {error: updateError} = await supabase
            .from('applications')
            .update({
                status: action,
                admin_comment: comment,
            })
            .eq('id', selectedApplication.id);

        if (updateError) {
            console.error('Error updating status:', updateError.message);
            setError('Holatni yangilashda xatolik. Iltimos, yana bir bor urinib koʻring.');
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
                    user: user
                }),
            });

            if (!notificationRes.ok) {
                console.error('Error sending notification:', await notificationRes.text());
            }

            setSelectedApplication(null);
            setComment('');
            setAction(null);
            await fetchApplications(adminSchoolIds);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <LuMailOpen className="inline-block mr-1"/>;
            case 'accepted':
                return <BiCheck className="inline-block mr-1"/>;
            case 'rejected':
                return <BiXCircle className="inline-block mr-1"/>;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-xl font-medium text-gray-700">Yuklanmoqda...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center">
                    <p className="text-xl font-medium text-red-600">Kirish taqiqlangan.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center">
                    <p className="text-xl font-medium text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="flex justify-start mb-4">
                {/* Orqaga qaytish uchun router.back() dan foydalanamiz */}
                <button onClick={() => router.back()}>
                    <BiArrowBack size={25}
                                 className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"/>
                </button>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-3xl w-full">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
                        Administrator paneli
                    </h1>
                    {applications.length === 0 ? (
                        <p className="text-center text-lg text-gray-600">Hozircha arizalar yoʻq.</p>
                    ) : (
                        <ul className="space-y-4">
                            {applications.map((app) => (
                                <li key={app.id} className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-200">
                                    <div
                                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                        <div className="mb-4 sm:mb-0">
                                            <h2 className="text-xl font-bold text-gray-900">
                                                Arizalar: {app?.vacancies?.title}
                                            </h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                <span
                                                    className="font-medium">Maktab:</span> {app.vacancies.schools?.name || 'Nomaʼlum'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span
                                                    className="font-medium">Dan:</span> {app.users.first_name} {app.users.last_name} ({app.users.phone_number})
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyle(app.status)}`}>
                                                {getStatusIcon(app.status)}
                                                {app.status === 'pending' ? 'Koʻrib chiqilmoqda' : app.status === 'accepted' ? 'Qabul qilingan' : 'Rad etilgan'}
                                            </span>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedApplication(app);
                                                        setAction('accepted');
                                                    }}
                                                    className="p-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                                                    disabled={app.status !== 'pending'}
                                                >
                                                    <BiCheck size={20}/>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedApplication(app);
                                                        setAction('rejected');
                                                    }}
                                                    className="p-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                                                    disabled={app.status !== 'pending'}
                                                >
                                                    <BiXCircle size={20}/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-700 flex items-center">
                                            <LuMessageSquare className="mr-2"/>
                                            <span
                                                className="font-medium">Foydalanuvchi izohi:</span> {app.feedback || "Izoh yoʻq."}
                                        </p>
                                        {app.admin_comment && (
                                            <p className="text-sm text-gray-700 flex items-center mt-2">
                                                <LuEye className="mr-2"/>
                                                <span
                                                    className="font-medium">Administrator izohi:</span> {app.admin_comment}
                                            </p>
                                        )}
                                    </div>
                                    {app.file_paths && app.file_paths.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700 flex items-center mb-2">
                                                <LuFile className="mr-2"/>
                                                Biriktirilgan fayllar:
                                            </p>
                                            <ul className="space-y-1">
                                                {app.file_paths.map((path, index) => (
                                                    <li key={index}>
                                                        <a href={supabase.storage.from('application-documents').getPublicUrl(path).data.publicUrl}
                                                           target="_blank" rel="noopener noreferrer"
                                                           className="flex items-center text-sm text-indigo-600 hover:underline">
                                                            <LuDownload className="mr-2"/>
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
                    )}

                    {selectedApplication && (
                        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
                            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {action === 'accepted' ? 'Arizani qabul qilish' : 'Arizani rad etish'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Siz **{selectedApplication.vacancies.title}** lavozimi uchun
                                    arizani {action === 'accepted' ? 'qabul qilishni' : 'rad etishni'} xohlaysizmi?
                                </p>
                                <p className="text-gray-600 mb-4">
                                    Foydalanuvchi uchun izoh qoʻshishingiz mumkin.
                                </p>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    placeholder="Administrator izohi (ixtiyoriy)"
                                    rows="4"
                                />
                                <div className="mt-6 flex justify-end space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedApplication(null);
                                            setComment('');
                                            setAction(null);
                                        }}
                                        className="px-5 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        onClick={handleStatusChange}
                                        disabled={isLoading}
                                        className={`px-5 py-2 font-semibold text-white rounded-lg transition-colors ${
                                            action === 'accepted' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                        } disabled:opacity-50`}
                                    >
                                        {isLoading ? 'Jarayon ketmoqda...' : 'Tasdiqlash'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}