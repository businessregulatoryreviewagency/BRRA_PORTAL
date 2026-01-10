import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ydxgiqjuyombtumavnxh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeGdpcWp1eW9tYnR1bWF2bnhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODM5NDksImV4cCI6MjA4MzI1OTk0OX0._1Eae9gMju3lKWbuf8EEm94N6tkH51hoj5lKXL3hB9c'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'brra-auth-token',
    storage: window.localStorage
  },
  global: {
    headers: {
      'x-client-info': 'brra-portal'
    }
  }
})
