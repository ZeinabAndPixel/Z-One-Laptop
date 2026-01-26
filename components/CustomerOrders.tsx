import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  ChevronRight, 
  Package,
  X
} from 'lucide-react';

interface CustomerOrdersProps {
  userCedula: string;
  onClose: () => void;
}

const CustomerOrders: React.FC<CustomerOrdersProps> = ({ userCedula, onClose }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        // Pedimos solo los pedidos de ESTA cédula
        const res = await fetch(`/api/orders?cedula=${userCedula}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Error cargando mis pedidos", error);
      } finally {
        setLoading(false);
      }
    };

    if (userCedula) fetchMyOrders();
  }, [userCedula]);

  // Función para renderizar el estado con colores bonitos
  const getStatusBadge = (status: string) => {
    const styles: any = {
      pendiente: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Clock },
      pagado: { color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle },
      entregado: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Truck },
      cancelado: { color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
    };
    
    const style = styles[status] || styles.pendiente;
    const Icon = style.icon;

    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${style.bg} ${style.color} border border-white/5`}>
        <Icon className="w-3 h-3" /> {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="text-cyan-400 w-6 h-6" /> Mis Pedidos
            </h2>
            <p className="text-slate-400 text-sm">Historial de compras y seguimiento</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* LISTA DE PEDIDOS (Izquierda) */}
          <div className={`${selectedOrder ? 'hidden md:block w-1/3' : 'w-full'} border-r border-slate-800 overflow-y-auto bg-slate-900/50`}>
            {loading ? (
              <div className="p-8 text-center text-slate-500">Cargando...</div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-4">
                <ShoppingBag className="w-12 h-12 text-slate-600 opacity-50" />
                <p className="text-slate-400">Aún no has realizado compras.</p>
                <button onClick={onClose} className="text-cyan-400 hover:underline text-sm">Ir al catálogo</button>
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 border-b border-slate-800 cursor-pointer transition-colors hover:bg-slate-800 ${selectedOrder?.id === order.id ? 'bg-slate-800 border-l-4 border-l-cyan-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-slate-500 font-mono">#{String(order.id).slice(0,8)}</span>
                    <span className="text-xs text-slate-400">{new Date(order.fecha).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-bold">${Number(order.total_pago).toFixed(2)}</span>
                    {getStatusBadge(order.estado)}
                  </div>
                  <div className="flex items-center text-xs text-cyan-400 hover:text-cyan-300">
                    Ver detalles <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DETALLE DEL PEDIDO (Derecha) */}
          {selectedOrder ? (
            <div className="flex-1 overflow-y-auto bg-slate-950 p-6 animate-fade-in">
              {/* Vista Móvil: Botón Volver */}
              <button onClick={() => setSelectedOrder(null)} className="md:hidden mb-4 text-slate-400 flex items-center gap-1 text-sm">
                ← Volver a la lista
              </button>

              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 pb-6 border-b border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Pedido #{selectedOrder.id}</h3>
                    <p className="text-slate-500 text-sm">Realizado el {new Date(selectedOrder.fecha).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(selectedOrder.estado)}
                    <span className="text-2xl font-bold text-white">${Number(selectedOrder.total_pago).toFixed(2)}</span>
                  </div>
                </div>

                {/* Tracking Visual */}
                <div className="relative flex items-center justify-between mb-8 px-4 py-4 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="absolute left-4 right-4 h-1 bg-slate-800 top-1/2 -translate-y-1/2 -z-0"></div>
                    
                    {['pendiente', 'pagado', 'entregado'].map((step, idx) => {
                       const states = ['pendiente', 'pagado', 'entregado'];
                       const currentIdx = states.indexOf(selectedOrder.estado);
                       const isCompleted = currentIdx >= idx;
                       const isCurrent = currentIdx === idx;

                       return (
                         <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-900 border-slate-600'}`}></div>
                            <span className={`text-[10px] uppercase font-bold ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>{step}</span>
                         </div>
                       )
                    })}
                </div>

                {/* Lista de Productos */}
                <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <ShoppingBag className="w-4 h-4 text-cyan-400" /> Productos Comprados
                </h4>
                <div className="space-y-3">
                  {(typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items).map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded bg-slate-800" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className="text-slate-500 text-xs">Cantidad: {item.quantity}</p>
                      </div>
                      <span className="text-cyan-400 font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-slate-500 flex-col gap-4">
               <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                  <Package className="w-10 h-10 opacity-20" />
               </div>
               <p>Selecciona un pedido para ver los detalles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrders;