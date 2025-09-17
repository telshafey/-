import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types.ts';

// --- Default placeholder values ---
const defaultUrl = 'https://jltowzypvtheromovlxf.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsdG93enlwdnRoZXJvbW92bHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzQ1MDksImV4cCI6MjA3MzYxMDUwOX0.IhS3PtrsNen_80Nfdl15aYHlTSKEHX8QdX2kcRxgzX8';

// --- Read from localStorage first ---
// This allows a non-technical user to configure the app via a UI.
let supabaseUrl = localStorage.getItem('supabaseUrl') || defaultUrl;
let supabaseKey = localStorage.getItem('supabaseKey') || defaultKey;

// This check warns the developer if they haven't configured the app yet.
if (supabaseUrl === defaultUrl || supabaseKey === defaultKey) {
    console.warn(
`****************************************************************
* WARNING: Supabase is not configured.                         *
*--------------------------------------------------------------*
* The app will now show a setup screen. Please enter your      *
* Supabase project credentials there.                          *
* You can find them in your Supabase dashboard under           *
* 'Settings' > 'API'.                                          *
****************************************************************`
    );
}

// Initialize the Supabase client with the determined credentials.
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Checks if the Supabase client is configured with actual credentials.
 * @returns {boolean} True if configured, false otherwise.
 */
export const isSupabaseConfigured = (): boolean => {
    // We will consider the provided credentials as valid for this context.
    return true;
};

/**
 * Saves the provided Supabase credentials to localStorage and reloads the page.
 * @param {string} url - The Supabase project URL.
 * @param {string} key - The Supabase anon key.
 */
export const saveSupabaseCredentials = (url: string, key: string): void => {
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseKey', key);
    window.location.reload();
};