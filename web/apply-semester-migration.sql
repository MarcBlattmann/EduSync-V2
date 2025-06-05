-- Check if semesters table exists and create it if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'semesters') THEN
        -- Create semesters table
        CREATE TABLE "semesters" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "name" TEXT NOT NULL,
          "start_date" DATE NOT NULL,
          "end_date" DATE NOT NULL,
          "description" TEXT,
          "is_active" BOOLEAN DEFAULT false,
          "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Add RLS policies for semesters
        ALTER TABLE "semesters" ENABLE ROW LEVEL SECURITY;

        -- Policy: Users can create their own semesters
        CREATE POLICY "Users can create their own semesters" 
          ON "semesters" FOR INSERT 
          WITH CHECK (auth.uid() = user_id);

        -- Policy: Users can view their own semesters
        CREATE POLICY "Users can view their own semesters" 
          ON "semesters" FOR SELECT 
          USING (auth.uid() = user_id);

        -- Policy: Users can update their own semesters
        CREATE POLICY "Users can update their own semesters" 
          ON "semesters" FOR UPDATE 
          USING (auth.uid() = user_id);

        -- Policy: Users can delete their own semesters
        CREATE POLICY "Users can delete their own semesters" 
          ON "semesters" FOR DELETE 
          USING (auth.uid() = user_id);

        RAISE NOTICE 'Semesters table and policies created successfully';
    ELSE
        RAISE NOTICE 'Semesters table already exists';
    END IF;
END $$;

-- Check if grades table has semester_id column and add it if not
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'grades' 
        AND column_name = 'semester_id'
    ) THEN
        -- Add semester_id column to grades table
        ALTER TABLE "grades" ADD COLUMN "semester_id" UUID REFERENCES "semesters"(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added semester_id column to grades table';
    ELSE
        RAISE NOTICE 'semester_id column already exists in grades table';
    END IF;
END $$;

-- Update timestamp trigger for semesters table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_semesters_updated_at ON semesters;
CREATE TRIGGER update_semesters_updated_at 
    BEFORE UPDATE ON semesters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
