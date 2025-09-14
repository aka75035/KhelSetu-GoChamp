import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uzfburmjwqeitqtjrgvv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6ZmJ1cm1qd3FlaXRxdGpyZ3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MzYwMTIsImV4cCI6MjA3MzQxMjAxMn0.HdUhPGqECdn5t5LmMZSackSaF51cYSJW6Sf-AO0M_vE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)