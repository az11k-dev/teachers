import Link from 'next/link';
import EmptyState from "@/components/ui/EmptyState";
import {getDistricts} from "@/lib/data/districts";

async function DistrictList({regionId}) {
    try {
        const districts = await getDistricts(regionId);

        if (!districts || districts.length === 0) {
            return <EmptyState message="Районы не найдены для этого региона."/>;
        }

        return (
            <ul className="space-y-4">
                {districts.map((district) => (
                    <li
                        key={district.id}
                        className="group"
                    >
                        <Link
                            href={`/${regionId}/${district.id}`}
                            className="block p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
                        >
                            <span
                                className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                                {district.name}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        );
    } catch (error) {
        console.error("Error in DistrictList component:", error);
        return <EmptyState message="Не удалось загрузить районы."/>;
    }
}

export default async function DistrictsPage({params}) {
    const {regionId} = await params;
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-xl w-full">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
                    Выберите район
                </h1>
                <DistrictList regionId={regionId}/>
            </div>
        </div>
    );
}