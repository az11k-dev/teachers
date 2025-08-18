'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function AdminList({ admins, onAdminRemoved }) {
    const [deletingId, setDeletingId] = useState(null);
    const supabase = createSupabaseBrowserClient();

    const handleRemoveAdmin = async (userId) => {
        if (!confirm("Haqiqatan ham bu adminni o'chirmoqchimisiz?")) {
            return;
        }
        setDeletingId(userId);

        const { error: deleteError } = await supabase
            .from('school_admins')
            .delete()
            .eq('user_id', userId);

        if (deleteError) {
            console.error("Adminni o'chirishda xato:", deleteError);
            setDeletingId(null);
            return;
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'user' })
            .eq('id', userId);

        if (updateError) {
            console.error("Foydalanuvchi rolini yangilashda xato:", updateError);
        }

        if (onAdminRemoved) {
            onAdminRemoved();
        }

        setDeletingId(null);
    };

    if (admins.length === 0) {
        return <p className="text-gray-500 italic text-center">Hozirda adminlar yo'q.</p>;
    }

    return (
        <div className="bg-white rounded-xl">
            <ul className="divide-y divide-gray-200">
                {admins.map((admin) => (
                    <li key={admin.id} className="py-4 px-2 transition-colors duration-200 hover:bg-gray-50">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-semibold text-gray-900 truncate">
                                    {admin.name}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Admin: {admin.schools}
                                </p>
                            </div>
                            <button
                                onClick={() => handleRemoveAdmin(admin.id)}
                                disabled={deletingId === admin.id}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-200 disabled:bg-red-400 disabled:cursor-not-allowed"
                            >
                                {deletingId === admin.id ? "O'chirilmoqda..." : "O'chirish"}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}