import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cftxkxfqbmxwgdcawelx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdHhreGZxYm14d2dkY2F3ZWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0OTQ0MTMsImV4cCI6MjA3MzA3MDQxM30.bGFuv28D08ImhMIgRxgKYnaIiFHE-tvTpKX0fnQh23E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)