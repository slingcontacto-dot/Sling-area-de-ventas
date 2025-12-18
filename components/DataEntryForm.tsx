import React, { useState } from 'react';
import { User, SalesRecord, SoldStatus } from '../types';
import { Save, CheckCircle2 } from 'lucide-react';

interface DataEntryFormProps {
  currentUser: User;
  onSave: (record: Omit<SalesRecord, 'id'>) => void;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({ currentUser, onSave }) => {
  const [address, setAddress] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [sold, setSold] = useState<SoldStatus>(SoldStatus.INTERESADO);
  const [contactInfo, setContactInfo] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Automatic fields
    const newRecord: Omit<SalesRecord, 'id'> = {
      date: new Date().toLocaleDateString('es-AR'), // format DD/MM/YYYY
      inCharge: currentUser.username,
      address,
      company,
      industry,
      sold,
      contactInfo
    };

    onSave(newRecord);

    // Reset and show success
    setAddress('');
    setCompany('');
    setIndustry('');
    setSold(SoldStatus.INTERESADO);
    setContactInfo('');
    setSuccessMsg('Registro guardado exitosamente');

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Save size={20} />
          </span>
          Nuevo Registro de Visita
        </h2>
        {successMsg && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg text-sm font-medium animate-fade-in">
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Read Only Auto Fields */}
        <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Fecha (Automático)</label>
            <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                {new Date().toLocaleDateString('es-AR')}
            </div>
        </div>
        <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Encargado (Automático)</label>
            <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium">
                {currentUser.username}
            </div>
        </div>
        
        {/* Input Fields */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej. Av. San Martín 123"
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Empresa / Negocio</label>
          <input
            type="text"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej. Kiosco El Paso"
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rubro</label>
          <input
            type="text"
            required
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej. Alimentos, Ropa..."
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Venta</label>
          <select
            value={sold}
            onChange={(e) => setSold(e.target.value as SoldStatus)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
          >
            <option value={SoldStatus.INTERESADO}>{SoldStatus.INTERESADO}</option>
            <option value={SoldStatus.SI}>Vendido (Si)</option>
            <option value={SoldStatus.NO}>Rechazado (No)</option>
            <option value={SoldStatus.PENDIENTE}>Volver a pasar</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Contacto (Teléfono / Instagram)</label>
          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej. 351-1234567 o @instagram"
          />
        </div>

        <div className="md:col-span-3 flex justify-end mt-2">
            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
                Guardar Registro
            </button>
        </div>
      </form>
    </div>
  );
};