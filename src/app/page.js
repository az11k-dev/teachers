import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import NavigationLinks from "@/components/ui/NavigationLinks";
import {getRegions} from "@/lib/data/regions";

async function RegionList() {
    try {
        const regions = await getRegions();
        if (!regions || regions.length === 0) {
            return <EmptyState message="No regions found."/>;
        }

        return (
            <ul className="space-y-4">
                {regions.map(({id, name}) => (
                    <li
                        key={id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                        <Link
                            href={`/${id}`}
                            className="block p-5 text-lg font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            {name}
                        </Link>
                    </li>
                ))}
            </ul>
        );
    } catch (error) {
        console.error("Error in RegionList component:", error);
        return <EmptyState message="Failed to load regions."/>;
    }
}

export default async function HomePage() {
    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">Выберите регион</h1>
            <NavigationLinks/>
            <RegionList/>
        </div>
    );
}