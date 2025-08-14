import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import Link from 'next/link';

export default async function VacanciesPage({params}) {
    const {schoolId} = await params;
    const supabase = createSupabaseBrowserClient();

    const {data: vacancies, error} = await supabase
        .from('vacancies')
        .select('id, title, rate')
        .eq('school_id', schoolId);

    if (error) {
        console.error('Error fetching vacancies:', error);
        return <div className="text-center mt-8">Не удалось загрузить вакансии.</div>;
    }

    if (!vacancies || vacancies.length === 0) {
        return <div className="text-center mt-8">Вакансии не найдены для этой школы.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Вакансии</h1>
            <ul className="space-y-4">
                {vacancies.map((vacancy) => (
                    <li key={vacancy.id}
                        className="bg-white rounded-lg shadow-md p-5 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold">{vacancy.title}</h2>
                            <p className="text-gray-600">{vacancy.rate}</p>
                        </div>
                        {/* Ссылка для подачи заявки. Мы создадим эту страницу позже. */}
                        <Link href={`/apply/${vacancy.id}`}
                              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-200">
                            Подать заявку
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}