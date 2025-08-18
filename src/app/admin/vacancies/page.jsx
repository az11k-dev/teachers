'use client';

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { BiArrowBack } from "react-icons/bi";
import { useRouter } from 'next/navigation';

const supabase = createSupabaseBrowserClient();

export default function VacanciesPage() {
    const router = useRouter();
    const [vacancies, setVacancies] = useState([]);
    const [schoolId, setSchoolId] = useState(null);
    const [form, setForm] = useState({ id: null, title: "", rate: "" });
    const [loading, setLoading] = useState(false);

    // Load user's school ID and fetch vacancies
    useEffect(() => {
        const load = async () => {
            if (typeof window === 'undefined' || !window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
                console.error("Telegram user data not found.");
                return;
            }

            const telegram_id = window.Telegram.WebApp.initDataUnsafe.user.id;

            const { data: user, error: userError } = await supabase
                .from("users")
                .select("id")
                .eq("telegram_id", telegram_id)
                .single();

            if (userError || !user) {
                console.error("User with this Telegram ID not found.", userError);
                return;
            }

            const { data: admin, error: adminError } = await supabase
                .from("school_admins")
                .select("school_id")
                .eq("user_id", user.id)
                .single();

            if (admin) {
                setSchoolId(admin.school_id);
                fetchVacancies(admin.school_id);
            } else {
                console.error("School admin not found for this user.", adminError);
            }
        };
        load();
    }, []);

    // Fetch vacancies for a specific school
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
            setForm({ id: null, title: "", rate: "" });
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-gray-800">
            <div className="flex flex-col w-full max-w-3xl">
                {/* Back button */}
                <div className="flex justify-start mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                    >
                        <BiArrowBack size={25} />
                    </button>
                </div>

                <div className="p-6 w-full bg-white rounded-2xl shadow-lg border border-gray-200">
                    <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-900">
                        Vakansiyalarni boshqarish
                    </h1>

                    {/* Vacancy Form */}
                    <div className="space-y-4 mb-8">
                        <input
                            type="text"
                            placeholder="Lavozim nomi"
                            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Stavka"
                            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            value={form.rate}
                            onChange={(e) => setForm({ ...form, rate: e.target.value })}
                        />
                        <button
                            onClick={saveVacancy}
                            disabled={loading || !form.title || !form.rate}
                            className={`w-full py-3 rounded-xl font-semibold text-white transition-all transform hover:scale-102
                                ${loading || !form.title || !form.rate
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 active:scale-98"
                            }`}
                        >
                            {loading
                                ? "Saqlanmoqda..."
                                : form.id
                                    ? "Vakansiyani yangilash"
                                    : "Vakansiya yaratish"}
                        </button>
                    </div>

                    {/* Vacancies List */}
                    <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 shadow-sm">
                        {vacancies.length > 0 ? (
                            vacancies.map((v) => (
                                <li key={v.id} className="p-5 flex flex-col sm:flex-row justify-between items-center transition-colors hover:bg-gray-50">
                                    <div className="flex-grow mb-2 sm:mb-0">
                                        <p className="font-bold text-lg text-gray-900">{v.title}</p>
                                        <p className="text-sm text-gray-500">Stavka: {v.rate}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium transition-all hover:bg-yellow-600 active:scale-95"
                                            onClick={() => setForm({ id: v.id, title: v.title, rate: v.rate })}
                                        >
                                            Tahrirlash
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium transition-all hover:bg-red-700 active:scale-95"
                                            onClick={() => deleteVacancy(v.id)}
                                        >
                                            O'chirish
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="p-5 text-center text-gray-500 italic">
                                Vakansiyalar topilmadi.
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}