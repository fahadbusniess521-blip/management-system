
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing. Supabase functionality may be limited.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
