import {
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle,
  X
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban }
];

const Layout = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-1">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold">Team Task Manager</p>
          </div>
        </div>
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden">
          <div className="h-full w-72 bg-white px-5 py-6 shadow-soft">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <p className="font-bold">Team Task Manager</p>
              </div>
              <button className="btn btn-secondary p-2" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button className="btn btn-secondary p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden text-sm text-slate-500 lg:block">Organize projects, assign tasks, ship calmly.</div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <UserCircle className="h-8 w-8 text-slate-500" />
              <button className="btn btn-secondary p-2" onClick={logout} aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
