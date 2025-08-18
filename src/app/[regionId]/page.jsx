// src/app/[regionId]/page.jsx

import Link from 'next/link';
import {BiArrowBack} from "react-icons/bi";
import DistrictList from "@/components/ui/DistrictList"; // Yangi import

export default async function DistrictsPage({params}) {
    const {regionId} = params; // `await` bu yerda kerak emas

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="flex justify-start mb-3">
                <Link href="/">
                    <BiArrowBack size={25} className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"/>
                </Link>
            </div>
            <div className="flex flex-col items-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
                    Tumanni tanlang
                </h1>
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-xl w-full">
                    {/* Komponentni shu yerda ishlatamiz */}
                    <DistrictList regionId={regionId}/>
                </div>
            </div>
        </div>
    );
}