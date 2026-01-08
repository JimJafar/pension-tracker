-- Migration: Add currency_unit column to holdings table
-- This migration adds support for specifying currency units (pounds or pence)

ALTER TABLE holdings ADD COLUMN currency_unit TEXT NOT NULL DEFAULT 'pounds' CHECK(currency_unit IN ('pounds', 'pence'));
