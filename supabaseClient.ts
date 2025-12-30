
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const supabaseUrl = 'https://syvjakgeofuxfzvhtrrx.supabase.co';

// 🔴 SERVICE ROLE KEY ACTIVE
// This key has full admin privileges and ignores Row Level Security policies.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5dmpha2dlb2Z1eGZ6dmh0cnJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAxOTIwNSwiZXhwIjoyMDgyNTk1MjA1fQ.0f1WNiMowdY1UM3OP5-kA-O--ACfc8ADOSJC_TNFJ5c';

// Standard client for Authentication and Public Reads
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Admin client for Writes/Deletes (Bypasses RLS by not using user session)
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
