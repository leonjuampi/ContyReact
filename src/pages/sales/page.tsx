// src/pages/sales/page.tsx
import { useState, useEffect, useRef } from 'react';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
// --- CAMBIO: Importar APIs y Auth usando el alias @/ ---
import { useAuth } from '@/contexts/AuthContext';
import { Customer, getCustomers } from '@/services/customer.api';
import { searchStockProducts } from '@/services/stock.api';
import { PaymentMethod, getPaymentMethods } from '@/services/paymentMethods.api'; // Nueva API
// --- CORRECCIÓN: Importar TODAS las interfaces necesarias ---
import { createSale, SalePaymentPayload, SaleItemPayload, CreateSalePayload, Sale } from '@/services/sales.api'; // Nueva API

// --- CAMBIO: Interfaz de Producto de Búsqueda (tiene stock) ---
interface ProductSearchItem {
  variantId: number;
  productId: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface CartItem {
  id: string; // variantId
  product: ProductSearchItem; // Usamos la nueva interfaz
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  subtotal: number;
}

// --- CAMBIO: Crear cliente "Consumidor Final" por defecto ---
const defaultCustomer: Customer = {
  id: 0, // Usaremos 0 o null para "Consumidor Final"
  name: 'Consumidor Final',
  taxId: '00000000',
  email: '',
  phone: '',
  taxCondition: 'CF',
  priceListId: 1, // Asumimos 1 como default
  status: 'ACTIVE',
  notes: '',
  // debt: 0, // 'debt' no está en la interfaz Customer, usamos 'balance'
  // Añadimos campos que la API puede esperar pero que para el default no importan
  lastPurchaseAt: undefined,
  balance: 0,
  tags: []
};

// Mapeo Inverso (Backend -> Frontend)
const taxConditionDisplayMap: Record<string, string> = {
  'RI': 'Responsable Inscripto',
  'CF': 'Consumidor Final',
  'MT': 'Monotributista',
  'EX': 'Exento'
};

export default function Sales() {
  const { user } = useAuth(); // Para obtener branchId y sellerId
  
  // Header states
  // --- CORRECCIÓN DE ERROR: Manejar null y usar user.id ---
  const [branchId, setBranchId] = useState(user?.branchId ? user.branchId.toString() : '');
  const [sellerId, setSellerId] = useState(user?.id ? user.id.toString() : ''); // Era user.uid
  
  const [receiptNumber, setReceiptNumber] = useState('B-0001-...'); // El backend lo asignará
  
  // Customer states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(defaultCustomer);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  // Product states
  const [productInput, setProductInput] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productSearchResults, setProductSearchResults] = useState<ProductSearchItem[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  
  // Totals states
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [globalDiscountType, setGlobalDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [shipping, setShipping] = useState(0);
  
  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('0');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  // Este 'payments' es el estado INTERNO del modal
  const [payments, setPayments] = useState<SalePaymentPayload[]>([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  
  // Estado general
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  // Refs
  const productInputRef = useRef<HTMLInputElement>(null);

  // Mapa de sucursales (idealmente vendría de un contexto de Auth con nombres)
  const branchMap = new Map<number, string>();
  // @ts-ignore
  user?.branchIds?.forEach(id => {
    // Simulación de nombres - TODO: Cargar esto desde una API /api/branches
    if (id === 1) branchMap.set(id, 'Sucursal Central');
    else if (id === 2) branchMap.set(id, 'Sucursal Norte');
    else if (id === 3) branchMap.set(id, 'Tienda Online');
    else branchMap.set(id, `Sucursal ${id}`);
  });
  const branchOptions = Array.from(branchMap.entries()).map(([id, name]) => ({
    id: id.toString(),
    name: name
  }));


  // Cargar Métodos de Pago
  useEffect(() => {
    if (showPaymentModal) {
      setIsLoadingPaymentMethods(true);
      getPaymentMethods()
        .then(methods => {
          const activeMethods = methods.filter(m => m.active);
          setAvailablePaymentMethods(activeMethods);
          if (activeMethods.length > 0) {
            const cashMethod = activeMethods.find(m => m.kind === 'CASH');
            setSelectedPaymentMethodId(cashMethod ? cashMethod.id.toString() : activeMethods[0].id.toString());
          }
        })
        .catch(err => {
          console.error(err);
          showToast('Error al cargar métodos de pago', 'error');
        })
        .finally(() => setIsLoadingPaymentMethods(false));
    }
  }, [showPaymentModal]);

  useEffect(() => {
    // Re-enfocar al cerrar modales
    if (productInputRef.current && !showCustomerModal && !showProductModal && !showPaymentModal) {
      productInputRef.current.focus();
    }
  }, [showCustomerModal, showProductModal, showPaymentModal]);

  // Calcular total y restante
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = globalDiscountType === 'percentage' 
    ? (subtotal * globalDiscount / 100)
    : globalDiscount;
  const taxAmount = (subtotal - discountAmount) * 0.21; // Asumimos 21%
  const totalAmount = subtotal - discountAmount + taxAmount + shipping;
  const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  const newRemaining = totalAmount - paidAmount;

  // Sincronizar 'remainingAmount' y 'paymentAmount'
  useEffect(() => {
    const roundedRemaining = parseFloat(newRemaining.toFixed(2));
    setRemainingAmount(roundedRemaining);
    
    if (roundedRemaining > 0) {
      setPaymentAmount(roundedRemaining.toString());
    } else {
      setPaymentAmount('0');
    }
  }, [totalAmount, payments]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        productInputRef.current?.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setShowCustomerModal(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        showToast('Función "Nuevo Cliente" no implementada', 'info');
      } else if (e.key === 'F6') {
        e.preventDefault();
        document.getElementById('global-discount-input')?.focus();
      } else if (e.key === 'Delete' && focusedRow !== null) {
        e.preventDefault();
        removeFromCart(focusedRow);
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveAsQuote();
      } else if (e.ctrlKey && e.key === 'p') { // 'p' para Imprimir (futuro)
        e.preventDefault();
        showToast('Función "Imprimir" no implementada', 'info');
      } else if (e.ctrlKey && e.key === 'Enter') { // Ctrl+Enter
        e.preventDefault();
        if (cartItems.length > 0 && sellerId) {
          setShowPaymentModal(true);
        } else {
          showToast('Agregue productos y seleccione un vendedor', 'error');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedRow, cartItems, sellerId]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Búsqueda de Productos (rápida)
  const handleProductInputKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = productInput.trim();
      if (input) {
        addProductToCart(input);
      }
    }
  };

  const addProductToCart = async (input: string) => {
    if (!branchId) {
      showToast('Por favor, seleccione una sucursal primero', 'error');
      return;
    }
    
    setIsSearchingProducts(true);
    setProductInput('');
    
    try {
      const data = await searchStockProducts(input, Number(branchId));
      if (data.items.length === 0) {
        showToast('Producto no encontrado o sin stock', 'error');
        return;
      }
      
      const product = data.items[0];
      const productPrice = product.price; // Ahora SÍ viene de la API

      if (productPrice === undefined || productPrice === null) {
         showToast(`Error: El producto ${product.productName} no tiene precio cargado.`, 'error');
         return;
      }

      const productToAdd: ProductSearchItem = {
         variantId: product.variantId,
         productId: product.productId,
         name: `${product.productName} ${product.variantName || ''}`.trim(),
         sku: product.variantSku || product.productSku,
         price: productPrice, 
         stock: product.qty
      };

      addItemToCart(productToAdd);

    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSearchingProducts(false);
      productInputRef.current?.focus();
    }
  };
  
  // Añadir al carrito (lógica)
  const addItemToCart = (product: ProductSearchItem) => {
     const existingIndex = cartItems.findIndex(item => item.product.variantId === product.variantId);
    
    if (existingIndex >= 0) {
      const newItems = [...cartItems];
      const newQuantity = newItems[existingIndex].quantity + 1;
      
      if (newQuantity > product.stock) {
        showToast(`Stock insuficiente. Disponible: ${product.stock}`, 'error');
        return;
      }
      
      newItems[existingIndex].quantity = newQuantity;
      const discountAmount = newItems[existingIndex].discountType === 'percentage' 
        ? (newItems[existingIndex].unitPrice * newItems[existingIndex].discount / 100)
        : newItems[existingIndex].discount;
      newItems[existingIndex].subtotal = (newItems[existingIndex].unitPrice - discountAmount) * newQuantity;

      setCartItems(newItems);
      showToast(`Cantidad actualizada: ${product.name}`, 'success');
    } else {
      if (product.stock < 1) {
         showToast(`Stock insuficiente (Disponible: ${product.stock})`, 'error');
         return;
      }
      const newItem: CartItem = {
        id: product.variantId.toString(),
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
    setProductInput('');
    setProductSearchResults([]);
    setShowProductModal(false);
    productInputRef.current?.focus();
  }

  // Actualizar item en carrito
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
    } else if (field === 'unitPrice') {
      item.unitPrice = Math.max(0, value);
    }
    
    const discountAmount = item.discountType === 'percentage' 
      ? (item.unitPrice * item.discount / 100)
      : item.discount;
    item.subtotal = (item.unitPrice - discountAmount) * item.quantity;
    
    setCartItems(newItems);
  };

  // Quitar item del carrito
  const removeFromCart = (index: number) => {
    const newItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newItems);
    showToast('Producto eliminado del carrito', 'info');
    productInputRef.current?.focus();
  };

  // Búsqueda de Clientes (Modal)
  useEffect(() => {
    if (customerSearch.length > 2) {
      const timer = setTimeout(() => {
        getCustomers({ search: customerSearch, pageSize: 10 })
          .then(data => setCustomerSearchResults(data.items))
          .catch(err => console.error(err));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setCustomerSearchResults([]);
    }
  }, [customerSearch]);
  
  // Búsqueda de Productos (Modal)
  useEffect(() => {
    if (productSearch.length > 2 && branchId) {
      const timer = setTimeout(async () => {
        setIsSearchingProducts(true);
        try {
          const data = await searchStockProducts(productSearch, Number(branchId));
          const mappedResults: ProductSearchItem[] = data.items.map((p: any) => ({
             variantId: p.variantId,
             productId: p.productId,
             name: `${p.productName} ${p.variantName || ''}`.trim(),
             sku: p.variantSku || p.productSku,
             price: p.price, // Ahora el precio SÍ viene
             stock: p.qty
          }));
          setProductSearchResults(mappedResults);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearchingProducts(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setProductSearchResults([]);
    }
  }, [productSearch, branchId]);

  // Guardar como presupuesto
  const handleSaveAsQuote = () => {
    if (cartItems.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }
    // TODO: Llamar a la API de /api/quotes
    showToast('Presupuesto guardado exitosamente', 'success');
  };
  
  // Lógica del Modal de Pago
  const addPayment = () => {
    const amount = parseFloat(paymentAmount);
    const methodId = parseInt(selectedPaymentMethodId);
    const method = availablePaymentMethods.find(m => m.id === methodId);

    if (!amount || amount <= 0 || !method) {
      showToast('Monto o método inválido', 'error');
      return;
    }
    
    const roundedAmount = parseFloat(amount.toFixed(2));
    
    if (roundedAmount > parseFloat(remainingAmount.toFixed(2)) + 0.001) { // Tolerancia
      showToast('El monto ingresado es mayor al restante', 'error');
      return;
    }

    const newPayment: SalePaymentPayload = {
      method_id: methodId,
      amount: roundedAmount,
      note: method.name
    };

    setPayments([...payments, newPayment]);
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  // --- ¡¡¡FUNCIÓN CORREGIDA!!! ---
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }
    if (!sellerId || !branchId) {
      showToast('Vendedor o Sucursal no seleccionados', 'error');
      return;
    }
    if (remainingAmount < -0.001) { // Tolerancia para vuelto
      showToast('El pago excede el total', 'error');
      return;
    }
    if (payments.length === 0) {
      showToast('Debe agregar al menos un método de pago', 'error');
      return;
    }
    // Validación de pago completo (tu backend no maneja pagos parciales todavía)
    if (Math.abs(remainingAmount) > 0.001) {
        showToast('El monto pagado no coincide con el total', 'error');
        return;
    }

    setIsSubmitting(true);

    // 1. Mapear Pagos
    // El backend (sales.service.js) espera el *nombre* del método (string),
    // no el ID.
    const finalPayments = payments.map(p => {
      const method = availablePaymentMethods.find(m => m.id === p.method_id);
      if (!method) {
        // Esto no debería pasar si el select está bien cargado
         showToast(`Error interno: Método de pago ID ${p.method_id} no encontrado`, 'error');
         throw new Error("Método de pago no encontrado en el frontend");
      }
      return {
        method: method.name, // <-- Enviar el NOMBRE (ej: "Efectivo")
        amount: p.amount,
        note: p.note
      };
    });

    // 2. Mapear Items
    // El backend (sales.service.js) espera 'variantId', 'unitPrice', y 'discountPercent'.
    const finalItems = cartItems.map(item => ({
      variantId: item.product.variantId,      // <-- Corregido
      qty: item.quantity,
      unitPrice: item.unitPrice,              // <-- Corregido
      discountPercent: item.discount          // <-- Corregido
    }));

    // 3. Construir el Payload Final
    const payload: CreateSalePayload = {
      customerId: selectedCustomer.id === 0 ? 0 : selectedCustomer.id,
      branchId: Number(branchId),
      // @ts-ignore
      sellerId: Number(sellerId), 
      docType: selectedCustomer.taxCondition === 'RI' ? 'INVOICE_A' : 'INVOICE_B',
      posCode: '0001', // Harcodeado por ahora
      
      items: finalItems,      // <-- Usar items corregidos
      payments: finalPayments, // <-- Usar pagos corregidos
      note: 'Venta de mostrador'
    };


    try {
      // Usamos la API de 'createSale'
      // @ts-ignore
      const result: Sale = await createSale(payload); // Forzamos el tipo de resultado
      // El backend devuelve { id, docText, docNumber, total }
      showToast(`Venta ${result.docText || result.id} creada exitosamente`, 'success');
      
      // Reset form
      setCartItems([]);
      setSelectedCustomer(defaultCustomer);
      setGlobalDiscount(0);
      setShipping(0);
      setShowPaymentModal(false);
      setPayments([]);
      setReceiptNumber(result.docText || 'B-0001-...'); // Actualizar con el nro real
      
    } catch (err: any) {
      console.error(err);
      // Mostrar el error real del backend
      showToast(`Error al finalizar venta: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatPrice = (price: number) => {
    // CORRECCIÓN: Asumimos que los precios son números enteros (5000 = $5000)
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(price); // <--- SIN DIVIDIR POR 100
  };

  return (
    <>
      <main className="p-6 space-y-6">
        {/* Header */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sucursal/PV</label>
              <select 
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm pr-8"
              >
                <option value="">Seleccionar Sucursal</option>
                {branchOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vendedor <span className="text-red-500">*</span>
              </label>
              <select 
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm pr-8"
                required
              >
                <option value={user?.id.toString()}>{user?.name || user?.username}</option>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomerModal(true)}
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
                    {taxConditionDisplayMap[selectedCustomer.taxCondition] || selectedCustomer.taxCondition} 
                    {selectedCustomer.taxId !== '00000000' && selectedCustomer.taxId && ` • CUIT/DNI: ${selectedCustomer.taxId}`}
                  </p>
                </div>
              </div>
              {selectedCustomer.balance && selectedCustomer.balance > 0 && (
                <div className="text-right">
                  <p className="text-sm text-red-600 dark:text-red-400">Deuda pendiente</p>
                  <p className="font-semibold text-red-600 dark:text-red-400">
                    {formatPrice(selectedCustomer.balance)}
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
                    onKeyDown={handleProductInputKeydown}
                    placeholder="Escanear código o escribir producto..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-mono"
                    autoFocus
                    disabled={!branchId} // Deshabilitar si no hay sucursal
                  />
                  {!branchId && <p className="text-xs text-red-500 mt-1">Seleccione una sucursal para agregar productos.</p>}
                </div>
                <div className="flex space-x-2 pt-7">
                  <Button
                    onClick={() => addProductToCart(productInput.trim())}
                    className="bg-black dark:bg-white text-white dark:text-black"
                    disabled={!branchId}
                  >
                    <div className="w-4 h-4 flex items-center justify-center mr-2">
                      <i className="ri-add-line"></i>
                    </div>
                    Agregar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowProductModal(true)}
                     disabled={!branchId}
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
            <Card padding="sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 px-2 pt-2">Carrito de Compras</h3>
              
              {cartItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Producto</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Precio Unit.</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Cant.</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Desc. %</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Subtotal</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Stock</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => (
                        <tr 
                          key={item.id} 
                          className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${focusedRow === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          onClick={() => setFocusedRow(index)}
                        >
                          <td className="py-3 px-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.product.sku}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">
                             <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateCartItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-24 text-right text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                min="0"
                              />
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
                            {formatPrice(item.subtotal)}
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
                              title="Eliminar (Del)"
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
                  <span className="text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="global-discount-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descuento Global (F6)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="global-discount-input"
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
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">IVA (21%):</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(taxAmount)}</span>
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
                  <span className="text-gray-900 dark:text-white">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  fullWidth
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                  disabled={cartItems.length === 0 || !sellerId}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
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
                {isSearchingProducts ? (
                  <p className="text-gray-500">Buscando...</p>
                ) : (
                  productSearchResults.map((product) => (
                    <div
                      key={product.variantId}
                      onClick={() => addItemToCart(product)}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.stock > 0 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  ))
                )}
                {!isSearchingProducts && productSearchResults.length === 0 && productSearch.length > 2 && (
                   <p className="text-gray-500">No se encontraron productos.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de clientes */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seleccionar Cliente</h3>
              <button onClick={() => setShowCustomerModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer" >
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
              {/* Añadir "Consumidor Final" como opción fija */}
              <div
                onClick={() => {
                  setSelectedCustomer(defaultCustomer);
                  setShowCustomerModal(false);
                }}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                 <p className="font-medium text-gray-900 dark:text-white">Consumidor Final</p>
              </div>
              {customerSearchResults.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomer(customer);
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
                        {customer.taxId && `CUIT/DNI: ${customer.taxId}`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{taxConditionDisplayMap[customer.taxCondition] || customer.taxCondition}</p>
                    </div>
                  </div>
                  {/* El balance en la lista de clientes es `balance?`, así que comprobamos */}
                  {customer.balance && customer.balance > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-red-600 dark:text-red-400">Debe: {formatPrice(customer.balance)}</p>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-black dark:text-white">Registrar Pago</h3>
                <p className="text-sm text-gray-500">{selectedCustomer.name}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Totales */}
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">TOTAL VENTA</p>
                <p className="text-3xl font-bold text-black dark:text-white">{formatPrice(totalAmount)}</p>
              </div>
              <div className={`p-4 rounded-lg text-center ${remainingAmount > 0.001 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                <p className={`text-sm ${remainingAmount > 0.001 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {remainingAmount > 0.001 ? 'FALTAN' : (remainingAmount < -0.001 ? 'VUELTO' : 'RESTANTE')}
                </p>
                <p className={`text-3xl font-bold ${remainingAmount > 0.001 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {formatPrice(Math.abs(remainingAmount))}
                </p>
              </div>
            </div>

            {/* Formulario de Pago */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Método de Pago</label>
                  <select
                    value={selectedPaymentMethodId}
                    onChange={e => setSelectedPaymentMethodId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                  >
                    {isLoadingPaymentMethods ? (
                      <option>Cargando...</option>
                    ) : (
                      availablePaymentMethods.map(method => (
                        <option key={method.id} value={method.id}>{method.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Monto</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <Button onClick={addPayment} disabled={remainingAmount <= 0.001}>
                  <i className="ri-add-line mr-1"></i>
                  Agregar Pago
                </Button>
              </div>
            </div>
            
            {/* Pagos Agregados */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {payments.length === 0 ? (
                <p className="text-sm text-center text-gray-500">Aún no se han agregado pagos.</p>
              ) : (
                payments.map((p, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium text-black dark:text-white">{p.note}</p>
                      <p className="text-sm text-gray-500">Monto: {formatPrice(p.amount)}</p>
                    </div>
                    <button
                      onClick={() => removePayment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)} // Solo cierra modal
                disabled={isSubmitting}
              >
                Volver
              </Button>
              <Button 
                onClick={handleCompleteSale}
                // Permitir finalizar solo si está pago
                disabled={isSubmitting || payments.length === 0 || Math.abs(remainingAmount) > 0.001}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line mr-1"></i>
                    Finalizar Venta ({formatPrice(totalAmount)})
                  </>
                )}
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