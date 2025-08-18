import Link from "next/link";

export default function NavigationLinks() {
    return (
        <div className="flex justify-center space-x-4 mb-6">
            <Link href="/register"
                  className="text-indigo-600 hover:text-indigo-800 border-1 border-indigo-600 p-4 hover:border-none">
                Register
            </Link>
            <Link href="/admin"
                  className="text-indigo-600 hover:text-indigo-800 border-indigo-600 p-4 hover:border-none">
                Admin
            </Link>
            <Link href="/admin/vacancies"
                  className="text-indigo-600 hover:text-indigo-800 border-indigo-600 p-4 hover:border-none">
                Vacancy
            </Link>
        </div>
    );
}