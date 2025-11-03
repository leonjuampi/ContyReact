import { useState, useEffect, useRef } from 'react';
// import Sidebar from '../../../components/feature/Sidebar'; // <--- ELIMINADO
// import TopBar from '../../../components/feature/TopBar'; // <--- ELIMINADO
import Card from '../../../components/base/Card';
import Button from '../../../components/base/Button';

// ... (Todas tus interfaces: QuoteData, QuoteItem, TimelineEvent, etc... no cambian)
interface QuoteData {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  validUntil: string;
  items: QuoteItem[];
  notes: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'expired' | 'converted';
  total: number;
  timeline: TimelineEvent[];
}

interface QuoteItem {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  subtotal: number;
}

interface TimelineEvent {
  date: string;
  type: 'created' | 'sent' | 'viewed' | 'accepted' | 'expired' | 'converted';
  description: string;
  user?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  taxCondition: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
}

interface QuoteEditorProps {
  quote?: QuoteData | null;
  onClose: () => void;
  onSave: (quote: QuoteData) => void;
}


const mockCustomers: Customer[] = [
  // ... (tus datos mock no cambian)
  { id: 'finalConsumer', name: 'Consumidor Final', email: '', phone: '', taxCondition: 'Consumidor Final' },
  { id: 'C001', name: 'María González', email: 'maria@email.com', phone: '+54 11 1234-5678', taxCondition: 'Responsable Inscripto' },
  { id: 'C002', name: 'Carlos Rodríguez', email: 'carlos@email.com', phone: '+54 11 2345-6789', taxCondition: 'Responsable Inscripto' }
];

const mockProducts: Product[] = [
  // ... (tus datos mock no cambian)
  { id: 'P001', name: 'Camisa Manga Larga Blanca', sku: 'CAM001', price: 5500, stock: 25, category: 'Camisas' },
  { id: 'P002', name: 'Pantalón Jean Azul Classic', sku: 'PAN002', price: 8900, stock: 15, category: 'Pantalones' },
  { id: 'P003', name: 'Zapatillas Deportivas Negras', sku: 'ZAP003', price: 12400, stock: 12, category: 'Calzado' }
];

