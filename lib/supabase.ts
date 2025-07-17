import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace these with your actual Supabase project credentials
const supabaseUrl = "https://jehukdivfpoxcmmzrrbz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplaHVrZGl2ZnBveGNtbXpycmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxODEzMTQsImV4cCI6MjA2Nzc1NzMxNH0.YoQRs8gjBYEQ1PqquV7hVcjUrtCYffwTROZfecIqeGU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for your database
export interface User {
  id: string;
  email: string;
  role: "admin" | "sales";
  full_name?: string;
  created_at: string;
}

export interface Drug {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiry_date: string;
  controlled_substance: boolean;
  created_at: string;
}

export interface Sale {
  id: string;
  drug_id: string;
  quantity: number;
  user_id: string;
  flagged: boolean;
  created_at: string;
}
