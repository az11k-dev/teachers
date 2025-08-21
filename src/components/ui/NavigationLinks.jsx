import Link from "next/link";

export default function NavigationLinks() {
    const links = [
        {href: "/super-asdminss", label: "Super"},
        {href: "/asdminss", label: "Admin"},
        {href: "/asdminss/vacancies", label: "Vacancy"},
        {href: "/super-asdminss/schools", label: "Schools"},
    ];

    return (
        <nav className="flex justify-center gap-3 mb-10 px-10">
            {links.map(({href, label}) => (
                <Link
                    key={href}
                    href={href}
                    className="relative px-6 py-3 rounded-2xl font-medium text-indigo-600
          border border-indigo-300 shadow-md backdrop-blur-sm
          transition-all duration-300 ease-in-out
          hover:text-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600
          hover:shadow-lg hover:scale-105 group"
                >
                    <span className="relative z-10">{label}</span>
                    <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
            bg-gradient-to-r from-indigo-500 to-purple-600 transition duration-300"/>
                </Link>
            ))}
        </nav>
    );
}