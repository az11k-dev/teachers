// app/super-asdminss/page.js
import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import AssignAdminForm from '@/components/AssignAdminForm';
import AdminList from '@/components/AdminList';
import {revalidatePath} from 'next/cache';
import Link from "next/link";
import {BiArrowBack} from "react-icons/bi";

// Bu qator Next.js ga sahifani statik keshlamaslikni aytadi
export const dynamic = 'force-dynamic';

async function getAdminsAndUsersAndSchools() {
    const supabase = createSupabaseBrowserClient();
    const {data: users, error: usersError} = await supabase
        .from('users')
        .select(`
            id, 
            first_name, 
            last_name, 
            role,
            school_admins ( school_id, schools ( name ) )
        `);

    if (usersError) {
        console.error('Foydalanuvchilarni olishda xato:', usersError);
        return {users: [], schools: [], admins: []};
    }

    const {data: schools, error: schoolsError} = await supabase
        .from('schools')
        .select('id, name');

    if (schoolsError) {
        console.error('Maktablarni olishda xato:', schoolsError);
        return {users: [], schools: [], admins: []};
    }

    // Role bo'yicha ajratib olamiz
    const allAdmins = users.filter(user => user.role === 'admin');
    const allNonAdmins = users.filter(user => user.role === 'user');

    // Adminlarni maktab nomi bilan birga formatlaymiz
    const formattedAdmins = allAdmins.map(admin => ({
        id: admin.id,
        name: `${admin.first_name} ${admin.last_name}`,
        schools: admin.school_admins.map(sa => sa.schools.name).join(', ')
    }));

    return {
        users: allNonAdmins,
        schools: schools,
        admins: formattedAdmins
    };
}

// Server action
export async function revalidateSuperAdminPage() {
    'use server';
    revalidatePath('/super-asdminss');
}

export default async function SuperAdminPage() {
    const {users, schools, admins} = await getAdminsAndUsersAndSchools();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-5xl">
                <div className="flex justify-start mb-6">
                    <Link href="/">
                        <BiArrowBack size={25}
                                     className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"/>
                    </Link>
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-10">Super Admin Paneli</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin tayinlash</h2>
                        <AssignAdminForm users={users} schools={schools} onAdminAssigned={revalidateSuperAdminPage}/>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Hozirgi Adminlar</h2>
                        <AdminList admins={admins} onAdminRemoved={revalidateSuperAdminPage}/>
                    </div>
                </div>
            </div>
        </div>
    );
}