
import { SalesRecord, User, SalesStat, SoldStatus } from '../types';
import { supabase } from './supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export const dataService = {
  subscribeToChanges: (onUpdate: () => void): RealtimeChannel | null => {
    try {
      return supabase
        .channel('sales_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sales_records' },
          () => onUpdate()
        )
        .subscribe();
    } catch (e) {
      return null;
    }
  },

  checkDuplicate: async (company: string, contact: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('sales_records')
        .select('company, contact_info, in_charge')
        .or(`company.ilike.${company},contact_info.ilike.${contact}`);

      if (error) throw error;
      return data && data.length > 0 ? data[0].in_charge : null;
    } catch (err) {
      const records = await dataService.getAllRecords();
      const dup = records.find(r => 
        r.company.toLowerCase() === company.toLowerCase() || 
        r.contactInfo.toLowerCase() === contact.toLowerCase()
      );
      return dup ? dup.inCharge : null;
    }
  },

  getRecordsForUser: async (user: User): Promise<SalesRecord[]> => {
    try {
      let query = supabase.from('sales_records').select('*').order('id', { ascending: false });
      if (user.role !== 'owner') {
        query = query.eq('in_charge', user.username);
      }
      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id.toString(),
        date: row.date,
        inCharge: row.in_charge,
        address: row.address,
        company: row.company,
        industry: row.industry,
        sold: row.sold,
        contactInfo: row.contact_info,
        contacted: row.contacted
      }));
    } catch (err) {
      const all = await dataService.getAllRecords();
      return user.role === 'owner' ? all : all.filter(r => r.inCharge === user.username);
    }
  },

  getAllRecords: async (): Promise<SalesRecord[]> => {
    try {
      const { data, error } = await supabase.from('sales_records').select('*').order('id', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id.toString(),
        date: row.date,
        inCharge: row.in_charge,
        address: row.address,
        company: row.company,
        industry: row.industry,
        sold: row.sold,
        contactInfo: row.contact_info,
        contacted: row.contacted
      }));
    } catch (err) {
      const localData = localStorage.getItem('local_sales');
      return localData ? JSON.parse(localData) : [];
    }
  },

  addRecord: async (record: Omit<SalesRecord, 'id'>): Promise<SalesRecord | null> => {
    const dbRecord = {
      date: record.date,
      in_charge: record.inCharge,
      address: record.address,
      company: record.company,
      industry: record.industry,
      sold: record.sold,
      contact_info: record.contactInfo,
      contacted: record.contacted
    };

    try {
      const { data, error } = await supabase
        .from('sales_records')
        .insert([dbRecord])
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id.toString(),
        date: data.date,
        inCharge: data.in_charge,
        address: data.address,
        company: data.company,
        industry: data.industry,
        sold: data.sold,
        contactInfo: data.contact_info,
        contacted: data.contacted
      };
    } catch (err) {
      const records = await dataService.getAllRecords();
      const newRecord = { ...record, id: Date.now().toString() };
      localStorage.setItem('local_sales', JSON.stringify([newRecord, ...records]));
      return newRecord;
    }
  },

  updateRecord: async (updatedRecord: SalesRecord): Promise<void> => {
    try {
      const { error } = await supabase
        .from('sales_records')
        .update({
          company: updatedRecord.company,
          industry: updatedRecord.industry,
          address: updatedRecord.address,
          sold: updatedRecord.sold,
          contact_info: updatedRecord.contactInfo,
          contacted: updatedRecord.contacted
        })
        .eq('id', updatedRecord.id);
      
      if (error) throw error;
    } catch (err) {
      const records = await dataService.getAllRecords();
      const updated = records.map(r => r.id === updatedRecord.id ? updatedRecord : r);
      localStorage.setItem('local_sales', JSON.stringify(updated));
    }
  },

  deleteRecord: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('sales_records').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      const records = await dataService.getAllRecords();
      const filtered = records.filter(r => r.id !== id);
      localStorage.setItem('local_sales', JSON.stringify(filtered));
    }
  },

  clearAllRecords: async (): Promise<void> => {
    try {
      await supabase.from('sales_records').delete().neq('id', 0); 
    } catch (e) {
      localStorage.removeItem('local_sales');
    }
  },

  getStats: async (): Promise<SalesStat[]> => {
    const allRecords = await dataService.getAllRecords();
    
    const userStatsMap: Record<string, { total: number; contacted: number; vendido: number; rechazado: number; pendiente: number }> = {};
    
    allRecords.forEach(r => {
      if (!userStatsMap[r.inCharge]) {
        userStatsMap[r.inCharge] = { total: 0, contacted: 0, vendido: 0, rechazado: 0, pendiente: 0 };
      }
      
      userStatsMap[r.inCharge].total++;
      
      if (r.contacted === 'Si') {
        userStatsMap[r.inCharge].contacted++;
      }

      const status = r.sold;
      if (status === SoldStatus.SI) userStatsMap[r.inCharge].vendido++;
      else if (status === SoldStatus.NO) userStatsMap[r.inCharge].rechazado++;
      else if (status === SoldStatus.PENDIENTE || status === 'Interesado/Dudoso') userStatsMap[r.inCharge].pendiente++;
    });

    return Object.entries(userStatsMap).map(([name, data]) => {
      let percentage = 0;
      if (data.total >= 15) percentage = 25;
      else if (data.total >= 10) percentage = 20;
      else if (data.total >= 5) percentage = 15;
      else if (data.total >= 1) percentage = 10;

      return { 
        name, 
        salesCount: data.total, 
        contactedCount: data.contacted,
        vendidoCount: data.vendido,
        rechazadoCount: data.rechazado,
        pendienteCount: data.pendiente,
        commissionPercentage: percentage 
      };
    });
  },

  convertToCSV: (records: SalesRecord[]): string => {
    const headers = ['Fecha', 'Encargado', 'Dirección', 'Empresa', 'Rubro', 'Vendido', 'Contacto', 'Contactado'];
    const rows = records.map(r => [r.date, r.inCharge, `"${r.address}"`, `"${r.company}"`, r.industry, r.sold, `"${r.contactInfo}"`, r.contacted]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  },

  downloadFile: (content: string, filename: string, type: 'csv' | 'json') => {
    const mimeType = type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const blob = new Blob([type === 'csv' ? '\uFEFF' + content : content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
};
