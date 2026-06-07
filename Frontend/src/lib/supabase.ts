import { createClient } from '@supabase/supabase-js';

// Get environment variables or use empty strings
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Prevent SSR crash if the URL is missing or still set to the placeholder
const isPlaceholder = envUrl === 'your_supabase_project_url_here' || !envUrl.startsWith('http');
const supabaseUrl = isPlaceholder ? 'https://placeholder.supabase.co' : envUrl;
const supabaseAnonKey = isPlaceholder ? 'placeholder_key' : envKey;

if (isPlaceholder) {
  console.error("Missing or invalid Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set to your actual project details in your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
