-- Create enum types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
        CREATE TYPE payment_method_enum AS ENUM ('cash', 'credit_card', 'bank_transfer', 'ewallet', 'other');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');
    END IF;
END
$$;

-- Check if payments table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
        -- Check if payment_method column exists and add it if it doesn't
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'payments' AND column_name = 'payment_method') THEN
            ALTER TABLE payments ADD COLUMN payment_method payment_method_enum NOT NULL DEFAULT 'cash';
        END IF;
        
        -- Check if payment_status column exists and add it if it doesn't
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'payments' AND column_name = 'payment_status') THEN
            ALTER TABLE payments ADD COLUMN payment_status payment_status_enum NOT NULL DEFAULT 'pending';
        END IF;
    END IF;
END
$$; 