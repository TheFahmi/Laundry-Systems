-- Fix NULL reference_number values in payments table
UPDATE payments
SET reference_number = CONCAT('REF-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'))
WHERE reference_number IS NULL;

-- Add default constraint to reference_number column
ALTER TABLE payments
ALTER COLUMN reference_number SET DEFAULT 'REF-00000000-00000';

-- Set NOT NULL constraint on reference_number column
ALTER TABLE payments
ALTER COLUMN reference_number SET NOT NULL; 