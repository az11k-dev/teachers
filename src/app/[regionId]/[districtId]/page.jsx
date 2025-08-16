import Link from 'next/link';
import EmptyState from "@/components/ui/EmptyState";
import {getSchools} from "@/lib/data/schools";
import {BiArrowBack} from "react-icons/bi";

async function SchoolList({regionId, districtId}) {
    try {
        const schools = await getSchools(districtId);

        if (!schools || schools.length === 0) {
            return <EmptyState message="Школы не найдены для этого района."/>;
        }

        return (
            <ul className="space-y-4">
                {schools.map((school) => (
                    <li
                        key={school.id}
                        className="group"
                    >
                        <Link
                            href={`/${regionId}/${districtId}/${school.id}`}
                            className="block p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
                        >
                            <span
                                className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                                {school.name}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        );
    } catch (error) {
        console.error("Error in SchoolList component:", error);
        return <EmptyState message="Не удалось загрузить школы."/>;
    }
}

export default async function SchoolsPage({params}) {
    const {regionId, districtId} = await params;
    return (
        // Главный контейнер, который теперь не центрирует всё подряд
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* Этот блок с иконкой теперь находится в основном потоке, но не внутри центрирующего контейнера */}
            <div className="flex justify-start mb-4">
                <Link href={`/${regionId}`}>
                    <BiArrowBack size={25} className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"/>
                </Link>
            </div>

            {/* Это основной центрируемый блок для контента */}
            <div className="flex flex-col items-center">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-xl w-full">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
                        Выберите школу
                    </h1>
                    <SchoolList regionId={regionId} districtId={districtId}/>
                </div>
            </div>
        </div>
    );
}