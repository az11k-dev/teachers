import Link from 'next/link';
import EmptyState from "@/components/ui/EmptyState";
import {getSchools} from "@/lib/data/schools";

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
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                        <Link
                            href={`/${regionId}/${districtId}/${school.id}`}
                            className="block p-5 text-lg font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            {school.name}
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
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">Выберите школу</h1>
            <SchoolList regionId={regionId} districtId={districtId}/>
        </div>
    );
}