import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users2,
  Ticket,
  ShoppingCart,
  CreditCard,
  UserCircle,
  LogOut,
  Menu,
  ChevronDown,
  PackageIcon,
} from "lucide-react";
import { iconNav } from "../iconMap.jsx";
import { useAuth } from "../contexts/AuthContext";
import clsx from "clsx";

const links = [
  { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/crm", label: "CRM", icon: <Users2 size={18} />, roles: ["admin"] },
  {
    to: "/ticketing",
    label: "Ticketing",
    icon: <Ticket size={18} />,
    roles: ["admin"],
  },
  {
    to: "/orders",
    label: "Orders",
    icon: <ShoppingCart size={18} />,
    roles: ["admin"],
  },
  {
    to: "/inventory",
    label: "Inventory",
    icon: <PackageIcon size={18} />,
    roles: ["admin"],
  },
  {
    to: "/billing",
    label: "Billing",
    icon: <CreditCard size={18} />,
    roles: ["admin"],
  },
  {
    to: "/portal",
    label: "Portal",
    icon: <UserCircle size={18} />,
    roles: ["customer"],
  },
];

const catalogChildren = [
  { to: "/catalog/products", label: "Products", icon: iconNav.products },
  { to: "/catalog/services", label: "Services", icon: iconNav.services },
  { to: "/catalog/rfs", label: "Resources", icon: iconNav.resources },
  { to: "/catalog/offerings", label: "Offerings", icon: iconNav.offerings },
  { to: "/catalog/categories", label: "Categories", icon: iconNav.categories },
  { to: "/catalog/prices", label: "Prices", icon: iconNav.prices },
];

export default function AppSwitcher() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  return (
    <aside
      className={clsx(
        "h-full bg-black text-white flex flex-col transition-all",
        collapsed ? "w-14" : "w-60"
      )}
    >
      {/* toggle */}
      <button
        className="p-3 hover:bg-gray-800"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu size={20} />
      </button>

      <nav className="flex-1 overflow-y-auto space-y-1">
        {/* primary links */}
        {links
          .filter((l) => !l.roles || l.roles.includes(user?.role))
          .map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-2 hover:bg-gray-800",
                  isActive && "bg-gray-800"
                )
              }
            >
              {icon}
              {!collapsed && <span className="text-sm">{label}</span>}
            </NavLink>
          ))}

        {/* catalog subtree */}
        {user?.role === "admin" && (
          <>
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800"
            >
              <PackageIcon size={18} />
              {!collapsed && (
                <>
                  <span className="text-sm flex-1 text-left">Catalog</span>
                  <ChevronDown
                    size={16}
                    className={clsx(
                      "transition-transform",
                      catOpen && "rotate-180"
                    )}
                  />
                </>
              )}
            </button>

            {!collapsed && catOpen && (
              <div className="ml-8">
                {catalogChildren.map(({ to, label, icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-800 rounded",
                        isActive && "bg-gray-800"
                      )
                    }
                  >
                    {icon}
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </>
        )}
      </nav>

      {/* logout */}
      <button
        onClick={logout}
        className="p-4 hover:bg-gray-800 flex items-center gap-3"
      >
        <LogOut size={18} />
        {!collapsed && <span className="text-sm">Logout</span>}
      </button>
    </aside>
  );
}
