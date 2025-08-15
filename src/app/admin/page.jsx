// src/app/admin/page.js
import {createSupabaseServerClient} from "@/lib/supabase/server-client";
import AdminPanel from "./AdminPanel";
import EmptyState from "@/components/ui/EmptyState";
import {headers} from "next/headers";

async function getAdminData() {
    const supabase = createSupabaseServerClient();

    // ✅ Await the headers promise
    const headersList = await headers();
    const telegramInitData = headersList.get('telegram-init-data') || '';

    // 1. Validate Telegram user (placeholder)
    const telegramUser = {id: 'some_user_id'}; // Replace with real validation logic

    if (!telegramUser) {
        return {isAdmin: false, error: "Пожалуйста, откройте эту страницу в приложении Telegram."};
    }

    // 2. Check user's admin role
    const {data: userData, error: userError} = await supabase
        .from('users')
        .select('id, role')
        .eq('telegram_id', telegramUser.id)
        .single();

    if (userError || userData?.role !== 'admin') {
        return {isAdmin: false, error: "Доступ запрещён."};
    }

    // 3. Get school IDs for this admin
    const {data: schoolData, error: schoolError} = await supabase
        .from('school_admins')
        .select('school_id')
        .eq('user_id', userData.id);

    if (schoolError || !schoolData?.length) {
        return {isAdmin: false, error: "У вас нет назначенных школ."};
    }

    const adminSchoolIds = schoolData.map(item => item.school_id);

    // 4. Fetch applications for the schools this admin manages
    const {data: applications, error: applicationsError} = await supabase
        .from('applications')
        .select('*, users(first_name, last_name, phone_number, telegram_id), vacancies(title, school_id, schools(name))')
        .in('vacancies.school_id', adminSchoolIds)
        .order('created_at', {ascending: false});

    if (applicationsError) {
        console.error('Error fetching applications:', applicationsError.message);
        return {isAdmin: true, applications: [], error: 'Ошибка загрузки заявок. Пожалуйста, попробуйте снова.'};
    }

    return {isAdmin: true, applications, adminSchoolIds, error: null};
}

export default async function AdminPage() {
    const {isAdmin, applications, adminSchoolIds, error} = await getAdminData();

    if (error) {
        return <EmptyState message={error}/>;
    }

    return <AdminPanel applications={applications} adminSchoolIds={adminSchoolIds}/>;
}