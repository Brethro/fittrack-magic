
/**
 * SQL scripts for creating database tables
 * These can be executed in the Supabase SQL Editor
 */

// Extension for UUID generation
export const uuidExtensionScript = `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

// Create tables scripts
export const createTableScripts = {
  foods: `CREATE TABLE public.foods (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  brand text,
  source text NOT NULL,
  source_id text NOT NULL,
  category text,
  serving_size numeric NOT NULL,
  serving_unit text NOT NULL,
  household_serving text,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL
);`,
  food_nutrients: `CREATE TABLE public.food_nutrients (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  food_id uuid REFERENCES public.foods(id) ON DELETE CASCADE,
  calories numeric NOT NULL,
  protein numeric NOT NULL,
  carbs numeric NOT NULL,
  fat numeric NOT NULL,
  fiber numeric NOT NULL,
  sugar numeric NOT NULL,
  other_nutrients jsonb NOT NULL
);`,
  user_favorites: `CREATE TABLE public.user_favorites (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL,
  food_id uuid REFERENCES public.foods(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL
);`,
  search_logs: `CREATE TABLE public.search_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  query text NOT NULL,
  source text NOT NULL,
  results_count integer NOT NULL,
  created_at timestamp with time zone NOT NULL
);`,
  weight_logs: `CREATE TABLE public.weight_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL,
  date timestamp with time zone NOT NULL,
  weight numeric NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL
);`
};

// SQL for RLS (Row Level Security) policies
export const rlsPolicies = {
  foods: [
    `-- Enable RLS
    ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
    
    -- Allow anyone to read food data
    CREATE POLICY "Anyone can read foods" 
    ON foods FOR SELECT USING (true);
    
    -- Allow anyone to insert food data
    CREATE POLICY "Anyone can insert foods" 
    ON foods FOR INSERT WITH CHECK (true);
    
    -- Only admins can update foods
    CREATE POLICY "Only admins can update foods" 
    ON foods FOR UPDATE USING (
      auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );
    
    -- Only admins can delete foods
    CREATE POLICY "Only admins can delete foods" 
    ON foods FOR DELETE USING (
      auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );`
  ],
  user_specific: [
    `-- Enable RLS
    ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
    ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
    
    -- Users can only read their own data
    CREATE POLICY "Users can read own favorites" 
    ON user_favorites FOR SELECT USING (
      auth.uid() = user_id
    );
    
    CREATE POLICY "Users can read own weight logs" 
    ON weight_logs FOR SELECT USING (
      auth.uid() = user_id
    );
    
    -- Users can only modify their own data
    CREATE POLICY "Users can insert own favorites" 
    ON user_favorites FOR INSERT WITH CHECK (
      auth.uid() = user_id
    );
    
    CREATE POLICY "Users can insert own weight logs" 
    ON weight_logs FOR INSERT WITH CHECK (
      auth.uid() = user_id
    );`
  ]
};
