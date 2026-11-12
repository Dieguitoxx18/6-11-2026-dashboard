// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rwucvxsjehaxcsmwpoiy.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_nd7s_dmXvHZiT37MELwWFQ_x6jc49ih'

export const supabase = createClient(supabaseUrl, supabaseKey)
