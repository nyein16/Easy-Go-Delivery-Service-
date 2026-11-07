import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vqeyyudsxqxoypctdynz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_BIFcq1QuVGfc_VidFYjbGw_bWAvUd7E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
