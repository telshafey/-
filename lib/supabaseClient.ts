
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://cqcbyjvtsjzyjjkmttis.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2J5anZ0c2p6eWpqa210dGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NzQyODUsImV4cCI6MjA3MDM1MDI4NX0.3r1uBBElR1qknlAKFKNLoA8hjkiFd7UEajxBb7xKcNw';

// The Supabase client is temporarily disabled to allow for frontend-only development.
// To re-enable, uncomment the following lines.
/*
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Key are required.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
*/

// Provide a mock client to prevent application crashes.
export const supabase = {
    auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        // Add other methods that are called in the app to avoid errors
        signInWithPassword: () => Promise.resolve({ error: { message: "Supabase is disabled."} }),
        signUp: () => Promise.resolve({ error: { message: "Supabase is disabled."} }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithOAuth: () => Promise.resolve({ error: { message: "Supabase is disabled."} }),
        resetPasswordForEmail: () => Promise.resolve({ error: { message: "Supabase is disabled."} }),
        updateUser: () => Promise.resolve({ error: { message: "Supabase is disabled."} }),
        getUser: () => Promise.resolve({ data: { user: null } }),
    },
    from: (table: string) => ({
        select: () => Promise.resolve({ data: [], error: { message: `Supabase is disabled for table: ${table}.`} }),
        insert: () => Promise.resolve({ error: { message: "Supabase is disabled."} }),
        update: () => Promise.resolve({ error: { message: "Supabase is disabled."} }),
        upsert: () => Promise.resolve({ error: { message: "Supabase is disabled."} }),
        eq: () => ({}), // Chainable, returns mock object
    }),
    storage: {
      from: (bucket: string) => ({
        upload: () => Promise.resolve({ error: { message: `Supabase storage is disabled for bucket: ${bucket}.` } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
} as any;
