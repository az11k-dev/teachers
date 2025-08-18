// src/app/[regionId]/page.jsx

import DistrictList from "@/components/ui/DistrictList"; // Yangi import

export default async function DistrictsPage({params}) {
    const {regionId} = params; // `await` bu yerda kerak emas

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
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