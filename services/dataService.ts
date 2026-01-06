import { SalesRecord, User, SalesStat } from '../types';
import { supabase } from './supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export const dataService = {
  init: () => {
    // No longer needed
  },

  /**
   * Suscribirse a cambios en tiempo real
   */
  subscribeToChanges: (onUpdate: () => void): RealtimeChannel => {
    return supabase
      .channel('sales_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales_records' },
        (payload) => {
          onUpdate();
        }
      )
      .subscribe();
  },

  /**
   * Verifica si una empresa o contacto ya existen en la base de datos.
   * Devuelve el nombre del encargado original si existe.
   */
  checkDuplicate: async (company: string, contact: string): Promise<string | null> => {
    // Normalizar para comparación
    const cleanCompany = company.trim().toLowerCase();
    const cleanContact = contact.trim().toLowerCase();

    // Consultar por empresa (exacta o muy similar) o contacto
    const { data, error } = await supabase
      .from('sales_records')
      .select('company, contact_info, in_charge')
      .or(`company.ilike.${cleanCompany},contact_info.ilike.${cleanContact}`);

    if (error) {
      console.error('Error verificando duplicados:', error);
      return null;
    }

    if (data && data.length > 0) {
      // Priorizamos encontrar coincidencia exacta de contacto o empresa
      return data[0].in_charge;
    }

    return null;
  },

  /**
   * Get all records from Supabase
   */
  getAllRecords: async (): Promise<SalesRecord[]> => {
    const { data, error } = await supabase
      .from('sales_records')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Error fetching records:', error);
      return [];
    }
    
    return data.map((row: any) => ({
      id: row.id.toString(),
      date: row.date,
      inCharge: row.in_charge,
      address: row.address,
      company: row.company,
      industry: row.industry,
      sold: row.sold,
      contactInfo: row.contact_info
    }));
  },

  /**
   * Get records visible to a specific user
   */
  getRecordsForUser: async (user: User): Promise<SalesRecord[]> => {
    let query = supabase.from('sales_records').select('*').order('created_at', { ascending: false });

    if (user.role !== 'owner') {
      query = query.eq('in_charge', user.username);
    }

    const { data, error } = query ? await query : { data: [], error: null };

    if (error) {
      console.error(error);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id.toString(),
      date: row.date,
      inCharge: row.in_charge,
      address: row.address,
      company: row.company,
      industry: row.industry,
      sold: row.sold,
      contactInfo: row.contact_info
    }));
  },

  /**
   * Add a new record
   */
  addRecord: async (record: Omit<SalesRecord, 'id'>): Promise<SalesRecord | null> => {
    const dbRecord = {
      date: record.date,
      in_charge: record.inCharge,
      address: record.address,
      company: record.company,
      industry: record.industry,
      sold: record.sold,
      contact_info: record.contactInfo
    };

    const { data, error } = await supabase
      .from('sales_records')
      .insert([dbRecord])
      .select()
      .single();

    if (error || !data) {
      console.error(error);
      return null;
    }

    return {
      id: data.id.toString(),
      date: data.date,
      inCharge: data.in_charge,
      address: data.address,
      company: data.company,
      industry: data.industry,
      sold: data.sold,
      contactInfo: data.contact_info
    };
  },

  /**
   * Update an existing record
   */
  updateRecord: async (updatedRecord: SalesRecord): Promise<void> => {
    const dbRecord = {
      company: updatedRecord.company,
      industry: updatedRecord.industry,
      address: updatedRecord.address,
      sold: updatedRecord.sold,
      contact_info: updatedRecord.contactInfo
    };

    await supabase
      .from('sales_records')
      .update(dbRecord)
      .eq('id', updatedRecord.id);
  },

  /**
   * Delete a record by ID
   */
  deleteRecord: async (id: string): Promise<void> => {
    await supabase
      .from('sales_records')
      .delete()
      .eq('id', id);
  },

  /**
   * Clear all records
   */
  clearAllRecords: async (): Promise<void> => {
    await supabase
      .from('sales_records')
      .delete()
      .neq('id', 0); 
  },

  /**
   * Convert records to CSV format
   */
  convertToCSV: (records: SalesRecord[]): string => {
    const headers = ['Fecha', 'Encargado', 'Dirección', 'Empresa', 'Rubro', 'Vendido', 'Contacto'];
    const rows = records.map(r => [
      r.date,
      r.inCharge,
      `"${r.address}"`,
      `"${r.company}"`,
      r.industry,
      r.sold,
      `"${r.contactInfo}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  },

  /**
   * Trigger download
   */
  downloadFile: (content: string, filename: string, type: 'csv' | 'json') => {
    const mimeType = type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;';
    const blob = new Blob([type === 'csv' ? '\uFEFF' + content : content], { type: mimeType });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  /**
   * Get Stats
   */
  getStats: async (): Promise<SalesStat[]> => {
    const allRecords = await dataService.getAllRecords();
    const { data: usersData } = await supabase.from('app_users').select('username');
    
    const statsMap: Record<string, number> = {};
    const validUsernames = new Set<string>();

    if (usersData) {
      usersData.forEach((u: any) => {
        statsMap[u.username] = 0;
        validUsernames.add(u.username);
      });
    }

    allRecords.forEach(r => {
      if (validUsernames.has(r.inCharge)) {
        statsMap[r.inCharge]++;
      }
    });

    return Object.entries(statsMap).map(([name, count]) => {
      let percentage = 0;
      if (count === 0) percentage = 0;
      else if (count >= 1 && count <= 4) percentage = 10;
      else if (count >= 5 && count <= 9) percentage = 15;
      else if (count >= 10 && count <= 14) percentage = 20;
      else if (count >= 15) percentage = 25;

      return {
        name,
        salesCount: count,
        commissionPercentage: percentage
      };
    });
  }
};