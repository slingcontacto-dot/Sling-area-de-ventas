import { User } from '../types';
import { supabase } from './supabaseClient';

export const authService = {
  init: () => {
    // No longer needed for Supabase
  },

  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .order('username');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data as User[];
  },

  login: async (username: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username)
      .eq('password', password) // Note: simple text match based on request requirements
      .single();

    if (error || !data) {
      return null;
    }
    return data as User;
  },

  addUser: async (user: User): Promise<boolean> => {
    // Check if exists first
    const { data: existing } = await supabase
      .from('app_users')
      .select('username')
      .eq('username', user.username)
      .single();

    if (existing) return false;

    const { error } = await supabase
      .from('app_users')
      .insert([{ 
        username: user.username, 
        password: user.password, 
        role: user.role 
      }]);

    return !error;
  },

  updateUser: async (originalUsername: string, updatedUser: User): Promise<void> => {
    // Find ID first (assuming username is unique but we need row ID for best practice, 
    // though here we update by username for consistency with previous logic)
    await supabase
      .from('app_users')
      .update({ 
        password: updatedUser.password, 
        role: updatedUser.role 
        // We don't update username to avoid breaking relations in this simple architecture
      })
      .eq('username', originalUsername);
  },

  deleteUser: async (username: string): Promise<void> => {
    await supabase
      .from('app_users')
      .delete()
      .eq('username', username);
  }
};