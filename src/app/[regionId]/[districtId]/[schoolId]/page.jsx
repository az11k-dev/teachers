import Link from 'next/link';
import EmptyState from "@/components/ui/EmptyState";
import {getVacancies} from "@/lib/data/vacancies";

async function VacancyList({schoolId}) {
    try {
        // Мы передаем schoolId уже в виде числа, так что здесь всё в порядке
        const vacancies = await getVacancies(schoolId);

        if (!vacancies || vacancies.length === 0) {
            return <EmptyState message="Вакансии не найдены для этой школы."/>;
        }

        return (
            <ul className="space-y-4">
                {vacancies.map((vacancy) => (
                    <li
                        key={vacancy.id}
                        className="bg-white rounded-lg shadow-md p-5 flex justify-between items-center"
                    >
                        <div>
                            <h2 className="text-xl font-semibold">{vacancy.title}</h2>
                            <p className="text-gray-600">{vacancy.rate}</p>
                        </div>
                        <Link
                            href={`/apply/${vacancy.id}`}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                        >
                            Подать заявку
                        </Link>
                    </li>
                ))}
            </ul>
        );
    } catch (error) {
        console.error("Error in VacancyList component:", error);
        // Обработка ошибки
        return <EmptyState message="Не удалось загрузить вакансии."/>;
    }
}

export default async function VacanciesPage({params}) {
    const {schoolId} = await params;

    // 💡 Ключевое изменение: преобразуем schoolId в целое число.
    const schoolIdAsNumber = parseInt(schoolId, 10);

    // Проверяем, является ли schoolId корректным числом.
    // Если нет, возвращаем страницу с ошибкой.
    if (isNaN(schoolIdAsNumber)) {
        return <EmptyState message="Некорректный идентификатор школы."/>;
    }

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">Вакансии</h1>
            {/* Передаем числовое значение в компонент */}
            <VacancyList schoolId={schoolIdAsNumber}/>
        </div>
    );
}