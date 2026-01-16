import React, { useState } from 'react';
import { User, Customer } from '../types';
import { registerUser } from '../services/db';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

interface RegisterProps {
  onLogin: (user: User) => void;
}

export const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    cedula: 'V-',
    fullName: '',
    address: '',
    phone: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const newUser: User = {
      username: formData.username,
      email: formData.email,
      created_at: new Date().toISOString()
    };

    const newCustomer: Customer = {
      cedula: formData.cedula,
      username: formData.username,
      full_name: formData.fullName,
      phone: formData.phone,
      address: formData.address
    };

    try {
      const res = await registerUser(newUser, newCustomer);
      if (res.success && res.user) {
        setStatus('success');
        setMsg(res.message);
        // Persistir sesión y notificar a App
        onLogin(res.user);
      } else {
        setStatus('error');
        setMsg(res.message);
      }
    } catch (err) {
      setStatus('error');
      setMsg('Error de conexión a la base de datos.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (status === 'success') {
     return (
       <div className="max-w-md mx-auto mt-20 text-center glass-panel p-8 rounded-xl border-green-500/50 border animate-fade-in">
          <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Bienvenido, {formData.username}</h2>
          <p className="text-slate-400 mb-6">Sesión iniciada correctamente.</p>
          <div className="text-sm text-cyan-500 animate-pulse">Redirigiendo a la tienda...</div>
       </div>
     )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="glass-panel p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-1">Crear Cuenta</h2>
        <p className="text-slate-400 mb-8 text-sm">Únete a la élite de ingeniería.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Info */}
            <div className="space-y-4">
              <h3 className="text-cyan-500 text-xs font-bold uppercase tracking-wider">Credenciales (Users)</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Usuario</label>
                <input required name="username" value={formData.username} onChange={handleChange} type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 focus:outline-none" placeholder="Ingeniero_01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
                <input required name="password" value={formData.password} onChange={handleChange} type="password" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
            </div>

            {/* Billing Info */}
            <div className="space-y-4">
              <h3 className="text-cyan-500 text-xs font-bold uppercase tracking-wider">Facturación (Customers)</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Cédula (PK)</label>
                <input required name="cedula" value={formData.cedula} onChange={handleChange} type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 focus:outline-none" placeholder="V-12345678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre Completo</label>
                <input required name="fullName" value={formData.fullName} onChange={handleChange} type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dirección</label>
                <input required name="address" value={formData.address} onChange={handleChange} type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            {status === 'error' && <p className="text-red-500 text-sm mb-4">{msg}</p>}
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {status === 'loading' ? <Loader2 className="animate-spin w-5 h-5" /> : 'Registrar e Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};