import React from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Search,
  Bell,
  User2,
} from "lucide-react";
import Logo from "../common/Logo";

// ==========================================
// 1. DATA & CONSTANTS (Keep outside component to prevent re-renders)
// ==========================================
const CURRENT_USER = {
  name: "Amelia Turner",
  role: "Operations Manager",
  workspace: "Acme Retail Supplies",
};

const NAV_LINKS = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/inventory", icon: Package, label: "Inventory" },
  { path: "/orders", icon: ShoppingCart, label: "Orders" },
  { path: "/customers", icon: User2, label: "Customers" },
  // { path: "/users", icon: Users, label: "Users" },
  // { path: "/settings", icon: Settings, label: "Settings" },
];

// ==========================================
// 2. CUSTOM HOOKS (The Brains)
// ==========================================
const useGlobalSearch = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const inputValue = searchParams.get("search") || "";

  const handleSearch = (e) => {
    const term = e.target.value;
    const currentPath = location.pathname;

    // ADDED "/" to this list so Dashboard supports the global search
    const isDataPage = [
      "/",
      "/inventory",
      "/orders",
      "/customers",
      "/users",
    ].some((path) => currentPath === path || currentPath.includes(path));

    if (isDataPage) {
      // This now updates the URL to /?search=... when you are on the dashboard
      navigate(term ? `${currentPath}?search=${term}` : currentPath, {
        replace: true,
      });
    } else if (term) {
      navigate(`/inventory?search=${term}`);
    }
  };

  return { inputValue, handleSearch };
};

// ==========================================
// 3. MAIN LAYOUT COMPONENT (The Skeleton)
// ==========================================
const MainLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet context={{ currentUser: CURRENT_USER }} />
        </main>
      </div>
    </div>
  );
};

// ==========================================
// 4. UI LEGO BLOCKS (Sub-components)
// ==========================================

const Sidebar = () => {
  const navLinkStyles = ({ isActive }) => {
    const baseStyle =
      "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors";
    return isActive
      ? `${baseStyle} bg-blue-50 text-blue-700`
      : `${baseStyle} text-slate-600 hover:bg-slate-50 hover:text-slate-900`;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="flex items-center gap-2.5">
            {/* Use the Logo component here */}
            <Logo className="w-7 h-7 shadow-lg shadow-blue-500/20" />
            <span className="text-xl font-bold text-slate-950 tracking-tighter">
              Stock<span className="text-blue-600 font-extrabold">Flow</span>
            </span>
          </h1>
        </div>

        {/* Dynamic Navigation Rendering */}
        <nav className="flex-1 p-4 space-y-2">
          {NAV_LINKS.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} className={navLinkStyles}>
              <Icon className="w-5 h-5" /> {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Workspace Selector */}
      <div className="p-4 border-t border-slate-200">
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          Workspace
        </p>
        <select className="w-full p-2 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-medium focus:outline-none cursor-pointer">
          <option>{CURRENT_USER.workspace}</option>
        </select>
      </div>
    </aside>
  );
};

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { inputValue, handleSearch } = useGlobalSearch();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between shrink-0">
      {/* Left: Search Bar */}
      <div className="flex-1 max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleSearch}
          placeholder="Search products, orders, customers..."
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        />
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-6">
        {/* Contextual Action Buttons (Only show on Dashboard) */}
        {location.pathname === "/" && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/orders/add")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Create Order
            </button>
            <button
              onClick={() => navigate("/inventory/add")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Add Product
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
            {CURRENT_USER.name.charAt(0)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-bold text-slate-800 leading-tight">
              {CURRENT_USER.name}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {CURRENT_USER.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainLayout;
