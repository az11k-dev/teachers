import Link from 'next/link';
import EmptyState from "@/components/ui/EmptyState";
import {getVacancies} from "@/lib/data/vacancies";

async function VacancyList({schoolId}) {
    try {
        const vacancies = await getVacancies(schoolId);

        if (!vacancies || vacancies.length === 0) {
            return <EmptyState message="Вакансии не найдены для этой школы."/>;
        }

        return (
            <ul className="space-y-4">
                {vacancies.map((vacancy) => (
                    <li
                        key={vacancy.id}
                        className="group bg-white rounded-xl shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out p-5 flex justify-between items-center border border-gray-200"
                    >
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">Vakansiya: {vacancy.title}</h2>
                            <p className="text-gray-500 font-medium">Stavka: {vacancy.rate}</p>
                        </div>
                        <Link
                            href={`/apply/${vacancy.id}`}
                            className="px-5 ml-2 text-center py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Подать заявку
                        </Link>
                    </li>
                ))}
            </ul>
        );
    } catch (error) {
        console.error("Error in VacancyList component:", error);
        return <EmptyState message="Не удалось загрузить вакансии."/>;
    }
}

export default async function VacanciesPage({params}) {
    const {schoolId} = await params;
    const schoolIdAsNumber = parseInt(schoolId, 10);

    if (isNaN(schoolIdAsNumber)) {
        return <EmptyState message="Некорректный идентификатор школы."/>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-xl w-full">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
                    Вакансии
                </h1>
                <VacancyList schoolId={schoolIdAsNumber}/>
            </div>
        </div>
    );
}