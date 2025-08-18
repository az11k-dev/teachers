// src/app/page.js

import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import NavigationLinks from "@/components/ui/NavigationLinks";
import {getRegions} from "@/lib/data/regions";
import DistrictList from "@/components/ui/DistrictList";
import {redirect} from "next/navigation"; // DistrictList import qilindi

// RegionList komponentini o'zgartiramiz: u endi ma'lumotni o'zi yuklamaydi,
// balki prop orqali qabul qiladi. Bu qayta so'rov yuborishning oldini oladi.
function RegionList({regions}) {
    if (!regions || regions.length === 0) {
        return <EmptyState message="Hududlar topilmadi."/>;
    }

    return (
        <ul className="space-y-4">
            {regions.map(({id, name}) => (
                <li
                    key={id}
                    className="group"
                >
                    <Link
                        href={`/${id}`}
                        className="block p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
                    >
                        <span
                            className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                            {name}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

export default async function HomePage() {
    // 1. Avval hududlarni olamiz
    const regions = await getRegions();

    // 2. Hududlar sonini tekshiramiz
    const isSingleRegion = regions && regions.length === 1;

    redirect("/register");


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-xl w-full">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
                    {/* Sarlavhani shartga qarab o'zgartiramiz */}
                    {isSingleRegion ? "Tumanni tanlang" : "Hududni tanlang"}
                </h1>
                <div className="mb-8">
                    <NavigationLinks/>
                </div>

                {/* 3. Shartga qarab kerakli komponentni ko'rsatamiz */}
                {isSingleRegion ? (
                    <DistrictList regionId={regions[0].id}/>
                ) : (
                    <RegionList regions={regions}/>
                )}
            </div>
        </div>
    );
}