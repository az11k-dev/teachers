"use client";

import {useState, useEffect} from "react";
import {createSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import Link from "next/link";
import {BiArrowBack} from "react-icons/bi";

const supabase = createSupabaseBrowserClient();

export default function Schools() {
    const [districts, setDistricts] = useState([]);
    const [schools, setSchools] = useState([]);
    const [newDistrictName, setNewDistrictName] = useState("");
    const [newSchoolName, setNewSchoolName] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [editDistrictId, setEditDistrictId] = useState(null);
    const [editSchoolId, setEditSchoolId] = useState(null);
    const [editingDistrictName, setEditingDistrictName] = useState("");
    const [editingSchoolName, setEditingSchoolName] = useState("");
    const [editingSchoolDistrict, setEditingSchoolDistrict] = useState("");

    useEffect(() => {
        fetchDistricts();
        fetchSchools();
    }, []);

    async function fetchDistricts() {
        const {data, error} = await supabase.from("districts").select("*");
        if (error) console.log("Error fetching districts:", error);
        else setDistricts(data);
    }

    async function fetchSchools() {
        const {data, error} = await supabase.from("schools").select("*, districts(name)");
        if (error) console.log("Error fetching schools:", error);
        else setSchools(data);
    }

    // Districts
    async function addDistrict() {
        if (!newDistrictName) return;
        const {data, error} = await supabase
            .from("districts")
            .insert([{name: newDistrictName}]);
        if (error) {
            console.log("Error adding district:", error);
            alert("Error adding district: " + error.message);
        } else {
            setNewDistrictName("");
            fetchDistricts();
        }
    }

    async function updateDistrict() {
        if (!editingDistrictName || !editDistrictId) return;
        const {data, error} = await supabase
            .from("districts")
            .update({name: editingDistrictName})
            .eq("id", editDistrictId);
        if (error) {
            console.log("Error updating district:", error);
            alert("Error updating district: " + error.message);
        } else {
            setEditDistrictId(null);
            setEditingDistrictName("");
            fetchDistricts();
        }
    }

    async function deleteDistrict(id) {
        if (confirm("Bu tumanni o'chirishga ishonchingiz komilmi?")) {
            const {data, error} = await supabase
                .from("districts")
                .delete()
                .eq("id", id);
            if (error) console.log("Error deleting district:", error);
            else {
                fetchDistricts();
                fetchSchools();
            }
        }
    }

    // Schools
    async function addSchool() {
        if (!newSchoolName || !selectedDistrict) return;
        const {data, error} = await supabase
            .from("schools")
            .insert([{name: newSchoolName, district_id: selectedDistrict}]);
        if (error) {
            console.log("Error adding school:", error);
            alert("Error adding school: " + error.message);
        } else {
            setNewSchoolName("");
            setSelectedDistrict("");
            fetchSchools();
        }
    }

    async function updateSchool() {
        if (!editingSchoolName || !editSchoolId) return;
        const {data, error} = await supabase
            .from("schools")
            .update({name: editingSchoolName, district_id: editingSchoolDistrict})
            .eq("id", editSchoolId);
        if (error) {
            console.log("Error updating school:", error);
            alert("Error updating school: " + error.message);
        } else {
            setEditSchoolId(null);
            setEditingSchoolName("");
            setEditingSchoolDistrict("");
            fetchSchools();
        }
    }

    async function deleteSchool(id) {
        if (confirm("Bu maktabni o'chirishga ishonchingiz komilmi?")) {
            const {data, error} = await supabase
                .from("schools")
                .delete()
                .eq("id", id);
            if (error) console.log("Error deleting school:", error);
            else fetchSchools();
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
            <div className="flex justify-start w-full max-w-xl mb-4">
                <Link href={`/`}>
                    <BiArrowBack size={25}
                                 className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"/>
                </Link>
            </div>
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 text-blue-600 dark:text-blue-400">
                    Maktablar va Tumanlarni Boshqarish
                </h1>

                {/* Tuman qo'shish */}
                <section
                    className="mb-10 p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 border-b-2 border-blue-200 dark:border-blue-700 pb-2">
                        ➕ Tuman Qo'shish
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            className="flex-grow p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Yangi tuman nomi"
                            value={newDistrictName}
                            onChange={(e) => setNewDistrictName(e.target.value)}
                        />
                        <button
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={addDistrict}
                        >
                            Qo'shish
                        </button>
                    </div>
                </section>

                {/* Tumanlar ro'yxati */}
                <section
                    className="mb-10 p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 border-b-2 border-blue-200 dark:border-blue-700 pb-2">
                        📜 Tumanlar Ro'yxati
                    </h2>
                    <ul className="space-y-4">
                        {districts.length > 0 ? (
                            districts.map((district) => (
                                <li
                                    key={district.id}
                                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg"
                                >
                                    {editDistrictId === district.id ? (
                                        <div className="flex-grow w-full flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                className="flex-grow p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-600"
                                                value={editingDistrictName}
                                                onChange={(e) => setEditingDistrictName(e.target.value)}
                                            />
                                            <div className="flex gap-2 mt-2 sm:mt-0">
                                                <button
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold transition-all duration-300 hover:bg-green-700"
                                                    onClick={updateDistrict}
                                                >
                                                    Saqlash
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-gray-400 text-white rounded-md font-semibold transition-all duration-300 hover:bg-gray-500"
                                                    onClick={() => {
                                                        setEditDistrictId(null);
                                                        setEditingDistrictName("");
                                                    }}
                                                >
                                                    Bekor qilish
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-lg font-medium flex-grow mb-2 sm:mb-0">
                                                {district.name}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    className="px-4 py-2 bg-yellow-500 text-white rounded-md font-semibold transition-all duration-300 hover:bg-yellow-600"
                                                    onClick={() => {
                                                        setEditDistrictId(district.id);
                                                        setEditingDistrictName(district.name);
                                                    }}
                                                >
                                                    O'zgartirish
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold transition-all duration-300 hover:bg-red-700"
                                                    onClick={() => deleteDistrict(district.id)}
                                                >
                                                    O'chirish
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 italic">Hali tumanlar mavjud
                                emas.</p>
                        )}
                    </ul>
                </section>

                {/* Maktab qo'shish */}
                <section
                    className="mb-10 p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 border-b-2 border-blue-200 dark:border-blue-700 pb-2">
                        🏫 Maktab Qo'shish
                    </h2>
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="Yangi maktab nomi"
                            value={newSchoolName}
                            onChange={(e) => setNewSchoolName(e.target.value)}
                        />
                        <select
                            className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                        >
                            <option value="">Tumanni tanlang</option>
                            {districts.map((district) => (
                                <option key={district.id} value={district.id}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                        <button
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            onClick={addSchool}
                        >
                            Maktab qo'shish
                        </button>
                    </div>
                </section>

                {/* Maktablar ro'yxati */}
                <section
                    className="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 border-b-2 border-blue-200 dark:border-blue-700 pb-2">
                        📚 Maktablar Ro'yxati
                    </h2>
                    <ul className="space-y-4">
                        {schools.length > 0 ? (
                            schools.map((school) => (
                                <li
                                    key={school.id}
                                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg"
                                >
                                    {editSchoolId === school.id ? (
                                        <div className="flex-grow w-full flex flex-col gap-2">
                                            <input
                                                type="text"
                                                className="p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-600"
                                                value={editingSchoolName}
                                                onChange={(e) => setEditingSchoolName(e.target.value)}
                                            />
                                            <select
                                                className="p-2 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 dark:bg-gray-600"
                                                value={editingSchoolDistrict}
                                                onChange={(e) => setEditingSchoolDistrict(e.target.value)}
                                            >
                                                <option value="">Tumanni tanlang</option>
                                                {districts.map((district) => (
                                                    <option key={district.id} value={district.id}>
                                                        {district.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold transition-all duration-300 hover:bg-green-700"
                                                    onClick={updateSchool}
                                                >
                                                    Saqlash
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-gray-400 text-white rounded-md font-semibold transition-all duration-300 hover:bg-gray-500"
                                                    onClick={() => {
                                                        setEditSchoolId(null);
                                                        setEditingSchoolName("");
                                                        setEditingSchoolDistrict("");
                                                    }}
                                                >
                                                    Bekor qilish
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-lg font-medium flex-grow mb-2 sm:mb-0">
                                                {school.name} <span
                                                className="text-gray-500 dark:text-gray-400">({school.districts.name})</span>
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    className="px-4 py-2 bg-yellow-500 text-white rounded-md font-semibold transition-all duration-300 hover:bg-yellow-600"
                                                    onClick={() => {
                                                        setEditSchoolId(school.id);
                                                        setEditingSchoolName(school.name);
                                                        setEditingSchoolDistrict(school.district_id);
                                                    }}
                                                >
                                                    O'zgartirish
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold transition-all duration-300 hover:bg-red-700"
                                                    onClick={() => deleteSchool(school.id)}
                                                >
                                                    O'chirish
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 italic">Hali maktablar mavjud
                                emas.</p>
                        )}
                    </ul>
                </section>
            </div>
        </div>
    );
}