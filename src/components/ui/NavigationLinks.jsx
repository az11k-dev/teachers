import Link from "next/link";

export default function NavigationLinks() {
    return (
        <div className="flex justify-center space-x-4 mb-6">
            <Link href="/register" className="text-indigo-600 hover:text-indigo-800">
                Register
            </Link>
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">
                Admin
            </Link>
        </div>
    );
}