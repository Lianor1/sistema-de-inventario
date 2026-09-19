import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Products } from './Products';
import { Sales } from './Sales';
import { HR } from './HR';
import { Accounting } from './Accounting';
import { Suppliers } from './Suppliers';
import { Purchases } from './Purchases';
import { Kardex } from './Kardex';
import { CashAudits } from './CashAudits';
import { Expenses } from './Expenses';
import { Shrinkage } from './Shrinkage';
import { PurchaseHistory } from './PurchaseHistory';
import { Home } from './Home';
import { Reports } from './Reports';
import { ManageStore } from './ManageStore';
import { LogOut, Package, ShoppingCart, Users, PieChart, Store, Truck, ShieldAlert, PackagePlus, ClipboardList, DollarSign, TrendingDown, AlertTriangle, History, Activity, Search, Bell, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const allMenuItems = [
    { path: '/', icon: Activity, label: 'Dashboard', roles: ['Super Administrador', 'Administrador'] },
    { path: '/productos', icon: Package, label: 'Inventory', roles: ['Super Administrador', 'Administrador', 'Almacenero', 'Reponedor', 'Inventarista'] },
    { path: '/reportes', icon: BarChart2, label: 'Reports', roles: ['Super Administrador', 'Administrador', 'Contabilidad'] },
    { path: '/proveedores', icon: Truck, label: 'Suppliers', roles: ['Super Administrador', 'Administrador', 'Almacenero'] },
    { path: '/compras', icon: PackagePlus, label: 'Orders', roles: ['Super Administrador', 'Administrador', 'Almacenero'] },
    { path: '/manage-store', icon: Store, label: 'Manage Store', roles: ['Super Administrador', 'Administrador'] },
    { path: '/historial-compras', icon: History, label: 'Historial Compras', roles: ['Super Administrador', 'Administrador', 'Almacenero'] },
    { path: '/mermas', icon: AlertTriangle, label: 'Mermas (Pérdidas)', roles: ['Super Administrador', 'Administrador', 'Almacenero', 'Inventarista'] },
    { path: '/kardex', icon: ClipboardList, label: 'Auditoría Stock', roles: ['Super Administrador', 'Administrador', 'Inventarista'] },
    { path: '/ventas', icon: ShoppingCart, label: 'Punto de Venta', roles: ['Super Administrador', 'Administrador', 'Trabajador', 'Cajero'] },
    { path: '/gastos', icon: TrendingDown, label: 'Caja Chica (Gastos)', roles: ['Super Administrador', 'Administrador', 'Trabajador', 'Cajero', 'Contabilidad'] },
    { path: '/cajas', icon: DollarSign, label: 'Arqueos (Cajas)', roles: ['Super Administrador', 'Administrador', 'Contabilidad'] },
    { path: '/rrhh', icon: Users, label: 'Personal', roles: ['Super Administrador', 'Recursos Humanos'] },
    { path: '/contabilidad', icon: PieChart, label: 'Finanzas', roles: ['Super Administrador', 'Contabilidad'] },
  ];

  const filteredMenu = allMenuItems.filter(item => item.roles.includes(userRole));

  // Componente para proteger rutas según rol
  const RoleRoute = ({ element, allowedRoles }: { element: React.ReactNode, allowedRoles: string[] }) => {
    if (allowedRoles.includes(userRole)) {
      return <>{element}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <ShieldAlert size={64} className="mb-4 text-danger/50" />
        <h2 className="text-2xl font-bold text-slate-600">Acceso Restringido</h2>
        <p className="mt-2 text-center max-w-md">Tu rol de <span className="font-bold text-primary">{userRole}</span> no tiene permisos para ver esta sección.</p>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center mr-3">
            <Store className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-black text-primary tracking-tight">KANBAN</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'text-primary font-bold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon size={18} className={`mr-3 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <LogOut size={18} className="mr-3 text-slate-400" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        
        {/* Topbar */}
        <header className="h-20 bg-white flex items-center justify-between px-8 shrink-0 z-10 border-b border-slate-100">
          <div className="w-96 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-colors"
              placeholder="Search product, supplier, order..."
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-slate-600 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger ring-2 ring-white"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-bold overflow-hidden cursor-pointer">
              {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route path="/productos" element={<RoleRoute element={<Products />} allowedRoles={['Super Administrador', 'Administrador', 'Almacenero', 'Reponedor', 'Inventarista']} />} />
            <Route path="/reportes" element={<RoleRoute element={<Reports />} allowedRoles={['Super Administrador', 'Administrador', 'Contabilidad']} />} />
            <Route path="/mermas" element={<RoleRoute element={<Shrinkage />} allowedRoles={['Super Administrador', 'Administrador', 'Almacenero', 'Inventarista']} />} />
            <Route path="/compras" element={<RoleRoute element={<Purchases />} allowedRoles={['Super Administrador', 'Administrador', 'Almacenero']} />} />
            <Route path="/historial-compras" element={<RoleRoute element={<PurchaseHistory />} allowedRoles={['Super Administrador', 'Administrador', 'Almacenero']} />} />
            <Route path="/kardex" element={<RoleRoute element={<Kardex />} allowedRoles={['Super Administrador', 'Administrador', 'Inventarista']} />} />
            <Route path="/ventas" element={<RoleRoute element={<Sales />} allowedRoles={['Super Administrador', 'Administrador', 'Trabajador', 'Cajero']} />} />
            <Route path="/gastos" element={<RoleRoute element={<Expenses />} allowedRoles={['Super Administrador', 'Administrador', 'Trabajador', 'Cajero', 'Contabilidad']} />} />
            <Route path="/cajas" element={<RoleRoute element={<CashAudits />} allowedRoles={['Super Administrador', 'Administrador', 'Contabilidad']} />} />
            <Route path="/proveedores" element={<RoleRoute element={<Suppliers />} allowedRoles={['Super Administrador', 'Administrador', 'Almacenero']} />} />
            <Route path="/rrhh" element={<RoleRoute element={<HR />} allowedRoles={['Super Administrador', 'Recursos Humanos']} />} />
            <Route path="/contabilidad" element={<RoleRoute element={<Accounting />} allowedRoles={['Super Administrador', 'Contabilidad']} />} />
            <Route path="/manage-store" element={<RoleRoute element={<ManageStore />} allowedRoles={['Super Administrador', 'Administrador']} />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
