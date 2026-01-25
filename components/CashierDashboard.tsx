import React, { useEffect, useState } from 'react';
import { Package, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface Order {
  id: number;
  nombre_completo: string;
  cedula: string;
  total_pago: number;
  metodo_pago: string;
  estado: string;
  fecha: string;
}

const CashierDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Refrescar cada 30 segundos automáticamente
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: number, nuevoEstado: string) => {
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado: nuevoEstado })
    });
    fetchOrders(); // Recargar lista
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Panel de Caja (CASHIER)</h1>
            <p className="text-slate-400">Gestión de pedidos en tiempo real</p>
          </div>
          <button onClick={fetchOrders} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700">
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-xl font-bold text-white">#{order.id}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    order.estado === 'entregado' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {order.estado}
                  </span>
                </div>
                <p className="text-slate-300 font-bold">{order.nombre_completo}</p>
                <p className="text-sm text-slate-500">C.I: {order.cedula} • {order.metodo_pago}</p>
              </div>

              <div className="text-right flex items-center gap-6">
                <p className="text-2xl font-bold text-cyan-400">${order.total_pago}</p>
                
                {order.estado !== 'entregado' ? (
                  <button 
                    onClick={() => updateStatus(order.id, 'entregado')}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" /> Entregar
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Package className="w-5 h-5" /> Entregado
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;