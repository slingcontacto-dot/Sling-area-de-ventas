export type UserRole = 'owner' | 'employee';

export interface User {
  username: string;
  role: UserRole;
  password?: string; // Only for mock auth check
}

export enum SoldStatus {
  SI = 'Si',
  NO = 'No',
  INTERESADO = 'Interesado/Dudoso',
  PENDIENTE = 'Pendiente'
}

export interface SalesRecord {
  id: string;
  date: string; // ISO Date string or formatted string
  inCharge: string; // Username
  address: string;
  company: string;
  industry: string; // Rubro
  sold: SoldStatus | string;
  contactInfo: string; // Numero/IG
}

export interface SalesStat {
  name: string;
  salesCount: number;
  commissionPercentage: number;
  totalRevenue?: number; // Optional based on future needs
}