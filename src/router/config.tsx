import { RouteObject, Navigate } from 'react-router-dom';
import LoginPage from '../pages/login/page';
import DashboardPage from '../pages/dashboard/page';
import ProductsPage from '../pages/products/page';
import CustomersPage from '../pages/customers/page';
import QuotesPage from '../pages/quotes/page';
import SalesPage from '../pages/sales/page';
import StockPage from '../pages/stock/page';
import ReportsPage from '../pages/reports/page';
import SettingsPage from '../pages/settings/page';
import NotFoundPage from '../pages/NotFound';

// --- 1. Importar nuestros nuevos componentes ---
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

const routes: RouteObject[] = [
  // --- 2. Ruta Pública ---
  {
    path: '/login',
    element: <LoginPage />,
  },
  
  // --- 3. Rutas Protegidas ---
  {
    path: '/',
    element: <ProtectedRoute />, // Revisa si hay login
    children: [
      {
        path: '/',
        element: <AppLayout />, // Muestra Sidebar y Topbar
        children: [
          // Renderiza la página específica
          { path: '/', element: <DashboardPage /> },
          { path: '/dashboard', element: <Navigate to="/" replace /> }, // Alias
          { path: '/home', element: <Navigate to="/" replace /> }, // Alias
          { path: '/productos', element: <ProductsPage /> },
          { path: '/clientes', element: <CustomersPage /> },
          { path: '/presupuestos', element: <QuotesPage /> },
          { path: '/ventas', element: <SalesPage /> },
          { path: '/stock', element: <StockPage /> },
          { path: '/reportes', element: <ReportsPage /> },
          { path: '/configuracion', element: <SettingsPage /> },
        ]
      }
    ]
  },

  // --- 4. Ruta 404 ---
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;