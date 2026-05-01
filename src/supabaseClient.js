import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wawvqiahdywadnlwzlrh.supabase.co'
const supabaseKey = 'sb_publishable_QkML7XK9TV0uSg6PwULI8Q_IWGquee9'

export const supabase = createClient(supabaseUrl, supabaseKey)