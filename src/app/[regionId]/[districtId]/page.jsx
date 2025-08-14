import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import Link from 'next/link';

export default async function SchoolsPage({params}) {
    const {regionId, districtId} = params;
    const supabase = createSupabaseBrowserClient();

    const {data: schools, error} = await supabase
        .from('schools')
        .select('id, name')
        .eq('district_id', districtId);

    if (error) {
        console.error('Error fetching schools:', error);
        return <div className="text-center mt-8">Не удалось загрузить школы.</div>;
    }

    if (!schools || schools.length === 0) {
        return <div className="text-center mt-8">Школы не найдены для этого района.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Выберите школу</h1>
            <ul className="space-y-4">
                {schools.map((school) => (
                    <li key={school.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                        <Link href={`/${regionId}/${districtId}/${school.id}`}
                              className="block p-5 text-lg font-medium text-indigo-600 hover:text-indigo-800">
                            {school.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}