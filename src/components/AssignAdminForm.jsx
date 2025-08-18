'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function AssignAdminForm({ users, schools, onAdminAssigned }) {
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedSchool, setSelectedSchool] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createSupabaseBrowserClient()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        if (!selectedUser || !selectedSchool) {
            setMessage('Iltimos, foydalanuvchi va maktabni tanlang.');
            setIsLoading(false);
            return;
        }

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

        if (onAdminAssigned) {
            onAdminAssigned();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="user-select" className="block text-gray-700 text-sm font-medium mb-2">
                    Foydalanuvchini tanlang:
                </label>
                <select
                    id="user-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
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
            <div>
                <label htmlFor="school-select" className="block text-gray-700 text-sm font-medium mb-2">
                    Maktabni tanlang:
                </label>
                <select
                    id="school-select"
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-102 disabled:bg-blue-400 disabled:cursor-not-allowed"
                disabled={isLoading}
            >
                {isLoading ? 'Yuklanmoqda...' : 'Admin tayinlash'}
            </button>
            {message && (
                <p className={`mt-4 text-center font-medium ${message.includes('muvaffaqiyatli') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
        </form>
    );
}