// app/super-admin/page.js
import {supabase} from '@/lib/supabase';
import AssignAdminForm from '@/components/AssignAdminForm';
import AdminList from '@/components/AdminList';
import {revalidatePath} from 'next/cache';

// Bu qator Next.js ga sahifani statik keshlamaslikni aytadi
export const dynamic = 'force-dynamic';

async function getAdminsAndUsersAndSchools() {
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
                    <AssignAdminForm users={users} schools={schools} onAdminAssigned={revalidateSuperAdminPage}/>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Hozirgi Adminlar</h2>
                    <AdminList admins={admins} onAdminRemoved={revalidateSuperAdminPage}/>
                </div>
            </div>
        </div>
    );
}