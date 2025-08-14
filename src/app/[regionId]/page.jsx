import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import Link from 'next/link';

export default async function DistrictsPage({params}) {
    const {regionId} = params;
    const supabase = createSupabaseBrowserClient();

    const {data: districts, error} = await supabase
        .from('districts')
        .select('id, name')
        .eq('region_id', regionId);

    if (error) {
        console.error('Error fetching districts:', error);
        return <div className="text-center mt-8">Не удалось загрузить районы.</div>;
    }

    if (!districts || districts.length === 0) {
        return <div className="text-center mt-8">Районы не найдены для этого региона.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Выберите район</h1>
            <ul className="space-y-4">
                {districts.map((district) => (
                    <li key={district.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                        <Link href={`/${regionId}/${district.id}`}
                              className="block p-5 text-lg font-medium text-indigo-600 hover:text-indigo-800">
                            {district.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}