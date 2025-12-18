import { createClient } from '@supabase/supabase-js';

// ⚠️ CONFIGURACIÓN REQUERIDA:
// 1. Ve a tu proyecto en Supabase (https://supabase.com/dashboard)
// 2. Entra en Settings > API
// 3. Copia la "Project URL" y la "anon public key"
// 4. Pégalos abajo reemplazando los valores de ejemplo

export const SUPABASE_URL = 'https://ewbqhnexdtfukcjeqnlu.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3YnFobmV4ZHRmdWtjamVxbmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTc0MDAsImV4cCI6MjA4MTY3MzQwMH0.N0nNHKgEtluV531mjG9cHjvf4ELWzy54KdYrbcUszNY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);