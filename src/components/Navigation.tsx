import { ShoppingCart, Home, Store, Package, LogOut, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartItemCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Navigation({
  currentPage,
  onNavigate,
  cartItemCount,
  isDarkMode,
  onToggleDarkMode,
}: NavigationProps) {
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'shop', label: 'Shop', icon: Store },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: cartItemCount },
    { id: 'shipping', label: 'Orders', icon: Package },
  ];

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center gap-4 md:gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="text-xl md:text-2xl font-bold hover:text-slate-300 transition"
            >
              SneaksLab
            </button>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition relative ${
                    currentPage === item.id
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">{profile?.username}</span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="md:hidden pt-1 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition whitespace-nowrap relative ${
                currentPage === item.id
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span className="font-medium">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
