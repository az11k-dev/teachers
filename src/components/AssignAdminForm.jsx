// components/AssignAdminForm.js
'use client';

import { useState } from 'react';
import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";

export default function AssignAdminForm({ users, schools }) {
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedSchool, setSelectedSchool] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createSupabaseBrowserClient();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        if (!selectedUser || !selectedSchool) {
            setMessage('Iltimos, foydalanuvchi va maktabni tanlang.');
            setIsLoading(false);
            return;
        }

        // 1. Adminni school_admins jadvaliga kiritamiz
        const { error: insertError } = await supabase
            .from('school_admins')
            .insert([{ user_id: selectedUser, school_id: selectedSchool }]);

        if (insertError) {
            if (insertError.code === '23505') {
                setMessage('Bu foydalanuvchi allaqachon bu maktab uchun admin qilib tayinlangan.');
            } else {
                setMessage('Admin tayinlashda xato yuz berdi: ' + insertError.message);
            }
            setIsLoading(false);
            return;
        }

        // 2. Foydalanuvchining rolini 'admin' ga yangilaymiz
        const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', selectedUser);

        if (updateError) {
            setMessage('Foydalanuvchi rolini yangilashda xato yuz berdi: ' + updateError.message);
            console.error('Update xatosi:', updateError);
            setIsLoading(false);
            return;
        }

        setMessage('Admin muvaffaqiyatli tayinlandi!');
        setSelectedUser('');
        setSelectedSchool('');
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
            {/* Avvalgi forma qismi o'zgarishsiz qoladi */}
            <div className="mb-4">
                <label htmlFor="user-select" className="block text-gray-700 text-sm font-bold mb-2">
                    Foydalanuvchini tanlang:
                </label>
                <select
                    id="user-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                >
                    <option value="" disabled>Foydalanuvchi tanlang</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-6">
                <label htmlFor="school-select" className="block text-gray-700 text-sm font-bold mb-2">
                    Maktabni tanlang:
                </label>
                <select
                    id="school-select"
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                >
                    <option value="" disabled>Maktab tanlang</option>
                    {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                            {school.name}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300"
                disabled={isLoading}
            >
                {isLoading ? 'Yuklanmoqda...' : 'Admin tayinlash'}
            </button>
            {message && (
                <p className={`mt-4 ${message.includes('muvaffaqiyatli') ? 'text-green-500' : 'text-red-500'}`}>
                    {message}
                </p>
            )}
        </form>
    );
}