// src/lib/data/vacancies.jsx
import {createSupabaseServerClient} from "@/lib/supabase/server-client";

export async function getVacancies(schoolId) {
    const supabase = createSupabaseServerClient();
    const {data: vacancies, error} = await supabase
        .from('vacancies')
        .select('id, title, rate')
        .eq('school_id', schoolId);

    if (error) {
        // Добавь эту строку, чтобы увидеть детальную информацию
        console.error('Supabase error details:', error.message);
        throw new Error("Failed to load vacancies.");
    }

    return vacancies;
}