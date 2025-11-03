// 1. Imports eliminados: Sidebar, TopBar
import { useState, useEffect, useRef } from 'react';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
  hasVariants?: boolean;
  hasLots?: boolean;
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  subtotal: number;
}

interface Customer {
  id: string;
  name: string;
  dni?: string;
  cuit?: string;
  email: string;
  phone: string;
  taxCondition: string;
  debt: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  installments?: number[];
  surcharge?: number;
}

const mockProducts: Product[] = [
  // ... (tus datos mock no cambian)
  { id: 'P001', name: 'Smartphone Galaxy S24', sku: 'SAM-S24-256', price: 899999, stock: 15, category: 'Electrónicos', barcode: '7891234567890' },
  { id: 'P002', name: 'Auriculares Bluetooth Sony', sku: 'SON-WH1000', price: 149999, stock: 32, category: 'Accesorios', barcode: '7891234567891' },
  { id: 'P003', name: 'Tablet Android 12"', sku: 'TAB-AND-12', price: 299999, stock: 8, category: 'Electrónicos', barcode: '7891234567892' },
  { id: 'P004', name: 'Smartwatch Series 9', sku: 'APL-SW-S9', price: 399999, stock: 12, category: 'Wearables', barcode: '7891234567893' },
  { id: 'P005', name: 'Cargador Inalámbrico 15W', sku: 'CHG-WIR-15W', price: 4999, stock: 25, category: 'Accesorios', barcode: '7891234567894' }
];

const mockCustomers: Customer[] = [
  // ... (tus datos mock no cambian)
  { id: 'C001', name: 'María González', dni: '12345678', email: 'maria@email.com', phone: '+54 11 1234-5678', taxCondition: 'Responsable Inscripto', debt: 0 },
  { id: 'C002', name: 'Carlos Rodríguez', cuit: '20-23456789-5', email: 'carlos@email.com', phone: '+54 11 2345-6789', taxCondition: 'Responsable Inscripto', debt: 15000 },
  { id: 'finalConsumer', name: 'Consumidor Final', dni: '00000000', email: '', phone: '', taxCondition: 'Consumidor Final', debt: 0 }
];

const paymentMethods: PaymentMethod[] = [
  // ... (tus datos mock no cambian)
  { id: 'cash', name: 'Efectivo', icon: 'ri-money-dollar-circle-line' },
  { id: 'debit', name: 'Débito', icon: 'ri-bank-card-line' },
  { id: 'credit', name: 'Crédito', icon: 'ri-bank-card-2-line', installments: [1, 3, 6, 12, 18], surcharge: 0.05 },
  { id: 'transfer', name: 'Transferencia', icon: 'ri-exchange-line' },
  { id: 'mixed', name: 'Mixto', icon: 'ri-stack-line' }
];

