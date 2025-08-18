// app/super-admin/page.js
import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import AssignAdminForm from '@/components/AssignAdminForm';
import AdminList from '@/components/AdminList';
import {revalidatePath} from 'next/cache';

async function getAdminsAndUsersAndSchools() {
    const supabase = createSupabaseBrowserClient();
    // ... avvalgi kod o'zgarishsiz qoladi
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

    const allAdmins = users.filter(user => user.role === 'admin');
    const allNonAdmins = users.filter(user => user.role === 'user');

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

// Yangi server action funksiyasi
export async function removeAdminAction() {
    'use server';
    revalidatePath('/super-admin');
}

export default async function SuperAdminPage() {
    const {users, schools, admins} = await getAdminsAndUsersAndSchools();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Super Admin Paneli</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Admin tayinlash</h2>
                    <AssignAdminForm users={users} schools={schools}/>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Hozirgi Adminlar</h2>
                    {/* Yangi propni qo'shamiz */}
                    <AdminList admins={admins} onAdminRemoved={removeAdminAction}/>
                </div>
            </div>
        </div>
    );
}