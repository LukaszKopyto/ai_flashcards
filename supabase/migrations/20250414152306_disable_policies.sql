-- Migration: Disable Policies
-- Description: Disables all previously defined policies for flashcards, generations, and generation_error_logs tables
-- Author: AI Flashcards Team
-- Date: 2024-04-14

-- Drop policies for flashcards table
drop policy if exists "authenticated users can view own flashcards" on flashcards;
drop policy if exists "authenticated users can insert own flashcards" on flashcards;
drop policy if exists "authenticated users can update own flashcards" on flashcards;
drop policy if exists "authenticated users can delete own flashcards" on flashcards;
drop policy if exists "anon users cannot view flashcards" on flashcards;
drop policy if exists "anon users cannot insert flashcards" on flashcards;
drop policy if exists "anon users cannot update flashcards" on flashcards;
drop policy if exists "anon users cannot delete flashcards" on flashcards;

-- Drop policies for generations table
drop policy if exists "authenticated users can view own generations" on generations;
drop policy if exists "authenticated users can insert own generations" on generations;
drop policy if exists "authenticated users can update own generations" on generations;
drop policy if exists "authenticated users can delete own generations" on generations;
drop policy if exists "anon users cannot view generations" on generations;
drop policy if exists "anon users cannot insert generations" on generations;
drop policy if exists "anon users cannot update generations" on generations;
drop policy if exists "anon users cannot delete generations" on generations;

-- Drop policies for generation_error_logs table
drop policy if exists "authenticated users can view own error logs" on generation_error_logs;
drop policy if exists "authenticated users can insert own error logs" on generation_error_logs;
drop policy if exists "authenticated users can delete own error logs" on generation_error_logs;
drop policy if exists "anon users cannot view error logs" on generation_error_logs;
drop policy if exists "anon users cannot insert error logs" on generation_error_logs;
drop policy if exists "anon users cannot delete error logs" on generation_error_logs;

-- Disable RLS on all tables
alter table flashcards disable row level security;
alter table generations disable row level security;
alter table generation_error_logs disable row level security; 