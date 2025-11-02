
import Button from '../../../components/base/Button';

interface TransactionDetailModalProps {
  transaction: any;
  onClose: () => void;
}

export default function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  const items = [
    { id: 1, name: 'Smartphone Galaxy S24', sku: 'SGS24-128', quantity: 1, price: '$299', discount: '$0', subtotal: '$299' },
    { id: 2, name: 'Funda Protectora', sku: 'FND-001', quantity: 1, price: '$25', discount: '$5', subtotal: '$20' },
    { id: 3, name: 'Cargador Rápido', sku: 'CHG-030W', quantity: 1, price: '$35', discount: '$0', subtotal: '$35' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detalle de Transacción
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {transaction.id} • {transaction.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-close-line text-xl"></i>
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Información de la Venta
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cliente:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Vendedor:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.seller}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sucursal:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Canal:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.channel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Información de Pago
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Método:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.payment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{transaction.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Margen:</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">{transaction.margin}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ítems */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Productos ({transaction.items} ítems)
            </h4>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Producto</th>
                    <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">SKU</th>
                    <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Cant.</th>
                    <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Precio</th>
                    <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Desc.</th>
                    <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">
                        {item.sku}
                      </td>
                      <td className="text-right px-4 py-3 text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="text-right px-4 py-3 text-gray-900 dark:text-white">
                        {item.price}
                      </td>
                      <td className="text-right px-4 py-3 text-gray-600 dark:text-gray-400">
                        {item.discount}
                      </td>
                      <td className="text-right px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {item.subtotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div></div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">$359.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Descuentos:</span>
                <span className="text-red-600 dark:text-red-400">-$5.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">IVA (21%):</span>
                <span className="text-gray-900 dark:text-white">$74.34</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">Total:</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{transaction.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline de la transacción */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Historial de la Transacción
            </h4>
            <div className="space-y-4">
              {[
                { time: '14:30', event: 'Venta creada', user: transaction.seller, icon: 'ri-shopping-cart-line' },
                { time: '14:32', event: 'Productos agregados', user: transaction.seller, icon: 'ri-add-line' },
                { time: '14:35', event: 'Pago procesado', user: transaction.seller, icon: 'ri-money-dollar-circle-line' },
                { time: '14:36', event: 'Comprobante generado', user: 'Sistema', icon: 'ri-file-text-line' }
              ].map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={`${event.icon} text-gray-600 dark:text-gray-400`}></i>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.event}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {event.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Por {event.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-printer-line"></i>
            </div>
            Imprimir
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-mail-line"></i>
            </div>
            Enviar por Email
          </Button>
          <Button
            onClick={onClose}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
