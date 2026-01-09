
import React, { useState } from 'react';
import { SalesRecord, SoldStatus, User } from '../types';
import { dataService } from '../services/dataService';
import { Search, Edit2, Trash2, Filter, MessageCircle, Check, X, Calendar, User as UserIcon, Building2, Tag, MapPin } from 'lucide-react';

interface SalesTableProps {
  records: SalesRecord[];
  currentUser: User;
  onEdit: (record: SalesRecord) => void;
  onDelete: (id: string) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({ records, currentUser, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const canModify = (record: SalesRecord) => {
    return currentUser.role === 'owner' || record.inCharge === currentUser.username;
  };

  const toggleContacted = async (record: SalesRecord) => {
    if (!canModify(record)) return;
    const newStatus = record.contacted === 'Si' ? 'No' : 'Si';
    await dataService.updateRecord({ ...record, contacted: newStatus });
  };

  const openWhatsApp = (contactInfo: string) => {
    let num = contactInfo.replace(/\D/g, '');
    if (!num || num.length < 5) {
      alert('Número no válido.');
      return;
    }
    num = num.replace(/^0+/, '');
    if (!num.startsWith('549') && !num.startsWith('54')) {
        num = '549' + num;
    } else if (num.startsWith('54') && !num.startsWith('549')) {
        num = '549' + num.substring(2);
    }
    window.open(`https://api.whatsapp.com/send?phone=${num}`, '_blank');
  };

  const filteredRecords = records.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      r.company.toLowerCase().includes(term) ||
      r.address.toLowerCase().includes(term) ||
      r.industry.toLowerCase().includes(term) ||
      r.inCharge.toLowerCase().includes(term) ||
      r.contactInfo.toLowerCase().includes(term);
    
    const matchesStatus = statusFilter === 'all' || r.sold === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case SoldStatus.SI: return 'bg-green-100 text-green-700 border-green-200';
      case SoldStatus.NO: return 'bg-red-100 text-red-700 border-red-200';
      case SoldStatus.PENDIENTE: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Interesado/Dudoso': return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Legacy fallback
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2.5 rounded-xl">
                <LayoutGrid size={22} className="text-indigo-600" />
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Todos los Registros</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{filteredRecords.length} registros cargados</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 bg-white appearance-none cursor-pointer text-gray-600 min-w-[180px]"
                >
                    <option value="all">Todos los estados</option>
                    <option value={SoldStatus.SI}>Vendido</option>
                    <option value={SoldStatus.NO}>Rechazado</option>
                    <option value={SoldStatus.PENDIENTE}>Pendiente</option>
                </select>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Buscar empresa, dirección, rubro..." 
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 outline-none w-full sm:w-80" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Fecha</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Encargado</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Empresa</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Rubro</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Dirección</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Estado</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Contacto</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Contactado</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const allowed = canModify(record);
                  const hasContact = !!record.contactInfo;
                  const displayStatus = record.sold === 'Interesado/Dudoso' ? 'Pendiente' : record.sold;

                  return (
                    <tr key={record.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-500">
                            {record.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                                    {record.inCharge.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-gray-700">{record.inCharge}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-slate-800">
                            {record.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100 uppercase">
                                {record.industry}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-xs font-medium text-gray-500 max-w-[200px] truncate" title={record.address}>
                                {record.address}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-[10px] font-black rounded-lg border-2 uppercase tracking-tight ${getStatusStyle(record.sold as string)}`}>
                                {displayStatus}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-600">
                            {record.contactInfo}
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button
                                onClick={() => toggleContacted(record)}
                                disabled={!allowed}
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all ${
                                    record.contacted === 'Si'
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                                    : 'bg-white border-gray-200 text-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {record.contacted === 'Si' ? <Check size={14} strokeWidth={4} /> : <X size={12} strokeWidth={3} />}
                            </button>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-end gap-2">
                               {hasContact && (
                                   <button 
                                       onClick={() => openWhatsApp(record.contactInfo)} 
                                       className="w-8 h-8 bg-[#25D366] text-white rounded-lg hover:scale-110 transition-transform shadow-sm flex items-center justify-center"
                                       title="Enviar WhatsApp"
                                   >
                                       <MessageCircle size={16} fill="white" />
                                   </button>
                               )}
                               {allowed && (
                                   <div className="flex gap-1">
                                       <button onClick={() => onEdit(record)} className="p-1.5 text-blue-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Editar"><Edit2 size={14} /></button>
                                       <button onClick={() => onDelete(record.id)} className="p-1.5 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                                   </div>
                               )}
                           </div>
                        </td>
                    </tr>
                  );
                })
            ) : (
                <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-30">
                            <LayoutGrid size={48} />
                            <p className="text-sm font-black uppercase tracking-widest italic">Sin resultados</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Import helper added locally to avoid missing component
const LayoutGrid = ({ size, className }: { size: number, className?: string }) => (
    <div className={`w-${size/4} h-${size/4} ${className}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    </div>
);
