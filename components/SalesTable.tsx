
import React, { useState } from 'react';
import { SalesRecord, SoldStatus, User } from '../types';
import { dataService } from '../services/dataService';
import { Search, Edit2, Trash2, Filter, MessageCircle, Check, X, LayoutGrid, MapPin, User as UserIcon, Calendar, Building2, Tag } from 'lucide-react';

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
    
    let matchesStatus = statusFilter === 'all';
    if (!matchesStatus) {
        if (statusFilter === SoldStatus.PENDIENTE) {
            matchesStatus = r.sold === SoldStatus.PENDIENTE || r.sold === 'Interesado/Dudoso';
        } else {
            matchesStatus = r.sold === statusFilter;
        }
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case SoldStatus.SI: return 'bg-green-100 text-green-700 border-green-200';
      case SoldStatus.NO: return 'bg-red-100 text-red-700 border-red-200';
      case SoldStatus.PENDIENTE: 
      case 'Interesado/Dudoso': 
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header optimizado */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
            <div className="bg-indigo-50 p-2.5 rounded-xl shrink-0">
                <LayoutGrid size={22} className="text-indigo-600" />
            </div>
            <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight truncate">Registros de Campo</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{filteredRecords.length} registros</p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    className="pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100 bg-white appearance-none cursor-pointer text-gray-600 w-full sm:w-auto"
                >
                    <option value="all">Filtro: Todos</option>
                    <option value={SoldStatus.SI}>Vendido</option>
                    <option value={SoldStatus.NO}>Rechazado</option>
                    <option value={SoldStatus.PENDIENTE}>Pendiente</option>
                </select>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-100 outline-none w-full sm:w-64" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
        </div>
      </div>
      
      {/* Tabla sin Scroll Horizontal */}
      <div className="w-full">
        <table className="w-full table-fixed divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="w-[25%] px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Información</th>
              <th className="w-[25%] px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalles</th>
              <th className="w-[15%] px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
              <th className="w-[15%] px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contacto</th>
              <th className="w-[20%] px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const allowed = canModify(record);
                  const hasContact = !!record.contactInfo;
                  const displayStatus = (record.sold === 'Interesado/Dudoso' || record.sold === SoldStatus.PENDIENTE) ? 'Pendiente' : record.sold;

                  return (
                    <tr key={record.id} className="hover:bg-gray-50/80 transition-colors group">
                        {/* Columna 1: Empresa + Rubro */}
                        <td className="px-6 py-4 overflow-hidden">
                            <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Building2 size={12} className="text-gray-400 shrink-0" />
                                    <span className="text-xs font-black text-slate-800 truncate" title={record.company}>
                                        {record.company}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <Tag size={10} className="text-blue-500 shrink-0" />
                                    <span className="text-[10px] font-bold text-blue-600 uppercase truncate">
                                        {record.industry}
                                    </span>
                                </div>
                            </div>
                        </td>

                        {/* Columna 2: Ubicación + Encargado */}
                        <td className="px-6 py-4 overflow-hidden">
                            <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <MapPin size={12} className="text-gray-400 shrink-0" />
                                    <span className="text-[11px] font-medium text-gray-500 truncate" title={record.address}>
                                        {record.address}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <UserIcon size={12} className="text-gray-400 shrink-0" />
                                    <span className="text-[10px] font-bold text-slate-600 truncate">
                                        {record.inCharge} • <span className="text-gray-400 font-medium">{record.date}</span>
                                    </span>
                                </div>
                            </div>
                        </td>

                        {/* Columna 3: Estado */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 inline-flex text-[9px] font-black rounded-lg border-2 uppercase tracking-tight ${getStatusStyle(record.sold as string)}`}>
                                {displayStatus}
                            </span>
                        </td>

                        {/* Columna 4: Contacto */}
                        <td className="px-6 py-4 overflow-hidden">
                            <div className="flex items-center gap-2 min-w-0">
                                {hasContact ? (
                                    <>
                                        <button 
                                            onClick={() => openWhatsApp(record.contactInfo)} 
                                            className="w-7 h-7 bg-[#25D366] text-white rounded-lg shrink-0 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                                            title="WhatsApp"
                                        >
                                            <MessageCircle size={14} fill="white" />
                                        </button>
                                        <span className="text-[11px] font-bold text-gray-600 truncate" title={record.contactInfo}>
                                            {record.contactInfo}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-[10px] text-gray-300 italic">Sin contacto</span>
                                )}
                            </div>
                        </td>

                        {/* Columna 5: Gestión (Check + Edit + Trash) */}
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-1.5">
                                <button
                                    onClick={() => toggleContacted(record)}
                                    disabled={!allowed}
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border transition-all shrink-0 ${
                                        record.contacted === 'Si'
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-200 hover:border-gray-300'
                                    }`}
                                    title={record.contacted === 'Si' ? "Contactado" : "Pendiente de contacto"}
                                >
                                    {record.contacted === 'Si' ? <Check size={14} strokeWidth={4} /> : <X size={12} strokeWidth={3} />}
                                </button>
                                
                               {allowed && (
                                   <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button 
                                            onClick={() => onEdit(record)} 
                                            className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg"
                                            title="Editar"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                       <button 
                                            onClick={() => onDelete(record.id)} 
                                            className="p-1.5 text-red-300 hover:bg-red-50 rounded-lg"
                                            title="Borrar"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                   </div>
                               )}
                           </div>
                        </td>
                    </tr>
                  );
                })
            ) : (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-30">
                            <LayoutGrid size={40} />
                            <p className="text-xs font-black uppercase tracking-widest italic">No se encontraron resultados</p>
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
