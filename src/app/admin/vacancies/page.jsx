'use client';

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { BiArrowBack } from "react-icons/bi"; // Добавляем импорт иконки
import { useRouter } from 'next/navigation'; // Добавляем импорт useRouter

const supabase = createSupabaseBrowserClient();

export default function VacanciesPage() {
    const router = useRouter(); // Инициализируем роутер
    const [vacancies, setVacancies] = useState([]);
    const [schoolId, setSchoolId] = useState(null);
    const [form, setForm] = useState({ id: null, title: "", rate: "" });
    const [loading, setLoading] = useState(false);

    // Load user's school_id and fetch vacancies
    useEffect(() => {
        const load = async () => {
            // Проверяем, доступны ли данные Telegram WebApp
            if (typeof window === 'undefined' || !window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
                console.error("Telegram user data not found.");
                return;
            }

            // Получаем telegram_id из данных WebApp
            const telegram_id = window.Telegram.WebApp.initDataUnsafe.user.id;

            // Находим пользователя в таблице 'users' по telegram_id
            const { data: user, error: userError } = await supabase
                .from("users")
                .select("id")
                .eq("telegram_id", telegram_id)
                .single();

            if (userError || !user) {
                console.error("No user found with this Telegram ID.", userError);
                return;
            }

            // Используем найденный user.id для поиска school_admin
            const { data: admin, error: adminError } = await supabase
                .from("school_admins")
                .select("school_id")
                .eq("user_id", user.id)
                .single();

            if (admin) {
                setSchoolId(admin.school_id);
                fetchVacancies(admin.school_id);
            } else {
                console.error("No school admin found for this user.", adminError);
            }
        };
        load();
    }, []);

    // Load vacancies for a specific school
    async function fetchVacancies(id) {
        const { data, error } = await supabase
            .from("vacancies")
            .select("*")
            .eq("school_id", id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching vacancies:", error);
            return;
        }
        setVacancies(data || []);
    }

    // Create or update a vacancy
    async function saveVacancy() {
        if (!schoolId) {
            console.error("School ID is not available.");
            return;
        }
        setLoading(true);

        const vacancyData = {
            title: form.title,
            rate: form.rate,
        };

        let result;
        if (form.id) {
            result = await supabase
                .from("vacancies")
                .update(vacancyData)
                .eq("id", form.id);
        } else {
            result = await supabase.from("vacancies").insert({
                ...vacancyData,
                school_id: schoolId,
            });
        }

        if (result.error) {
            console.error("Error saving vacancy:", result.error);
        } else {
            setForm({ id: null, title: "", rate: "" }); // Reset form
            fetchVacancies(schoolId);
        }

        setLoading(false);
    }

    // Delete a vacancy
    async function deleteVacancy(id) {
        if (!confirm("Are you sure you want to delete this vacancy?")) {
            return;
        }

        setLoading(true);
        const { error } = await supabase.from("vacancies").delete().eq("id", id);

        if (error) {
            console.error("Error deleting vacancy:", error);
        } else if (schoolId) {
            fetchVacancies(schoolId);
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* Кнопка "Назад" */}
            <div className="flex justify-start mb-4">
                <button onClick={() => router.back()}>
                    <BiArrowBack size={25}
                                 className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"/>
                </button>
            </div>

            <div className="flex flex-col items-center">
                <div className="p-6 max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl">
                    <h1 className="text-2xl font-bold mb-4">Manage Vacancies</h1>
                    <div className="space-y-2 mb-6">
                        <input
                            type="text"
                            placeholder="Title"
                            className="w-full border p-2 rounded"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Rate"
                            className="w-full border p-2 rounded"
                            value={form.rate}
                            onChange={(e) => setForm({ ...form, rate: e.target.value })}
                        />
                        <button
                            onClick={saveVacancy}
                            disabled={loading || !form.title || !form.rate}
                            className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600"
                            }`}
                        >
                            {loading
                                ? "Saving..."
                                : form.id
                                    ? "Update Vacancy"
                                    : "Create Vacancy"}
                        </button>
                    </div>
                    <ul className="divide-y border rounded">
                        {vacancies.length > 0 ? (
                            vacancies.map((v) => (
                                <li key={v.id} className="p-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{v.title}</p>
                                        <p className="text-sm text-gray-500">Rate: {v.rate}</p>
                                    </div>
                                    <div className="space-x-2">
                                        <button
                                            className="px-3 py-1 bg-yellow-500 text-white rounded"
                                            onClick={() => setForm({ id: v.id, title: v.title, rate: v.rate })}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="px-3 py-1 bg-red-600 text-white rounded"
                                            onClick={() => deleteVacancy(v.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="p-3 text-center text-gray-500">
                                No vacancies found.
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}