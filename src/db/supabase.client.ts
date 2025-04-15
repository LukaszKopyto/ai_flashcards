import { createClient } from '@supabase/supabase-js';

import type { Database } from '../db/database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const DEFAULT_USER_ID = 'eebe5457-5247-4e01-8af5-b7d623a3c474';
