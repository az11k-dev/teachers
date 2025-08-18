// components/AdminList.js
'use client';

import {useState} from 'react';
import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";

export default function AdminList({admins, onAdminRemoved}) {
    const [deletingId, setDeletingId] = useState(null);
    const supabase = createSupabaseBrowserClient();

    const handleRemoveAdmin = async (userId) => {
        setDeletingId(userId);

        // 1. school_admins jadvalidan foydalanuvchini o'chirish
        const {error: deleteError} = await supabase
            .from('school_admins')
            .delete()
            .eq('user_id', userId);

        if (deleteError) {
            console.error("Adminni o'chirishda xato:", deleteError);
            setDeletingId(null);
            return;
        }

        // 2. Foydalanuvchining rolini 'user'ga qaytarish
        const {error: updateError} = await supabase
            .from('users')
            .update({role: 'user'})
            .eq('id', userId);

        if (updateError) {
            console.error("Foydalanuvchi rolini yangilashda xato:", updateError);
            // Agar xato bo'lsa ham davom etaveramiz, chunki asosiy maqsad bajarildi
        }

        // Parent komponentga ma'lumotlar yangilanishi kerakligini bildirish
        if (onAdminRemoved) {
            onAdminRemoved();
        }

        setDeletingId(null);
    };

    if (admins.length === 0) {
        return <p className="text-gray-500">Hozirda adminlar yo'q.</p>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <ul className="divide-y divide-gray-200">
                {admins.map((admin) => (
                    <li key={admin.id} className="py-4">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {admin.name}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    Admin: {admin.schools}
                                </p>
                            </div>
                            <button
                                onClick={() => handleRemoveAdmin(admin.id)}
                                disabled={deletingId === admin.id}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs disabled:bg-red-300"
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