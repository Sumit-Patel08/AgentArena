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

// Pass ws package conditionally on SSR for Node < 22 support
let clientOptions: any = {};

if (typeof window === 'undefined') {
  // We are in Node.js (SSR context)
  // Dynamically load the 'ws' package to avoid bringing it into browser bundles
  try {
    // @ts-ignore
    const wsModule = await import(/* @vite-ignore */ 'ws');
    clientOptions.realtime = {
      transport: wsModule.default || wsModule,
    };
  } catch (err) {
    console.error("Failed to load 'ws' package for Supabase SSR support:", err);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions);

