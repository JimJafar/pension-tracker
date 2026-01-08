-- Add cash column to pensions table
ALTER TABLE pensions ADD COLUMN cash INTEGER DEFAULT 0;
