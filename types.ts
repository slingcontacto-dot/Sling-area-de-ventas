
export type UserRole = 'owner' | 'employee';

export interface User {
  username: string;
  role: UserRole;
  password?: string; // Only for mock auth check
}

export enum SoldStatus {
  SI = 'Si',
  NO = 'No',
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
  contacted: 'Si' | 'No'; // New field
}

export interface SalesStat {
  name: string;
  salesCount: number; // Total de registros realizados
  contactedCount: number;
  vendidoCount: number;
  rechazadoCount: number;
  pendienteCount: number;
  commissionPercentage: number;
  totalRevenue?: number;
}
