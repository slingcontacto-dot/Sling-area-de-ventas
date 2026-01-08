
import React, { useState, useEffect } from 'react';
import { SalesRecord, SoldStatus } from '../types';
import { X, Save } from 'lucide-react';

interface EditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SalesRecord | null;
  onSave: (record: SalesRecord) => void;
}

const PREDEFINED_RUBROS = ['ROPA', 'COMIDA', 'CONSULTORIO', 'CANCHAS', 'TECNOLOGIA', 'PELUQUERIA', 'MAYORISTA', 'LIBRERIA'];

export const EditRecordModal: React.FC<EditRecordModalProps> = ({ isOpen, onClose, record, onSave }) => {
  const [formData, setFormData] = useState<SalesRecord | null>(null);
  const [selectedRubro, setSelectedRubro] = useState('');
  const [customRubro, setCustomRubro] = useState('');

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
      
      const isPredefined = PREDEFINED_RUBROS.includes(record.industry.toUpperCase());
      if (isPredefined) {
        setSelectedRubro(record.industry.toUpperCase());
        setCustomRubro('');
      } else {
        setSelectedRubro('OTRA');
        setCustomRubro(record.industry);
      }
    }
  }, [record]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      const finalRubro = selectedRubro === 'OTRA' ? customRubro.trim() : selectedRubro;
      if (!finalRubro) {
        alert('El rubro no puede estar vacío.');
        return;
      }
      onSave({ ...formData, industry: finalRubro });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Editar Registro</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Empresa</label>
                <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rubro</label>
                <div className="space-y-2">
                    <select
                        required
                        value={selectedRubro}
                        onChange={(e) => setSelectedRubro(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                    >
                        <option value="">Seleccionar...</option>
                        {PREDEFINED_RUBROS.map(rubro => (
                            <option key={rubro} value={rubro}>{rubro}</option>
                        ))}
                        <option value="OTRA">OTRA...</option>
                    </select>
                    {selectedRubro === 'OTRA' && (
                        <input
                            type="text"
                            required
                            value={customRubro}
                            onChange={(e) => setCustomRubro(e.target.value.toUpperCase())}
                            className="w-full p-2 border border-blue-200 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-900"
                            placeholder="Nuevo rubro..."
                        />
                    )}
                </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Dirección</label>
            <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Estado de Venta</label>
                <select
                    value={formData.sold}
                    onChange={(e) => setFormData({...formData, sold: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    <option value={SoldStatus.INTERESADO}>{SoldStatus.INTERESADO}</option>
                    <option value={SoldStatus.SI}>Vendido (Si)</option>
                    <option value={SoldStatus.NO}>Rechazado (No)</option>
                    <option value={SoldStatus.PENDIENTE}>Volver a pasar</option>
                </select>
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contacto</label>
                <input
                    type="text"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>
          </div>

          <div>
             <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">¿Contactado?</label>
             <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, contacted: 'Si'})}
                    className={`flex-1 py-2 rounded-lg border font-bold transition-all ${
                        formData.contacted === 'Si'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-600'
                    }`}
                >
                    Sí
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, contacted: 'No'})}
                    className={`flex-1 py-2 rounded-lg border font-bold transition-all ${
                        formData.contacted === 'No'
                        ? 'bg-slate-800 border-slate-800 text-white'
                        : 'bg-white border-gray-300 text-gray-600'
                    }`}
                >
                    No
                </button>
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                Cancelar
            </button>
            <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
                <Save size={16} />
                Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
