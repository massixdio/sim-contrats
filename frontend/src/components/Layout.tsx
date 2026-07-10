import { useState, ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v10a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z" />
    </svg>
  );
}

function ContractsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0013.414 6L10 2.586A2 2 0 008.586 2H4zm2 10a1 1 0 100 2h4a1 1 0 100-2H6zm0-4a1 1 0 000 2h4a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ClientsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.175A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
    </svg>
  );
}

function InsurersIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M4 16V4a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v9h1a1 1 0 110 2H2a1 1 0 110-2h2zm3-10a1 1 0 000 2h.01a1 1 0 100-2H7zm0 3a1 1 0 000 2h.01a1 1 0 100-2H7zm3-3a1 1 0 000 2h.01a1 1 0 100-2H10zm0 3a1 1 0 000 2h.01a1 1 0 100-2H10zm3 1a1 1 0 011-1h.01a1 1 0 110 2H14a1 1 0 01-1-1zm-6 4a1 1 0 011-1h2a1 1 0 011 1v3H7v-3z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path
        fillRule="evenodd"
        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const links: { to: string; label: string; end?: boolean; icon: ReactNode }[] = [
  { to: "/", label: "Tableau de bord", end: true, icon: <DashboardIcon /> },
  { to: "/contracts", label: "Contrats", icon: <ContractsIcon /> },
  { to: "/clients", label: "Clients", icon: <ClientsIcon /> },
  { to: "/insurers", label: "Compagnies", icon: <InsurersIcon /> },
  { to: "/payments", label: "Paiements", icon: <PaymentsIcon /> },
];

export function Layout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 transform border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-700 to-secondary-500 text-sm font-bold text-white">
              S
            </span>
            <span className="text-base font-semibold leading-tight text-primary-800">Sim Assurance</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 md:hidden"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md border-l-[3px] px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-secondary-500 bg-primary-50 text-primary-800"
                    : "border-transparent text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 md:hidden"
            aria-label="Ouvrir le menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden text-sm text-gray-600 sm:inline">
              {user?.name} <span className="text-gray-400">({user?.role})</span>
            </span>
            <button
              onClick={logout}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Déconnexion
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
