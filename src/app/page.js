import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import Link from 'next/link';

export default async function Home() {
    const supabase = createSupabaseBrowserClient();
    const {data: regions, error} = await supabase
        .from('regions')
        .select('id, name');

    if (error) {
        console.error('Error fetching regions:', error);
        return <div className="text-center mt-8">Не удалось загрузить регионы.</div>;
    }

    if (!regions || regions.length === 0) {
        return <div className="text-center mt-8">Регионы не найдены.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Выберите регион</h1>
            <ul className="space-y-4">
                {regions.map((region) => (
                    <li key={region.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                        <Link href={`/${region.id}`}
                              className="block p-5 text-lg font-medium text-indigo-600 hover:text-indigo-800">
                            {region.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}