export default function Sales() {
  // 2. States eliminados: activeItem, isDarkMode
  
  // Header states
  const [branch, setBranch] = useState('Sucursal Central');
  const [seller, setSeller] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('0001-00000123');
  
  // Customer states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(mockCustomers[2]); // Consumidor Final por defecto
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isFinalConsumer, setIsFinalConsumer] = useState(true);
  
  // Product states
  const [productInput, setProductInput] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  
  // Totals states
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [globalDiscountType, setGlobalDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [shipping, setShipping] = useState(0);
  
  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [installments, setInstallments] = useState(1);
  const [operationNumber, setOperationNumber] = useState('');
  const [cashReceived, setCashReceived] = useState(0);
  
  // Toast
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  // Refs
  const productInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Mantener foco en input de productos
    if (productInputRef.current) {
      productInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Atajos de teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        productInputRef.current?.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setShowCustomerModal(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        // Nuevo cliente
        showToast('Función "Nuevo Cliente" no implementada', 'info');
      } else if (e.key === 'F6') {
        e.preventDefault();
        // Focus en descuento global
        showToast('Use el campo de descuento global', 'info');
      } else if (e.key === 'Delete' && focusedRow !== null) {
        e.preventDefault();
        removeFromCart(focusedRow);
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveAsQuote();
      } else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        showToast('Función "Imprimir" no implementada', 'info');
      } else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        setShowPaymentModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedRow]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 3. Funciones eliminadas: handleItemClick, handleToggleTheme

  const handleProductInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = productInput.trim();
      if (input) {
        addProductToCart(input);
        setProductInput('');
      }
    }
  };

  const addProductToCart = (input: string) => {
    // Buscar por código de barras, SKU o nombre
    const product = mockProducts.find(p => 
      p.barcode === input || 
      p.sku.toLowerCase().includes(input.toLowerCase()) ||
      p.name.toLowerCase().includes(input.toLowerCase())
    );

    if (!product) {
      showToast('Producto no encontrado. Presione F2 para búsqueda avanzada', 'error');
      return;
    }

    // Verificar si ya existe en el carrito
    const existingIndex = cartItems.findIndex(item => item.product.id === product.id);
    
    if (existingIndex >= 0) {
      // Re-escaneo: incrementar cantidad
      const newItems = [...cartItems];
      const newQuantity = newItems[existingIndex].quantity + 1;
      
      if (newQuantity > product.stock) {
        showToast(`Stock insuficiente. Disponible: ${product.stock}`, 'error');
        return;
      }
      
      newItems[existingIndex].quantity = newQuantity;
      newItems[existingIndex].subtotal = newQuantity * newItems[existingIndex].unitPrice * (1 - newItems[existingIndex].discount / 100);
      setCartItems(newItems);
      showToast(`Cantidad actualizada: ${product.name}`, 'success');
    } else {
      // Nuevo producto
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        product,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
        discountType: 'percentage',
        subtotal: product.price
      };
      setCartItems([...cartItems, newItem]);
      showToast(`Producto agregado: ${product.name}`, 'success');
    }
  };

  const updateCartItem = (index: number, field: string, value: any) => {
    const newItems = [...cartItems];
    const item = newItems[index];
    
    if (field === 'quantity') {
      if (value > item.product.stock) {
        showToast(`Stock insuficiente. Disponible: ${item.product.stock}`, 'error');
        return;
      }
      if (value <= 0) {
        removeFromCart(index);
        return;
      }
      item.quantity = value;
    } else if (field === 'discount') {
      item.discount = Math.max(0, value);
    }
    
    // Recalcular subtotal
    const discountAmount = item.discountType === 'percentage' 
      ? (item.unitPrice * item.discount / 100)
      : item.discount;
    item.subtotal = (item.unitPrice - discountAmount) * item.quantity;
    
    setCartItems(newItems);
  };

  const removeFromCart = (index: number) => {
    const newItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newItems);
    showToast('Producto eliminado del carrito', 'info');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateGlobalDiscount = () => {
    const subtotal = calculateSubtotal();
    return globalDiscountType === 'percentage' 
      ? (subtotal * globalDiscount / 100)
      : globalDiscount;
  };

  const calculateTax = () => {
    const discountedSubtotal = calculateSubtotal() - calculateGlobalDiscount();
    return discountedSubtotal * 0.21; // IVA 21%
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateGlobalDiscount() + calculateTax() + shipping;
  };

  const calculateChange = () => {
    if (selectedPaymentMethod === 'cash' && cashReceived > 0) {
      return Math.max(0, cashReceived - calculateTotal());
    }
    return 0;
  };

  const handleCompleteSale = () => {
    if (cartItems.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }
    
    if (!seller) {
      showToast('Debe seleccionar un vendedor', 'error');
      return;
    }

    showToast('Venta procesada exitosamente', 'success');
    // Reset form
    setCartItems([]);
    setSelectedCustomer(mockCustomers[2]);
    setIsFinalConsumer(true);
    setGlobalDiscount(0);
    setShipping(0);
    setShowPaymentModal(false);
    setCashReceived(0);
    setOperationNumber('');
    
    // Generate new receipt number
    const current = parseInt(receiptNumber.split('-')[1]);
    setReceiptNumber(`0001-${String(current + 1).padStart(8, '0')}`);
  };

  const handleSaveAsQuote = () => {
    if (cartItems.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }
    showToast('Presupuesto guardado exitosamente', 'success');
  };

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.dni?.includes(customerSearch) ||
    customer.cuit?.includes(customerSearch)
  );

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  // 4. JSX modificado: Se quita el div wrapper, Sidebar, TopBar y se usa <>.
  return (
    <>
      <main className="p-6 space-y-6">
        {/* Header */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sucursal/PV</label>
              <select 
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm pr-8"
              >
                <option value="Sucursal Central">Sucursal Central</option>
                <option value="Sucursal Norte">Sucursal Norte</option>
                <option value="Sucursal Sur">Sucursal Sur</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vendedor <span className="text-red-500">*</span>
              </label>
              <select 
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm pr-8"
                required
              >
                <option value="">Seleccionar vendedor</option>
                <option value="Juan Pérez">Juan Pérez</option>
                <option value="María Silva">María Silva</option>
                <option value="Carlos López">Carlos López</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha/Hora</label>
              <input 
                type="text"
                value={new Date().toLocaleString('es-AR')}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">N° Comprobante</label>
              <input 
                type="text"
                value={receiptNumber}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </Card>

        {/* Cliente */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cliente</h3>
            <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFinalConsumer}
                  onChange={(e) => {
                    setIsFinalConsumer(e.target.checked);
                    if (e.target.checked) {
                      setSelectedCustomer(mockCustomers[2]);
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Consumidor Final</span>
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomerModal(true)}
                disabled={isFinalConsumer}
              >
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-search-line"></i>
                </div>
                Buscar (F3)
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-user-line text-white dark:text-black"></i>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCustomer.taxCondition} 
                  {selectedCustomer.dni && ` • DNI: ${selectedCustomer.dni}`}
                  {selectedCustomer.cuit && ` • CUIT: ${selectedCustomer.cuit}`}
                </p>
              </div>
            </div>
            {selectedCustomer.debt > 0 && (
              <div className="text-right">
                <p className="text-sm text-red-600 dark:text-red-400">Deuda pendiente</p>
                <p className="font-semibold text-red-600 dark:text-red-400">
                  ${(selectedCustomer.debt / 100).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input de producto */}
            <Card>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código de barras / SKU / Producto (F2)
                  </label>
                  <input
                    ref={productInputRef}
                    type="text"
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    onKeyDown={handleProductInput}
                    placeholder="Escanear código o escribir producto..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-mono"
                    autoFocus
                  />
                </div>
                <div className="flex space-x-2 pt-7">
                  <Button
                    onClick={() => {
                      if (productInput.trim()) {
                        addProductToCart(productInput.trim());
                        setProductInput('');
                      }
                    }}
                    className="bg-black dark:bg-white text-white dark:text-black"
                  >
                    <div className="w-4 h-4 flex items-center justify-center mr-2">
                      <i className="ri-add-line"></i>
                    </div>
                    Agregar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowProductModal(true)}
                  >
                    <div className="w-4 h-4 flex items-center justify-center mr-2">
                      <i className="ri-search-line"></i>
                    </div>
                    Buscar
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tabla del carrito */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Carrito de Compras</h3>
              
              {cartItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">#</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Producto</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Precio Unit.</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Cant.</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Desc. %</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Stock</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => (
                        <tr 
                          key={item.id} 
                          className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${focusedRow === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          onClick={() => setFocusedRow(index)}
                        >
                          <td className="py-3 px-2 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                          <td className="py-3 px-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.product.sku}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right text-sm text-gray-900 dark:text-white">
                            ${(item.unitPrice / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => updateCartItem(index, 'quantity', item.quantity - 1)}
                                className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateCartItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-12 text-center text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                min="1"
                                max={item.product.stock}
                              />
                              <button
                                onClick={() => updateCartItem(index, 'quantity', item.quantity + 1)}
                                className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateCartItem(index, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-16 text-right text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="py-3 px-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                            ${(item.subtotal / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.product.stock > 10 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : item.product.stock > 0
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {item.product.stock}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <div className="w-4 h-4 flex items-center justify-center">
                                <i className="ri-delete-bin-line"></i>
                              </div>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <i className="ri-shopping-cart-line text-2xl"></i>
                  </div>
                  <p>El carrito está vacío</p>
                  <p className="text-sm mt-1">Escanee un código de barras o use F2 para agregar productos</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar de totales */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Totales</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">${(calculateSubtotal() / 100).toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descuento Global (F6)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={globalDiscount}
                      onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      min="0"
                    />
                    <select
                      value={globalDiscountType}
                      onChange={(e) => setGlobalDiscountType(e.target.value as 'percentage' | 'amount')}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm pr-8"
                    >
                      <option value="percentage">%</option>
                      <option value="amount">$</option>
                    </select>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                    <span>Descuento:</span>
                    <span>-${(calculateGlobalDiscount() / 100).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">IVA (21%):</span>
                  <span className="text-gray-900 dark:text-white">${(calculateTax() / 100).toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Envío</label>
                  <input
                    type="number"
                    value={shipping}
                    onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    min="0"
                  />
                </div>
                
                <hr className="border-gray-200 dark:border-gray-700" />
                
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">${(calculateTotal() / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  fullWidth
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  disabled={cartItems.length === 0 || !seller}
                >
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-money-dollar-circle-line"></i>
                  </div>
                  Finalizar Venta (Ctrl+Enter)
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleSaveAsQuote}
                  disabled={cartItems.length === 0}
                >
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-file-text-line"></i>
                  </div>
                  Guardar Presupuesto (Ctrl+S)
                </Button>
                
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setCartItems([]);
                    setGlobalDiscount(0);
                    setShipping(0);
                    showToast('Venta cancelada', 'info');
                  }}
                >
                  <div className="w-4 h-4 flex items-center justify-center mr-2">
                    <i className="ri-close-line"></i>
                  </div>
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer con atajos */}
      <div className="ml-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">F2</kbd> Producto</span>
          <span><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">F3</kbd> Cliente</span>
          <span><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">F4</kbd> + Cliente</span>
          <span><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">F6</kbd> Descuento</span>
          <span><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Del</kbd> Eliminar</span>
          <span><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Ctrl+S</kbd> Presupuesto</span>
          <span><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Ctrl+Enter</kbd> Finalizar</span>
        </div>
      </div>

      {/* Modal de productos */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Búsqueda Avanzada de Productos</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-close-line text-xl"></i>
                </div>
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar por nombre, SKU o categoría..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
            
            <div className="overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      addProductToCart(product.sku);
                      setShowProductModal(false);
                    }}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">${(product.price / 100).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de clientes */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seleccionar Cliente</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-close-line text-xl"></i>
                </div>
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar por nombre, DNI o CUIT..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
            </div>
            
            <div className="overflow-y-auto max-h-96 space-y-2">
              {filteredCustomers.filter(c => c.id !== 'finalConsumer').map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setIsFinalConsumer(false);
                    setShowCustomerModal(false);
                  }}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-user-line text-white dark:text-black"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{customer.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {customer.dni && `DNI: ${customer.dni}`} {customer.cuit && `CUIT: ${customer.cuit}`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{customer.taxCondition}</p>
                    </div>
                  </div>
                  {customer.debt > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-red-600 dark:text-red-400">Debe: ${(customer.debt / 100).toFixed(2)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Métodos de Pago</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-close-line text-xl"></i>
                </div>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total a Pagar:</span>
                  <span>${(calculateTotal() / 100).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                {paymentMethods.map((method) => (
                  <label key={method.id} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="w-5 h-5 flex items-center justify-center mr-3">
                      <i className={`${method.icon} text-gray-600 dark:text-gray-400`}></i>
                    </div>
                    <span className="text-gray-900 dark:text-white">{method.name}</span>
                  </label>
                ))}
              </div>

              {selectedPaymentMethod === 'credit' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cuotas</label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm pr-8"
                  >
                    {paymentMethods.find(m => m.id === 'credit')?.installments?.map(inst => (
                      <option key={inst} value={inst}>
                        {inst} cuota{inst > 1 ? 's' : ''} {inst > 1 ? `(+${((paymentMethods.find(m => m.id === 'credit')?.surcharge || 0) * 100).toFixed(0)}%)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedPaymentMethod === 'cash' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Efectivo Recibido</label>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    min="0"
                    step="0.01"
                  />
                  {cashReceived > 0 && (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Vuelto: ${(calculateChange() / 100).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(selectedPaymentMethod === 'debit' || selectedPaymentMethod === 'credit' || selectedPaymentMethod === 'transfer') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">N° de Operación</label>
                  <input
                    type="text"
                    value={operationNumber}
                    onChange={(e) => setOperationNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    placeholder="Ingrese número de operación"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCompleteSale}
                fullWidth
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
              >
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-printer-line"></i>
                </div>
                Facturar e Imprimir
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  handleCompleteSale();
                  showToast('Factura enviada por email', 'success');
                }}
              >
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-mail-send-line"></i>
                </div>
                Enviar por Email (PDF)
              </Button>
              
              <Button
                variant="secondary"
                fullWidth
                onClick={handleCompleteSale}
              >
                <div className="w-4 h-4 flex items-center justify-center mr-2">
                  <i className="ri-save-line"></i>
                </div>
                Solo Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={`${
                toast.type === 'success' ? 'ri-check-line' :
                toast.type === 'error' ? 'ri-error-warning-line' :
                'ri-information-line'
              }`}></i>
            </div>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}