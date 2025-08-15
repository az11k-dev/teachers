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
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                        <Link
                            href={`/${regionId}/${district.id}`}
                            className="block p-5 text-lg font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            {district.name}
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
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">Выберите район</h1>
            <DistrictList regionId={regionId}/>
        </div>
    );
}