import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jozhsutwjmdjooodfwgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvemhzdXR3am1kam9vb2Rmd2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyODU2NzgsImV4cCI6MjA3MTg2MTY3OH0.LdoUMaJ5BHNkB_z9Ea9ceiZ8hQ_F-v8cgWhzJ-I_6zU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
