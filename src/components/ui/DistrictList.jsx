// src/components/ui/DistrictList.jsx

import Link from 'next/link';
import EmptyState from "@/components/ui/EmptyState";
import {getDistricts} from "@/lib/data/districts";

export default async function DistrictList({regionId}) {
    try {
        const districts = await getDistricts(regionId);

        if (!districts || districts.length === 0) {
            return <EmptyState message="Bu hudud uchun tumanlar topilmadi."/>;
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
        return <EmptyState message="Tumanlarni yuklab bo‘lmadi."/>;
    }
}