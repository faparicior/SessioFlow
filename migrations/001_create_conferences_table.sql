-- migrations/001_create_conferences_table.sql
-- This migration creates the conferences table with all necessary columns and constraints.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conferences table
CREATE TABLE IF NOT EXISTS conferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(1000) DEFAULT '',
  slug VARCHAR(200) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  organizer_id UUID NOT NULL,
  cfp_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_conferences_slug ON conferences(slug);

-- Create index on organizer_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_conferences_organizer_id ON conferences(organizer_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_conferences_status ON conferences(status);

-- Row Level Security (RLS) Policies
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own conferences
CREATE POLICY "Users can view own conferences"
  ON conferences FOR SELECT
  USING (organizer_id = auth.uid());

-- Policy: Users can create conferences
CREATE POLICY "Users can create conferences"
  ON conferences FOR INSERT
  WITH CHECK (organizer_id = auth.uid());

-- Policy: Users can update their own conferences
CREATE POLICY "Users can update own conferences"
  ON conferences FOR UPDATE
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- Policy: Users can delete their own conferences
CREATE POLICY "Users can delete own conferences"
  ON conferences FOR DELETE
  USING (organizer_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_conferences_updated_at
  BEFORE UPDATE ON conferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();