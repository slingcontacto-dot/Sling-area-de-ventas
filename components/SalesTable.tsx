import React, { useState } from 'react';
import { SalesRecord, SoldStatus, User } from '../types';
import { dataService } from '../services/dataService';
import { Table, Search, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Filter, MessageCircle, Check, X } from 'lucide-react';

interface SalesTableProps {
  records: SalesRecord[];
  currentUser: User;
  onEdit: (record: SalesRecord) => void;
  onDelete: (id: string) => void;
}

type SortKey = keyof SalesRecord;
type SortDirection = 'asc' | 'desc';

export const SalesTable: React.FC<SalesTableProps> = ({ records, currentUser, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'date',
    direction: 'desc',
  });

  const canModify = (record: SalesRecord) => {
    return currentUser.role === 'owner' || record.inCharge === currentUser.username;
  };

  const toggleContacted = async (record: SalesRecord) => {
    if (!canModify(record)) return;
    const newStatus = record.contacted === 'Si' ? 'No' : 'Si';
    await dataService.updateRecord({ ...record, contacted: newStatus });
    // Note: The parent App component should handle the data refresh via the realtime subscription or onUpdate.
  };

  /**
   * WhatsApp Link Helper - El Cerebro de la compatibilidad
   */
  const openWhatsApp = (contactInfo: string) => {
    // 1. Extraer solo dígitos
    let num = contactInfo.replace(/\D/g, '');
    
    if (!num || num.length < 5) {
      alert('Información de contacto no parece ser un número válido para WhatsApp.');
      return;
    }

    // 2. Limpieza de ceros iniciales (especial Argentina 0351...)
    // Quitamos CUALQUIER cantidad de ceros al principio
    num = num.replace(/^0+/, '');

    /**
     * Lógica de Formateo Internacional (Argentina Foco):
     * Debe quedar como: 54 (País) + 9 (Móvil) + Área (Sin 0) + Número (Sin 15)
     */
    
    // Caso A: El usuario ya puso el 549 al principio
    if (num.startsWith('549')) {
        // Ya está perfecto
    }
    // Caso B: El usuario puso 54 pero falta el 9 (ej: 54351...)
    else if (num.startsWith('54') && num.length >= 12) {
        num = '549' + num.substring(2);
    }
    // Caso C: El usuario puso solo el número con área (ej: 351...)
    else {
        num = '549' + num;
    }

    // Usamos el formato de API de WhatsApp más compatible
    window.open(`https://api.whatsapp.com/send?phone=${num}`, '_blank');
  };

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredRecords = records
    .filter(r => {
      const matchesSearch = 
        r.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.inCharge.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || r.sold === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key];
      let valB: any = b[key];

      if (key === 'date') {
        valA = parseDate(a.date);
        valB = parseDate(b.date);
      } else {
         valA = valA.toString().toLowerCase();
         valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case SoldStatus.SI: return 'bg-green-100 text-green-800 border-green-200';
      case SoldStatus.NO: return 'bg-red-100 text-red-800 border-red-200';
      case SoldStatus.INTERESADO: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderSortIcon = (columnKey: SortKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="text-gray-300 ml-1" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-blue-600 ml-1" /> 
      : <ArrowDown size={14} className="text-blue-600 ml-1" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Table size={20} /></span>
                {currentUser.role === 'owner' ? 'Todos los Registros' : 'Mis Registros'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{filteredRecords.length} registros encontrados</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full bg-white appearance-none cursor-pointer">
                    <option value="all">Todos los estados</option>
                    <option value={SoldStatus.SI}>Vendido</option>
                    <option value={SoldStatus.INTERESADO}>Interesado</option>
                    <option value={SoldStatus.NO}>Rechazado</option>
                    <option value={SoldStatus.PENDIENTE}>Pendiente</option>
                </select>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input type="text" placeholder="Buscar..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" onClick={() => handleSort('date')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Fecha {renderSortIcon('date')}</th>
              <th scope="col" onClick={() => handleSort('inCharge')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Encargado {renderSortIcon('inCharge')}</th>
              <th scope="col" onClick={() => handleSort('company')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Empresa {renderSortIcon('company')}</th>
              <th scope="col" onClick={() => handleSort('industry')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Rubro {renderSortIcon('industry')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
              <th scope="col" onClick={() => handleSort('sold')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Estado {renderSortIcon('sold')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Contactado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const allowed = canModify(record);
                  const isPhoneNumber = record.contactInfo && /\d/.test(record.contactInfo);

                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{record.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{record.inCharge.charAt(0).toUpperCase()}</div>
                                {record.inCharge}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{record.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.industry}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{record.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(record.sold)}`}>{record.sold}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.contactInfo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                                onClick={() => toggleContacted(record)}
                                disabled={!allowed}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                                    record.contacted === 'Si'
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                    : 'bg-gray-50 border-gray-200 text-gray-300 hover:border-blue-400 hover:text-blue-400'
                                }`}
                                title={record.contacted === 'Si' ? 'Marcar como NO contactado' : 'Marcar como SI contactado'}
                            >
                                {record.contacted === 'Si' ? <Check size={16} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                            </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <div className="flex items-center justify-end gap-2">
                               {isPhoneNumber && (
                                   <button onClick={() => openWhatsApp(record.contactInfo)} className="p-1.5 bg-[#25D366] text-white rounded-lg hover:bg-[#20ba5a] transition-colors shadow-sm flex items-center justify-center" title="Enviar WhatsApp">
                                       <MessageCircle size={18} fill="white" />
                                   </button>
                               )}
                               {allowed && (
                                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => onEdit(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                       <button onClick={() => onDelete(record.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                   </div>
                               )}
                           </div>
                        </td>
                    </tr>
                  );
                })
            ) : (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-gray-500">No hay registros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};