
import { RouteObject } from 'react-router-dom';
import HomePage from '../pages/home/page';
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

const routes: RouteObject[] = [
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/productos',
    element: <ProductsPage />,
  },
  {
    path: '/clientes',
    element: <CustomersPage />,
  },
  {
    path: '/presupuestos',
    element: <QuotesPage />,
  },
  {
    path: '/ventas',
    element: <SalesPage />,
  },
  {
    path: '/stock',
    element: <StockPage />,
  },
  {
    path: '/reportes',
    element: <ReportsPage />,
  },
  {
    path: '/configuracion',
    element: <SettingsPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
