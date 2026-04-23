import {
  BarChart3,
  Banknote,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  Users,
  WalletCards,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import type { ElementType } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const links: Array<{ to: string; label: string; icon: ElementType; roles?: Role[] }> = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/prestamos", label: "Prestamos", icon: Banknote },
  { to: "/simulador", label: "Simulador", icon: WalletCards },
  { to: "/cobros", label: "Cobros", icon: CreditCard },
  { to: "/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/configuracion", label: "Configuracion", icon: Settings, roles: ["admin"] },
  { to: "/usuarios", label: "Usuarios", icon: ReceiptText, roles: ["admin"] }
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const visibleLinks = links.filter((link) => !link.roles || (user && link.roles.includes(user.role)));

  const content = (
    <aside className="flex h-full w-72 flex-col bg-navy-950 text-white">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-200">Finanzas</p>
          <h1 className="text-xl font-black">Sistema de Prestamos</h1>
        </div>
        <button className="lg:hidden" onClick={() => setOpen(false)}>
          <X />
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-white/10",
                  isActive && "bg-white text-navy-950 shadow-lg"
                )
              }
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-4 rounded-2xl bg-white/10 p-4">
          <p className="font-bold">{user?.fullName}</p>
          <p className="text-sm capitalize text-blue-100">{user?.role === "admin" ? "Administrador" : "Cobrador"}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      <button
        className="fixed left-4 top-4 z-40 rounded-2xl bg-navy-950 p-3 text-white shadow-soft lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu />
      </button>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">{content}</div>
      {open ? <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)}>{content}</div> : null}
    </>
  );
}
