import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Eye, 
  Smartphone, 
  CreditCard,
  Truck,
  Lock,
  RefreshCw,
  Maximize2,
  Package,
  X
} from 'lucide-react';

// CashierDashboard.tsx
// Interfaz de cajero para revisar órdenes en tiempo real, confirmar pagos,
// marcar entregas y cancelar pedidos con autorización. Consume `/api/orders`.

interface Order {
  id: string;
  cliente_nombre: string;
  cliente_cedula: string;
  cliente_telefono?: string;
  total_pago: number;
  metodo_pago: string;
  referencia_pago?: string;
  comprobante_url?: string;
  estado: string;
  fecha: string;
  items: any; 
}

const CashierDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para modales
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Nuevo estado para el visor de imagen
  
  // Seguridad
  const [showCancelAuth, setShowCancelAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // --- 1. CARGA DE DATOS ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Error al conectar con el servidor');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando órdenes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. CAMBIO DE ESTADO ---
  const handleStatusChange = async (id: string, newStatus: string) => {
    if (newStatus !== 'cancelado') {
        if (!confirm(`¿Confirmar cambio a: ${newStatus.toUpperCase()}?`)) return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: newStatus })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: newStatus } : o));
        
        if (selectedOrder?.id === id) {
            setSelectedOrder(prev => prev ? { ...prev, estado: newStatus } : null);
        }
        
        if (newStatus === 'cancelado') {
             alert("✅ Pedido cancelado correctamente.");
             setSelectedOrder(null);
             setShowCancelAuth(false);
             setAdminPassword('');
        }
      } else {
        alert("❌ Error al actualizar en el servidor.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error de conexión.");
    }
  };

  // --- 3. CANCELACIÓN ---
  const handleCancelOrder = () => {
    if (adminPassword === '1234') {
      if (selectedOrder) {
        handleStatusChange(selectedOrder.id, 'cancelado');
      }
    } else {
      alert("🔒 Contraseña incorrecta.");
    }
  };

  const filteredOrders = orders.filter(order => 
    (order.cliente_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.cliente_cedula || '').includes(searchTerm) ||
    String(order.id).includes(searchTerm)
  );

  // --- RENDERIZADO DEL MODAL DE DETALLES ---
  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    let cartItems = [];
    try {
        cartItems = typeof selectedOrder.items === 'string' 
          ? JSON.parse(selectedOrder.items) 
          : selectedOrder.items;
    } catch (e) {
        console.error("Error parseando items", e);
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-slate-900 w-full max-w-5xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
          
          {/* Header Modal */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Detalles del Pedido
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  selectedOrder.estado === 'pagado' ? 'bg-green-500/20 text-green-400' :
                  selectedOrder.estado === 'entregado' ? 'bg-blue-500/20 text-blue-400' :
                  selectedOrder.estado === 'cancelado' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {selectedOrder.estado}
                </span>
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Registrado el: {new Date(selectedOrder.fecha).toLocaleString()}
              </p>
            </div>
            <button onClick={() => { setSelectedOrder(null); setShowCancelAuth(false); }} className="text-slate-400 hover:text-white">
              <XCircle className="w-8 h-8" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            
            {/* --- SECCIÓN NUEVA: ID COMPLETO --- */}
            <div className="bg-slate-950 p-4 rounded-xl border border-dashed border-slate-800 flex items-center gap-4 mb-8">
                <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                    <Package className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">ID Único de Seguimiento (Completo)</p>
                    <p className="text-white font-mono font-bold text-lg md:text-xl select-all break-all">
                        {selectedOrder.id}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* IZQUIERDA: Datos y Pago */}
              <div className="space-y-6">
                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
                  <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                    <ShoppingBag className="w-4 h-4" /> Datos del Cliente
                  </h3>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Nombre:</span>
                        <span className="font-bold text-white">{selectedOrder.cliente_nombre}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Cédula:</span>
                        <span className="font-mono text-white">{selectedOrder.cliente_cedula}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Teléfono:</span>
                        <span className="text-white">{selectedOrder.cliente_telefono || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
                  <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                    {selectedOrder.metodo_pago === 'pago_movil' ? <Smartphone className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    Información de Pago
                  </h3>
                  
                  <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-400 text-sm">Monto Total:</span>
                      <span className="text-3xl font-bold text-white">${Number(selectedOrder.total_pago).toFixed(2)}</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 mb-4">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Método Seleccionado</p>
                      <p className="text-white font-medium">
                          {selectedOrder.metodo_pago === 'pago_movil' ? 'Pago Móvil / Transferencia' : 'Pago en Tienda (Efectivo/Punto)'}
                      </p>
                  </div>

                  {selectedOrder.metodo_pago === 'pago_movil' && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-yellow-500 uppercase font-bold mb-1">Referencia Bancaria</p>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-yellow-400 font-mono text-lg font-bold text-center select-all">
                            {selectedOrder.referencia_pago || 'NO REGISTRADA'}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Comprobante / Capture</p>
                        {selectedOrder.comprobante_url ? (
                          <div 
                            className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-600 aspect-video bg-slate-950"
                            onClick={() => setPreviewImage(selectedOrder.comprobante_url || null)}
                          >
                            <img 
                              src={selectedOrder.comprobante_url} 
                              alt="Comprobante" 
                              className="w-full h-full object-cover group-hover:opacity-50 transition-all duration-300"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="w-8 h-8 text-white mb-2" />
                              <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">
                                Ver Pantalla Completa
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-900 p-8 rounded-xl text-center border border-dashed border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-500">
                            <XCircle className="w-8 h-8 opacity-20" />
                            <p className="text-xs">El cliente no adjuntó imagen</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* DERECHA: Carrito y Acciones */}
              <div className="flex flex-col h-full">
                <div className="bg-slate-950 rounded-xl border border-slate-800 flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-cyan-400" /> 
                            Productos ({cartItems?.length || 0})
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-700">
                        {cartItems?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3 p-3 border-b border-slate-900 last:border-0 items-center hover:bg-slate-900/50 transition-colors rounded-lg">
                            <div className="w-12 h-12 bg-slate-900 rounded border border-slate-800 overflow-hidden flex-shrink-0">
                                <img src={item.image} alt="prod" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{item.name}</p>
                                <p className="text-slate-500 text-xs">Cantidad: <span className="text-white font-bold">{item.quantity}</span></p>
                            </div>
                            <p className="text-cyan-400 font-bold text-sm whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        ))}
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="mt-6 space-y-3">
                  {selectedOrder.estado === 'pendiente' && (
                    <button 
                      onClick={() => handleStatusChange(selectedOrder.id, 'pagado')}
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transform hover:-translate-y-1 transition-all"
                    >
                      <CheckCircle className="w-6 h-6" /> CONFIRMAR PAGO RECIBIDO
                    </button>
                  )}

                  {selectedOrder.estado === 'pagado' && (
                    <button 
                      onClick={() => handleStatusChange(selectedOrder.id, 'entregado')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transform hover:-translate-y-1 transition-all"
                    >
                      <Truck className="w-6 h-6" /> CONFIRMAR ENTREGA
                    </button>
                  )}

                  {/* ZONA SEGURA DE CANCELACIÓN */}
                  {selectedOrder.estado !== 'cancelado' && selectedOrder.estado !== 'entregado' && (
                    <div className="pt-4 border-t border-slate-800">
                      {!showCancelAuth ? (
                        <button 
                          onClick={() => setShowCancelAuth(true)}
                          className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                          <XCircle className="w-5 h-5" /> Cancelar Pedido
                        </button>
                      ) : (
                        <div className="animate-fade-in bg-red-900/10 p-4 rounded-xl border border-red-500/50">
                          <p className="text-red-400 text-xs font-bold mb-3 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> AUTORIZACIÓN DE GERENTE REQUERIDA
                          </p>
                          <div className="flex gap-2">
                            <input 
                              type="password" 
                              placeholder="Ingresar contraseña..."
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 text-white text-sm focus:border-red-500 focus:outline-none placeholder:text-slate-600"
                              value={adminPassword}
                              onChange={(e) => setAdminPassword(e.target.value)}
                              autoFocus
                            />
                            <button 
                              onClick={handleCancelOrder}
                              className="bg-red-600 hover:bg-red-500 text-white px-6 rounded-lg font-bold text-sm shadow-lg shadow-red-900/20"
                            >
                              Confirmar
                            </button>
                          </div>
                          <button 
                            onClick={() => { setShowCancelAuth(false); setAdminPassword(''); }}
                            className="text-slate-500 text-xs mt-3 hover:text-white underline w-full text-center"
                          >
                            Cancelar operación
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Panel de Caja
            </h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               Sistema Operativo • {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
                onClick={() => fetchOrders()} 
                className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-cyan-400 border border-slate-700 hover:border-cyan-500/50 transition-all"
                title="Actualizar lista"
            >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar por cédula, nombre o ID..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="p-5 font-bold">ID / Fecha</th>
                  <th className="p-5 font-bold">Cliente</th>
                  <th className="p-5 font-bold">Monto</th>
                  <th className="p-5 font-bold">Método</th>
                  <th className="p-5 font-bold">Estado</th>
                  <th className="p-5 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {orders.length === 0 && !loading ? (
                   <tr><td colSpan={6} className="p-12 text-center text-slate-500">No hay pedidos registrados hoy.</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors group cursor-default">
                      <td className="p-5">
                        <span className="font-mono text-cyan-400 font-bold block text-sm">#{String(order.id).slice(0, 6)}...</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {new Date(order.fecha).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-5">
                        <p className="font-bold text-white text-sm">{order.cliente_nombre}</p>
                        <p className="text-xs text-slate-500">{order.cliente_cedula}</p>
                      </td>
                      <td className="p-5 font-bold text-white text-sm">${Number(order.total_pago).toFixed(2)}</td>
                      <td className="p-5">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                          order.metodo_pago === 'pago_movil' 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                            : 'bg-slate-700/30 text-slate-300 border-slate-600'
                        }`}>
                          {order.metodo_pago === 'pago_movil' ? 'Móvil' : 'Tienda'}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          order.estado === 'pagado' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          order.estado === 'entregado' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          order.estado === 'cancelado' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {order.estado.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white p-2.5 rounded-lg transition-all border border-cyan-500/20 hover:border-cyan-500 shadow-lg shadow-cyan-500/5"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {renderOrderDetails()}

      {/* --- VISOR DE IMAGEN (LIGHTBOX) --- */}
      {previewImage && (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setPreviewImage(null)}
        >
            <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                <X className="w-8 h-8" />
            </button>
            <img 
                src={previewImage} 
                alt="Vista Previa" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10"
                onClick={(e) => e.stopPropagation()} // Evita cerrar si clickeas la imagen
            />
        </div>
      )}
    </div>
  );
};

export default CashierDashboard;