
# Database Structure and Security

This document outlines the database structure, security model, and implementation phases for the FitTrack application.

## Phase 1: Core Database & RLS Setup

### Database Tables

- **foods**: Stores food items with nutritional information
- **food_nutrients**: Contains nutritional data linked to foods
- **user_favorites**: Tracks user's favorite foods
- **search_logs**: Records search queries
- **weight_logs**: Stores user weight tracking data

### RLS Policies

**Foods Table:**
```sql
-- Enable RLS
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
);
```

**User-specific Tables (user_favorites, weight_logs):**
```sql
-- Enable RLS
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
);
```

## Phase 2: Spam & Abuse Mitigation

To implement:

1. Add metadata columns to foods table:
```sql
ALTER TABLE foods ADD COLUMN inserted_by_ip text;
ALTER TABLE foods ADD COLUMN inserted_by_session text;
ALTER TABLE foods ADD COLUMN status text DEFAULT 'pending';
```

2. Adjust RLS policy to only show approved foods to regular users:
```sql
DROP POLICY "Anyone can read foods" ON foods;

CREATE POLICY "Regular users can only see approved foods" 
ON foods FOR SELECT USING (
  status = 'approved' OR 
  (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);
```

3. Implement rate limiting and CAPTCHA on the frontend submission form

## Phase 3: Data Ingestion & Caching

The current implementation already supports:
- Ingesting data from external APIs (USDA, Open Food Facts)
- Automatic storage in the Supabase database
- Caching via the front-end

Additional improvements:
- Add indexes on frequently searched columns:
```sql
CREATE INDEX foods_name_idx ON foods USING GIN (name gin_trgm_ops);
CREATE INDEX foods_brand_idx ON foods USING GIN (brand gin_trgm_ops);
CREATE INDEX foods_category_idx ON foods USING GIN (category gin_trgm_ops);
```

## Phase 4: User Experience & Extended Security

Current implementation covers:
- Favorite foods functionality
- Weight logging
- Session management

To consider:
- Require authentication for food submissions if spam becomes an issue
- Implement more granular permission levels
- Add user reputation system

## Phase 5: Monitoring & Maintenance

To implement:
- Use Supabase logs to track activity
- Set up alerts for unusual patterns
- Regular database maintenance and cleanup
