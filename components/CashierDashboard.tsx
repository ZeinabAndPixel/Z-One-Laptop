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
  RefreshCw
} from 'lucide-react';

// Definimos la interfaz EXACTAMENTE como viene de la API
interface Order {
  id: string;
  cliente_nombre: string;
  cliente_cedula: string;
  cliente_telefono?: string;
  total_pago: number; // Puede venir como string de la BD, lo convertiremos
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Estado para la contraseña de cancelación
  const [showCancelAuth, setShowCancelAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // --- 1. CARGA DE DATOS VÍA API (CORREGIDO) ---
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
    const interval = setInterval(fetchOrders, 15000); // Auto-refresh más rápido (15s)
    return () => clearInterval(interval);
  }, []);

  // --- 2. ACTUALIZACIÓN DE ESTADO VÍA API ---
  const handleStatusChange = async (id: string, newStatus: string) => {
    // Si es cancelar, no preguntamos confirmación aquí porque ya pasó por la password
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
        // Actualizamos localmente para feedback instantáneo
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

  // --- 3. LÓGICA DE CANCELACIÓN (GERENTE) ---
  const handleCancelOrder = () => {
    if (adminPassword === '1234') {
      if (selectedOrder) {
        handleStatusChange(selectedOrder.id, 'cancelado');
      }
    } else {
      alert("🔒 Contraseña incorrecta. Acceso denegado.");
    }
  };

  // Filtrado
  const filteredOrders = orders.filter(order => 
    (order.cliente_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.cliente_cedula || '').includes(searchTerm) ||
    String(order.id).includes(searchTerm)
  );

  // --- RENDERIZADO DEL MODAL DE DETALLES ---
  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    // Parseo seguro de items (por si Postgres lo devuelve como string o JSON directo)
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
        <div className="bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header Modal */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Pedido #{String(selectedOrder.id).slice(0, 8)}...
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
                Fecha: {new Date(selectedOrder.fecha).toLocaleString()}
              </p>
            </div>
            <button onClick={() => { setSelectedOrder(null); setShowCancelAuth(false); }} className="text-slate-400 hover:text-white transition-transform hover:rotate-90">
              <XCircle className="w-8 h-8" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* IZQUIERDA: Datos y Pago */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Cliente
                </h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-500">Nombre:</span> {selectedOrder.cliente_nombre}</p>
                  <p><span className="text-slate-500">C.I:</span> {selectedOrder.cliente_cedula}</p>
                  <p><span className="text-slate-500">Telf:</span> {selectedOrder.cliente_telefono || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                  {selectedOrder.metodo_pago === 'pago_movil' ? <Smartphone className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  Pago: {selectedOrder.metodo_pago === 'pago_movil' ? 'Pago Móvil' : 'En Tienda'}
                </h3>
                
                <p className="text-3xl font-bold text-white mb-4">
                  ${Number(selectedOrder.total_pago).toFixed(2)}
                </p>

                {selectedOrder.metodo_pago === 'pago_movil' && (
                  <div className="border-t border-slate-700 pt-4">
                    <p className="text-sm text-yellow-400 mb-2 font-mono bg-yellow-400/10 p-2 rounded text-center border border-yellow-400/20">
                      REF: {selectedOrder.referencia_pago || 'NO REGISTRADA'}
                    </p>
                    
                    {selectedOrder.comprobante_url ? (
                      <div className="relative group mt-3">
                        <img 
                          src={selectedOrder.comprobante_url} 
                          alt="Comprobante" 
                          className="w-full h-48 object-cover rounded-lg border border-slate-600 cursor-pointer"
                          onClick={() => window.open(selectedOrder.comprobante_url, '_blank')}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                            Clic para ver completo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900 p-6 rounded-lg text-center text-slate-500 text-xs border border-dashed border-slate-700 mt-2">
                        Sin foto del comprobante
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* DERECHA: Carrito y Acciones */}
            <div className="flex flex-col h-full">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-cyan-400" /> Productos
              </h3>
              
              <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-2 mb-6 max-h-[300px] overflow-y-auto">
                {cartItems?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3 p-3 border-b border-slate-900 last:border-0 items-center">
                    <img src={item.image} alt="prod" className="w-12 h-12 rounded bg-slate-800 object-cover" />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-slate-500 text-xs">x{item.quantity}</p>
                    </div>
                    <p className="text-cyan-400 font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="mt-auto space-y-3">
                {selectedOrder.estado === 'pendiente' && (
                  <button 
                    onClick={() => handleStatusChange(selectedOrder.id, 'pagado')}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                  >
                    <CheckCircle className="w-5 h-5" /> CONFIRMAR PAGO
                  </button>
                )}

                {selectedOrder.estado === 'pagado' && (
                  <button 
                    onClick={() => handleStatusChange(selectedOrder.id, 'entregado')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                  >
                    <Truck className="w-5 h-5" /> CONFIRMAR ENTREGA
                  </button>
                )}

                {/* ZONA SEGURA DE CANCELACIÓN */}
                {selectedOrder.estado !== 'cancelado' && selectedOrder.estado !== 'entregado' && (
                  <div className="pt-4 border-t border-slate-800">
                    {!showCancelAuth ? (
                      <button 
                        onClick={() => setShowCancelAuth(true)}
                        className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" /> Cancelar Pedido
                      </button>
                    ) : (
                      <div className="animate-fade-in bg-red-900/10 p-4 rounded-xl border border-red-500/50">
                        <p className="text-red-400 text-xs font-bold mb-2 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> AUTORIZACIÓN GERENTE
                        </p>
                        <div className="flex gap-2">
                          <input 
                            type="password" 
                            placeholder="Clave (1234)"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 text-white text-sm focus:border-red-500 focus:outline-none"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                          />
                          <button 
                            onClick={handleCancelOrder}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 rounded-lg font-bold text-sm"
                          >
                            OK
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
              Panel de Caja
            </h1>
            <p className="text-slate-400">Control de pedidos y despachos</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => fetchOrders()} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-cyan-400">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                type="text" 
                placeholder="Buscar cédula, nombre..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:border-cyan-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-800">
                  <th className="p-4 font-bold">Pedido</th>
                  <th className="p-4 font-bold">Cliente</th>
                  <th className="p-4 font-bold">Monto</th>
                  <th className="p-4 font-bold">Método</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.length === 0 && !loading ? (
                   <tr><td colSpan={6} className="p-8 text-center text-slate-500">No hay pedidos registrados</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="p-4">
                        <span className="font-mono text-cyan-400 font-bold block">#{String(order.id).slice(0, 6)}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(order.fecha).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white">{order.cliente_nombre}</p>
                        <p className="text-xs text-slate-500">{order.cliente_cedula}</p>
                      </td>
                      <td className="p-4 font-bold text-white">${Number(order.total_pago).toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${
                          order.metodo_pago === 'pago_movil' 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                            : 'bg-slate-700/30 text-slate-300 border-slate-600'
                        }`}>
                          {order.metodo_pago === 'pago_movil' ? 'Pago Móvil' : 'Tienda'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                          order.estado === 'pagado' ? 'bg-green-500/10 text-green-400' :
                          order.estado === 'entregado' ? 'bg-blue-500/10 text-blue-400' :
                          order.estado === 'cancelado' ? 'bg-red-500/10 text-red-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {order.estado.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white p-2 rounded-lg transition-all"
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
    </div>
  );
};

export default CashierDashboard;