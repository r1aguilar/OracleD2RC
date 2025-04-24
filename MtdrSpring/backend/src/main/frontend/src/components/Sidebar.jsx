// Sidebar.jsx
import React from "react";
import {
  LayoutDashboard,
  Folder,
  LogOut,
  FileChartPie,
  User,
} from "lucide-react";
import taskoLogo from "../Assets/tasko.png";

const navItems = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard" },
  { icon: <Folder size={20} />, label: "Backlog" },
  { icon: <FileChartPie size={20} />, label: "Analytics" },
  { icon: <User size={20} />, label: "Profile" },
  { icon: <LogOut size={20} />, label: "Logout" },
];

const Sidebar = ({ isMobileOpen, closeMobile }) => {
  return (
    <aside
      className={`${
        isMobileOpen ? "absolute z-50 left-0 top-0 h-full w-56" : "hidden"
      } md:flex fixed md:static top-0 left-0 h-full bg-[#121212] text-white px-2 py-4
      flex-col items-center transition-all duration-300 ease-in-out
      w-16 hover:w-56 overflow-hidden group z-40`}
    >
      <img src={taskoLogo} alt="Tasko Logo" className="w-14 md:w-20 mb-6 transition-all duration-300" />

      <nav className="flex flex-col gap-6 w-full items-center group-hover:items-start">
        {navItems.map(({ icon, label }, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 text-sm cursor-pointer text-white hover:text-red-500 w-full px-2"
            onClick={closeMobile}
          >
            {icon}
            <span className="whitespace-nowrap hidden group-hover:inline-block">
              {label}
            </span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
