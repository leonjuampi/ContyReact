
import Card from '../base/Card';

interface Sale {
  id: string;
  customer: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

const recentSales: Sale[] = [
  { id: 'V-001', customer: 'María González', amount: '$1,234.50', date: '2024-01-15', status: 'completed' },
  { id: 'V-002', customer: 'Carlos Rodríguez', amount: '$856.75', date: '2024-01-15', status: 'completed' },
  { id: 'V-003', customer: 'Ana Martínez', amount: '$2,100.00', date: '2024-01-14', status: 'pending' },
  { id: 'V-004', customer: 'Luis García', amount: '$675.25', date: '2024-01-14', status: 'completed' },
  { id: 'V-005', customer: 'Patricia López', amount: '$1,890.80', date: '2024-01-13', status: 'completed' },
];

export default function RecentSales() {
  const statusColors = {
    completed: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
    pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
    cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
  };

  const statusLabels = {
    completed: 'Completada',
    pending: 'Pendiente',
    cancelled: 'Cancelada'
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ventas Recientes
        </h3>
        <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer">
          Ver todas
        </button>
      </div>

      <div className="space-y-4">
        {recentSales.map((sale) => (
          <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-receipt-line text-white dark:text-black"></i>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {sale.customer}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sale.id} • {sale.date}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[sale.status]}`}>
                {statusLabels[sale.status]}
              </span>
              <p className="font-semibold text-gray-900 dark:text-white">
                {sale.amount}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
