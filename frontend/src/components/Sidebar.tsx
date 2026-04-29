"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/data", label: "Data Master", icon: Database },
  ];

  return (
    <div className="w-[250px] h-screen fixed left-0 top-0 bg-[#161925] border-r border-white/10 flex flex-col p-6 z-10">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-[0_4px_15px_rgba(99,102,241,0.4)]">
          <LayoutDashboard color="white" size={24} />
        </div>
        <h2 className="text-xl font-semibold text-white m-0">Project API</h2>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === "/data" && pathname.startsWith("/data"));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 border-l-[3px] ${
                isActive
                  ? "bg-indigo-500/10 border-indigo-500 text-white font-medium"
                  : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon size={20} className={isActive ? "text-indigo-500" : "text-slate-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