export default function QuoteEditor({ quote, onClose, onSave }: QuoteEditorProps) {
  const [formData, setFormData] = useState<QuoteData>({
    client: mockCustomers[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    notes: '',
    status: 'draft',
    total: 0,
    timeline: []
  });

  const [productInput, setProductInput] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [globalDiscountType, setGlobalDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [shipping, setShipping] = useState(0);
  const [showTimeline, setShowTimeline] = useState(false);

  const productInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quote) {
      setFormData(quote);
    }
  }, [quote]);

  useEffect(() => {
    if (productInputRef.current) {
      productInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Calcular total
    const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = globalDiscountType === 'percentage' 
      ? (subtotal * globalDiscount / 100)
      : globalDiscount;
    const taxAmount = (subtotal - discountAmount) * 0.21;
    const total = subtotal - discountAmount + taxAmount + shipping;
    
    setFormData(prev => ({ ...prev, total }));
  }, [formData.items, globalDiscount, globalDiscountType, shipping]);

  const handleProductInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = productInput.trim();
      if (input) {
        addProductToQuote(input);
        setProductInput('');
      }
    }
  };

  const addProductToQuote = (input: string) => {
    const product = mockProducts.find(p => 
      p.sku.toLowerCase().includes(input.toLowerCase()) ||
      p.name.toLowerCase().includes(input.toLowerCase())
    );

    if (!product) {
      alert('Producto no encontrado');
      return;
    }

    const existingIndex = formData.items.findIndex(item => item.product.id === product.id);
    
    if (existingIndex >= 0) {
      const newItems = [...formData.items];
      newItems[existingIndex].quantity += 1;
      newItems[existingIndex].subtotal = newItems[existingIndex].quantity * newItems[existingIndex].unitPrice * (1 - newItems[existingIndex].discount / 100);
      setFormData(prev => ({ ...prev, items: newItems }));
    } else {
      const newItem: QuoteItem = {
        id: Date.now().toString(),
        product,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
        discountType: 'percentage',
        subtotal: product.price
      };
      setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    const item = newItems[index];
    
    if (field === 'quantity') {
      if (value <= 0) {
        removeItem(index);
        return;
      }
      item.quantity = value;
    } else if (field === 'discount') {
      item.discount = Math.max(0, value);
    }
    
    const discountAmount = item.discountType === 'percentage' 
      ? (item.unitPrice * item.discount / 100)
      : item.discount;
    item.subtotal = (item.unitPrice - discountAmount) * item.quantity;
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSendEmail = () => {
    const newTimeline = [...formData.timeline];
    newTimeline.push({
      date: new Date().toISOString().split('T')[0],
      type: 'sent',
      description: 'Enviado por email',
      user: 'Usuario Actual'
    });
    
    setFormData(prev => ({ 
      ...prev, 
      status: 'sent',
      timeline: newTimeline
    }));
  };

  const handleConvertToSale = () => {
    const newTimeline = [...formData.timeline];
    newTimeline.push({
      date: new Date().toISOString().split('T')[0],
      type: 'converted',
      description: 'Convertido a venta',
      user: 'Usuario Actual'
    });
    
    setFormData(prev => ({ 
      ...prev, 
      status: 'converted',
      timeline: newTimeline
    }));
  };

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const getTimelineIcon = (type: string) => {
    const icons = {
      created: 'ri-add-circle-line',
      sent: 'ri-mail-send-line',
      viewed: 'ri-eye-line',
      accepted: 'ri-check-circle-line',
      expired: 'ri-time-line',
      converted: 'ri-shopping-cart-line'
    };
    return icons[type as keyof typeof icons] || 'ri-circle-line';
  };

  const getTimelineColor = (type: string) => {
    const colors = {
      created: 'text-gray-500',
      sent: 'text-blue-500',
      viewed: 'text-purple-500',
      accepted: 'text-green-500',
      expired: 'text-red-500',
      converted: 'text-emerald-500'
    };
    return colors[type as keyof typeof colors] || 'text-gray-500';
  };

  // 3. JSX modificado: Se quita el div wrapper, Sidebar y TopBar.
  //    El <div className="p-6"> se mantiene porque este componente
  //    reemplaza al de la lista, que también tenía p-6.
  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
              {quote ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {quote ? `Editando: ${quote.client.name}` : 'Crear nueva cotización'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {quote && (
              <Button
                variant="outline"
                onClick={() => setShowTimeline(!showTimeline)}
              >
                <i className="ri-history-line mr-2"></i>
                Timeline
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              <i className="ri-close-line mr-2"></i>
              Cerrar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Encabezado */}
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Cliente</label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer"
                      onClick={() => setShowCustomerModal(true)}
                    >
                      <p className="font-medium text-black dark:text-white">{formData.client.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formData.client.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomerModal(true)}
                    >
                      <i className="ri-search-line"></i>
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Válido hasta</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">N° Presupuesto</label>
                  <input
                    type="text"
                    value={quote?.number || 'PRES-2024-NUEVO'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white pr-8"
                  >
                    <option value="draft">Borrador</option>
                    <option value="sent">Enviado</option>
                    <option value="viewed">Visto</option>
                    <option value="accepted">Aceptado</option>
                    <option value="expired">Vencido</option>
                    <option value="converted">Convertido</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-black dark:text-white mb-2">Notas</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                  placeholder="Notas internas o condiciones especiales..."
                />
              </div>
            </Card>

            {/* Input de producto */}
            <Card>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Agregar producto (código/SKU/nombre)
                  </label>
                  <input
                    ref={productInputRef}
                    type="text"
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    onKeyDown={handleProductInput}
                    placeholder="Escanear código o escribir producto..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-lg"
                    autoFocus
                  />
                </div>
                <div className="flex space-x-2 pt-7">
                  <Button
                    onClick={() => {
                      if (productInput.trim()) {
                        addProductToQuote(productInput.trim());
                        setProductInput('');
                      }
                    }}
                  >
                    <i className="ri-add-line mr-2"></i>
                    Agregar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowProductModal(true)}
                  >
                    <i className="ri-search-line mr-2"></i>
                    Buscar
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tabla de ítems */}
            <Card>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Ítems del Presupuesto</h3>
              
              {formData.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">#</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Producto</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Precio</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Cant.</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Desc. %</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Subtotal</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-2 text-sm text-black dark:text-white">{index + 1}</td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="text-sm font-medium text-black dark:text-white">{item.product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.product.sku}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right text-sm text-black dark:text-white">
                            ${(item.unitPrice / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-16 text-center text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                              min="1"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-16 text-right text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="py-3 px-2 text-right text-sm font-medium text-black dark:text-white">
                            ${(item.subtotal / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <i className="ri-file-list-line text-2xl mb-3"></i>
                  <p>No hay ítems en el presupuesto</p>
                  <p className="text-sm mt-1">Agregue productos usando el campo de arriba</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Totales */}
            <Card>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Totales</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-black dark:text-white">
                    ${(formData.items.reduce((sum, item) => sum + item.subtotal, 0) / 100).toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black dark:text-white">Descuento Global</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={globalDiscount}
                      onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
                      min="0"
                    />
                    <select
                      value={globalDiscountType}
                      onChange={(e) => setGlobalDiscountType(e.target.value as 'percentage' | 'amount')}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm pr-8"
                    >
                      <option value="percentage">%</option>
                      <option value="amount">$</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">IVA (21%):</span>
                  <span className="text-black dark:text-white">
                    ${((formData.items.reduce((sum, item) => sum + item.subtotal, 0) * 0.21) / 100).toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black dark:text-white">Envío</label>
                  <input
                    type="number"
                    value={shipping}
                    onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
                    min="0"
                  />
                </div>
                
                <hr className="border-gray-200 dark:border-gray-700" />
                
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-black dark:text-white">Total:</span>
                  <span className="text-black dark:text-white">${(formData.total / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  fullWidth
                  onClick={handleSendEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <i className="ri-mail-send-line mr-2"></i>
                  Enviar por Email
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => console.log('Enviar WhatsApp')}
                >
                  <i className="ri-whatsapp-line mr-2"></i>
                  Enviar WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => console.log('Descargar PDF')}
                >
                  <i className="ri-download-line mr-2"></i>
                  Descargar PDF (Ctrl+D)
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => console.log('Aceptar con firma')}
                >
                  <i className="ri-quill-pen-line mr-2"></i>
                  Aceptar con Firma
                </Button>
                
                <Button
                  fullWidth
                  onClick={handleConvertToSale}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <i className="ri-shopping-cart-line mr-2"></i>
                  Convertir a Venta
                </Button>
                
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => onSave(formData)}
                >
                  <i className="ri-save-line mr-2"></i>
                  Guardar
                </Button>
              </div>
            </Card>

            {/* Timeline */}
            {showTimeline && quote && (
              <Card>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Timeline</h3>
                <div className="space-y-4">
                  {formData.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${getTimelineColor(event.type)}`}>
                        <i className={`${getTimelineIcon(event.type)} text-sm`}></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black dark:text-white">{event.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.date).toLocaleDateString('es-AR')}
                          {event.user && ` • ${event.user}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal de clientes */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Seleccionar Cliente</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
              />
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, client: customer }));
                    setShowCustomerModal(false);
                  }}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <p className="font-medium text-black dark:text-white">{customer.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de productos */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Seleccionar Producto</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
              />
            </div>
            
            <div className="overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      addProductToQuote(product.sku);
                      setShowProductModal(false);
                    }}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <p className="font-medium text-black dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                    <p className="text-sm font-bold text-black dark:text-white">${(product.price / 100).toFixed(2)}</p>
                    <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}