import React, { useState } from 'react';
import { SalesRecord, SoldStatus, User } from '../types';
import { Table, Search, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Filter, MessageCircle } from 'lucide-react';

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

  // Permissions logic for Edit/Delete
  const canModify = (record: SalesRecord) => {
    return currentUser.role === 'owner' || record.inCharge === currentUser.username;
  };

  // WhatsApp Link Helper
  const openWhatsApp = (contactInfo: string) => {
    // Eliminar todo lo que no sea número
    const cleanNumber = contactInfo.replace(/\D/g, '');
    if (cleanNumber.length > 0) {
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    } else {
      alert('No se detectó un número válido para WhatsApp en este registro.');
    }
  };

  // Parsing helper for DD/MM/YYYY
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  // Sorting Handler
  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter & Sort Logic
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

      // Handle specific date format
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

  const SortableHeader = ({ label, columnKey }: { label: string; columnKey: SortKey }) => (
    <th 
      scope="col" 
      onClick={() => handleSort(columnKey)}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none group"
    >
      <div className="flex items-center">
        {label}
        {renderSortIcon(columnKey)}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Filters Toolbar */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <Table size={20} />
            </span>
            {currentUser.role === 'owner' ? 'Todos los Registros' : 'Mis Registros'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
                {filteredRecords.length} registros encontrados
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
             {/* Status Filter */}
            <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full bg-white appearance-none cursor-pointer"
                >
                    <option value="all">Todos los estados</option>
                    <option value={SoldStatus.SI}>Vendido</option>
                    <option value={SoldStatus.INTERESADO}>Interesado</option>
                    <option value={SoldStatus.NO}>Rechazado</option>
                    <option value={SoldStatus.PENDIENTE}>Pendiente</option>
                </select>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader label="Fecha" columnKey="date" />
              <SortableHeader label="Encargado" columnKey="inCharge" />
              <SortableHeader label="Empresa" columnKey="company" />
              <SortableHeader label="Rubro" columnKey="industry" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
              <SortableHeader label="Estado" columnKey="sold" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
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
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                    {record.inCharge.charAt(0).toUpperCase()}
                                </div>
                                {record.inCharge}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{record.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.industry}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{record.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(record.sold)}`}>
                            {record.sold}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.contactInfo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <div className="flex items-center justify-end gap-2">
                               {/* WhatsApp Button - Always Visible if there are numbers */}
                               {isPhoneNumber && (
                                   <button 
                                     onClick={() => openWhatsApp(record.contactInfo)}
                                     className="p-1.5 bg-[#25D366] text-white rounded-lg hover:bg-[#20ba5a] transition-colors shadow-sm" 
                                     title="Enviar WhatsApp"
                                   >
                                       <MessageCircle size={16} fill="white" />
                                   </button>
                               )}

                               {/* Edit/Delete Buttons - Visible on hover for owners/assigned users */}
                               {allowed && (
                                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button 
                                         onClick={() => onEdit(record)}
                                         className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                           <Edit2 size={16} />
                                       </button>
                                       <button 
                                         onClick={() => onDelete(record.id)}
                                         className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                           <Trash2 size={16} />
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
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                        No se encontraron registros que coincidan con los filtros.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};