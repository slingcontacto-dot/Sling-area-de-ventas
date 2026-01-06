
import React, { useState } from 'react';
import { User, SalesRecord, SoldStatus } from '../types';
import { dataService } from '../services/dataService';
import { Save, CheckCircle2, AlertTriangle, Loader2, Plus } from 'lucide-react';

interface DataEntryFormProps {
  currentUser: User;
  onSave: (record: Omit<SalesRecord, 'id'>) => void;
}

const PREDEFINED_RUBROS = ['ROPA', 'COMIDA', 'CONSULTORIO', 'CANCHAS', 'TECNOLOGIA', 'PELUQUERIA'];

export const DataEntryForm: React.FC<DataEntryFormProps> = ({ currentUser, onSave }) => {
  const [address, setAddress] = useState('');
  const [company, setCompany] = useState('');
  const [selectedRubro, setSelectedRubro] = useState('');
  const [customRubro, setCustomRubro] = useState('');
  const [sold, setSold] = useState<SoldStatus>(SoldStatus.INTERESADO);
  const [contactInfo, setContactInfo] = useState('');
  const [contacted, setContacted] = useState<'Si' | 'No'>('No');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [duplicateError, setDuplicateError] = useState<{ exists: boolean; owner: string | null }>({
    exists: false,
    owner: null
  });
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setDuplicateError({ exists: false, owner: null });
    setIsValidating(true);

    const finalContact = contactInfo.trim();
    const finalRubro = selectedRubro === 'OTRA' ? customRubro.trim() : selectedRubro;

    if (!finalRubro) {
        alert('Por favor selecciona o escribe un rubro.');
        setIsValidating(false);
        return;
    }

    try {
        const existingOwner = await dataService.checkDuplicate(company, finalContact);

        if (existingOwner) {
            setDuplicateError({ exists: true, owner: existingOwner });
            setIsValidating(false);
            return;
        }

        const newRecord: Omit<SalesRecord, 'id'> = {
            date: new Date().toLocaleDateString('es-AR'),
            inCharge: currentUser.username,
            address,
            company,
            industry: finalRubro,
            sold,
            contactInfo: finalContact,
            contacted
        };

        onSave(newRecord);

        // Reset
        setAddress('');
        setCompany('');
        setSelectedRubro('');
        setCustomRubro('');
        setSold(SoldStatus.INTERESADO);
        setContactInfo('');
        setContacted('No');
        setSuccessMsg('Registro guardado exitosamente');

        setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
        console.error(err);
    } finally {
        setIsValidating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
                <Save size={24} />
            </div>
            Nueva Visita de Campo
            </h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-1">Carga de datos en tiempo real</p>
        </div>
        
        {successMsg && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-100 px-5 py-2.5 rounded-xl text-sm font-black animate-fade-in shadow-sm">
            <CheckCircle2 size={18} />
            {successMsg}
          </div>
        )}
      </div>

      {duplicateError.exists && (
          <div className="mb-8 p-5 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-4 animate-bounce-short">
              <div className="bg-red-500 p-3 rounded-full text-white shadow-lg">
                  <AlertTriangle size={24} />
              </div>
              <div>
                  <h4 className="text-red-800 font-black text-lg uppercase tracking-tight">¡Registro Duplicado!</h4>
                  <p className="text-red-700 font-medium">
                      Este registro ya fue realizado por: <span className="bg-red-200 px-2 py-0.5 rounded-lg font-black">{duplicateError.owner}</span>
                  </p>
              </div>
          </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Actual</label>
                    <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        {new Date().toLocaleDateString('es-AR')}
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendedor</label>
                    <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-indigo-600 text-sm font-black flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        {currentUser.username}
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Empresa / Negocio</label>
                <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => {
                        setCompany(e.target.value);
                        setDuplicateError({ exists: false, owner: null });
                    }}
                    className={`w-full p-3.5 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-800 ${
                        duplicateError.exists ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Nombre del comercio"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dirección Exacta</label>
                <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-800"
                    placeholder="Calle y altura"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rubro o Actividad</label>
                <div className="space-y-2">
                    <select
                        required
                        value={selectedRubro}
                        onChange={(e) => setSelectedRubro(e.target.value)}
                        className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white font-bold text-gray-800 appearance-none"
                    >
                        <option value="">Seleccionar Rubro...</option>
                        {PREDEFINED_RUBROS.map(rubro => (
                            <option key={rubro} value={rubro}>{rubro}</option>
                        ))}
                        <option value="OTRA">OTRA (Escribir nueva...)</option>
                    </select>
                    
                    {selectedRubro === 'OTRA' && (
                        <div className="animate-fade-in">
                            <input
                                type="text"
                                required
                                value={customRubro}
                                onChange={(e) => setCustomRubro(e.target.value.toUpperCase())}
                                className="w-full p-3.5 border border-blue-300 bg-blue-50 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-black text-blue-900 placeholder-blue-300"
                                placeholder="Escribe el nuevo rubro aquí..."
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Información de Contacto</label>
                <input
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => {
                        setContactInfo(e.target.value);
                        setDuplicateError({ exists: false, owner: null });
                    }}
                    className={`w-full p-3.5 border rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-800 ${
                        duplicateError.exists ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Número o contacto"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resultado de la visita</label>
                <select
                    value={sold}
                    onChange={(e) => setSold(e.target.value as SoldStatus)}
                    className="w-full p-3.5 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white font-black text-gray-800"
                >
                    <option value={SoldStatus.INTERESADO}>{SoldStatus.INTERESADO}</option>
                    <option value={SoldStatus.SI}>Vendido (Éxito)</option>
                    <option value={SoldStatus.NO}>Rechazado (No)</option>
                    <option value={SoldStatus.PENDIENTE}>Volver a pasar</option>
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">¿Contactado?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setContacted('Si')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all font-bold ${
                      contacted === 'Si' 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setContacted('No')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all font-bold ${
                      contacted === 'No' 
                        ? 'bg-slate-800 border-slate-800 text-white shadow-lg' 
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    No
                  </button>
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
            <button
                type="submit"
                disabled={isValidating}
                className="group relative bg-slate-900 hover:bg-black text-white font-black py-4 px-12 rounded-2xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isValidating ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <>
                        <Save size={20} className="group-hover:rotate-12 transition-transform" />
                        GUARDAR REGISTRO
                    </>
                )}
            </button>
        </div>
      </form>
    </div>
  );
};
