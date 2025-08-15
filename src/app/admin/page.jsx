import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import AdminPanel from "./AdminPanel";
import EmptyState from "@/components/ui/EmptyState";
import { headers } from "next/headers";
import { parse } from 'querystring';

// Вспомогательная функция для парсинга initData
function parseTelegramInitData(initData) {
    try {
        const decoded = parse(initData);
        // data.user должен быть JSON-строкой, парсим её
        if (decoded.user) {
            return JSON.parse(decoded.user);
        }
        return null;
    } catch (e) {
        console.error("Error parsing Telegram initData:", e);
        return null;
    }
}

async function getAdminData() {
    const supabase = createSupabaseServerClient();

    // 1. Получаем заголовки и извлекаем telegram-init-data
    const headersList = headers();
    const telegramInitData = headersList.get('telegram-init-data') || '';

    // 2. Декодируем initData и получаем данные пользователя
    const telegramUser = parseTelegramInitData(telegramInitData);

    if (!telegramUser?.id) {
        return { isAdmin: false, error: "Пожалуйста, откройте эту страницу в приложении Telegram." };
    }

    // 3. Используем настоящий ID пользователя
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('telegram_id', telegramUser.id)
        .single();

    if (userError || userData?.role !== 'admin') {
        return { isAdmin: false, error: "Доступ запрещён." };
    }

    // 4. Получаем ID школ для этого администратора
    const { data: schoolData, error: schoolError } = await supabase
        .from('school_admins')
        .select('school_id')
        .eq('user_id', userData.id);

    if (schoolError || !schoolData?.length) {
        return { isAdmin: false, error: "У вас нет назначенных школ." };
    }

    const adminSchoolIds = schoolData.map(item => item.school_id);

    // 5. Загружаем заявки для школ, которыми управляет администратор
    const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('*, users(first_name, last_name, phone_number, telegram_id), vacancies(title, school_id, schools(name))')
        .in('vacancies.school_id', adminSchoolIds)
        .order('created_at', { ascending: false });

    if (applicationsError) {
        console.error('Error fetching applications:', applicationsError.message);
        return { isAdmin: true, applications: [], error: 'Ошибка загрузки заявок. Пожалуйста, попробуйте снова.' };
    }

    return { isAdmin: true, applications, adminSchoolIds, error: null };
}

export default async function AdminPage() {
    const { isAdmin, applications, adminSchoolIds, error } = await getAdminData();

    if (error) {
        return <EmptyState message={error} />;
    }

    return <AdminPanel applications={applications} adminSchoolIds={adminSchoolIds} />;
}