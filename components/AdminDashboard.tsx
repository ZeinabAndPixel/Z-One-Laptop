import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Search, Package } from 'lucide-react';
import { Product } from '../types';
// AdminDashboard.tsx
// Panel para administrar el catálogo e inventario: listar, crear, editar y
// eliminar productos. Usa endpoints (`/api/admin`) para persistencia y
// muestra un modal para edición/creación.
import { getAllProducts } from '../lib/db';

// Definimos la interfaz extendida para incluir 'detalles' y 'stock' si no están en Product
interface AdminProduct extends Product {
  stock: number;
  detalles?: string;
  description?: string; // Mapeado de 'detalles'
}

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bcvRate, setBcvRate] = useState<number>(0);

  // Cargar productos
const fetchProducts = async () => {
    setLoading(true);
    try {
      // Usamos la importación estática de `getAllProducts`
      const res = await getAllProducts();
      
      const formatted = res.map((p: any) => ({
         ...p,
         id: p.id,
         name: p.nombre,
         price: Number(p.precio),
         stock: p.stock,
         category: p.categoria,
         brand: p.marca,
         image: p.imagen_url,
         specs: p.descripcion ? p.descripcion.split(',') : [],
         detalles: p.detalles
       }));
       setProducts(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const savedRate = localStorage.getItem('bcvRate');
    if (savedRate) {
      setBcvRate(Number(savedRate));
    } else {
      setBcvRate(36.5); // Default rate
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const action = editingProduct.id === 'new' ? 'create' : 'update';
    const method = editingProduct.id === 'new' ? 'POST' : 'PUT';
    
    // Preparamos el objeto para la base de datos (nombres de columnas en español)
    const dbProduct = {
      id: editingProduct.id !== 'new' ? editingProduct.id : undefined,
      nombre: editingProduct.name,
      marca: editingProduct.brand,
      categoria: editingProduct.category,
      precio: editingProduct.price,
      stock: editingProduct.stock,
      imagen_url: editingProduct.image,
      descripcion: editingProduct.specs.join(','), // Convertimos array a texto
      detalles: editingProduct.detalles
    };

    try {
      await fetch('/api/admin', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action === 'create' ? 'create' : undefined, product: dbProduct })
      });
      setIsModalOpen(false);
      fetchProducts(); // Recargar lista
      alert("Guardado con éxito!");
    } catch (error) {
      alert("Error al guardar");
    }
  };

  const handleSaveBCVRate = () => {
    localStorage.setItem('bcvRate', bcvRate.toString());
    alert('Tasa BCV guardada correctamente');
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchProducts();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const openNew = () => {
    setEditingProduct({
      id: 'new',
      name: '',
      brand: '',
      category: '',
      price: 0,
      stock: 0,
      image: '',
      rating: 5,
      specs: [],
      detalles: ''
    });
    setIsModalOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
              <Package className="w-8 h-8" /> Inventario & Catálogo
            </h1>
            <p className="text-slate-400">Administra productos, precios y stock.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-cyan-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Tasa BCV:</label>
              <input
                type="number"
                step="0.01"
                className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-cyan-500"
                value={bcvRate}
                onChange={e => setBcvRate(Number(e.target.value))}
              />
              <button onClick={handleSaveBCVRate} className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-sm">
                Guardar
              </button>
            </div>
            <button onClick={openNew} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5" /> Nuevo
            </button>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Categoría</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={product.image} alt="" className="w-10 h-10 rounded object-cover bg-white" />
                    <div>
                      <div className="font-bold text-white">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.brand}</div>
                    </div>
                  </td>
                  <td className="p-4 text-cyan-400 font-bold">${product.price}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 5 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {product.stock} un.
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">{product.category}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(product)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición/Creación */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingProduct.id === 'new' ? 'Agregar Nuevo Producto' : 'Editar Producto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-white" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                  <input className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" 
                    value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marca</label>
                  <input className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" 
                    value={editingProduct.brand} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría</label>
                  <input 
                    type="text" 
                    list="categories"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    value={editingProduct.category} 
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} 
                    required 
                    placeholder="Escribe o selecciona una categoría"
                  />
                  <datalist id="categories">
                    <option value="Laptops" />
                    <option value="Procesadores" />
                    <option value="Tarjetas Madre" />
                    <option value="Memoria RAM" />
                    <option value="Tarjetas Gráficas" />
                    <option value="Almacenamiento" />
                    <option value="Fuentes de Poder" />
                    <option value="Gabinetes" />
                    <option value="Periféricos" />
                    <option value="Monitores" />
                    <option value="Computadoras" />
                    <option value="Teléfonos" />
                    <option value="Componentes" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio ($)</label>
                  <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" 
                    value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock</label>
                  <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" 
                    value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL de Imagen</label>
                <input className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" 
                  value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="https://..." required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Especificaciones Cortas (separadas por coma)</label>
                <input className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white" 
                  value={editingProduct.specs.join(',')} 
                  onChange={e => setEditingProduct({...editingProduct, specs: e.target.value.split(',')})} 
                  placeholder="8GB RAM, 256GB SSD, RTX 3050" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción Detallada</label>
                <textarea className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white h-24" 
                  value={editingProduct.detalles || ''} 
                  onChange={e => setEditingProduct({...editingProduct, detalles: e.target.value})} 
                  placeholder="Descripción larga para la tarjeta..." />
              </div>

              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4">
                <Save className="w-5 h-5" /> Guardar Producto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;