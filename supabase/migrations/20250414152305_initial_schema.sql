-- Migration: Initial Schema
-- Description: Creates the initial database schema for AI Flashcards application
-- Tables: flashcards, generations, generation_error_logs
-- Author: AI Flashcards Team
-- Date: 2024-04-14

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create custom types
create type flashcard_source as enum ('ai', 'ai_edited', 'manual');

-- Create tables (in order of dependencies)
create table generations (
    id uuid primary key default uuid_generate_v4(),
    generated_count integer not null default 0,
    accepted_unedited_count integer,
    accepted integer,
    edited_count integer,
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    user_id uuid not null references auth.users(id)
);

create table flashcards (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    front varchar(200) not null,
    back varchar(500) not null,
    tags text[] not null default '{}',
    source flashcard_source not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id uuid references generations(id) on delete set null,
    user_id uuid not null references auth.users(id)
);

create table generation_error_logs (
    id uuid primary key default uuid_generate_v4(),
    generation_id uuid not null references generations(id) on delete cascade,
    error_details jsonb not null,
    created_at timestamptz not null default now(),
    user_id uuid not null references auth.users(id)
);

-- Create indexes for better query performance
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_generation_id on flashcards(generation_id);
create index idx_flashcards_created_at on flashcards(created_at);

create index idx_generations_user_id on generations(user_id);
create index idx_generations_created_at on generations(created_at);

create index idx_gen_error_logs_generation_id on generation_error_logs(generation_id);
create index idx_gen_error_logs_user_id on generation_error_logs(user_id);

-- Enable Row Level Security (RLS)
alter table flashcards enable row level security;
alter table generations enable row level security;
alter table generation_error_logs enable row level security;

-- RLS Policies for flashcards table
-- Policies for authenticated users
create policy "authenticated users can view own flashcards"
    on flashcards
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "authenticated users can insert own flashcards"
    on flashcards
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "authenticated users can update own flashcards"
    on flashcards
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "authenticated users can delete own flashcards"
    on flashcards
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- Policies for anon users (explicitly deny access)
create policy "anon users cannot view flashcards"
    on flashcards
    for select
    to anon
    using (false);

create policy "anon users cannot insert flashcards"
    on flashcards
    for insert
    to anon
    with check (false);

create policy "anon users cannot update flashcards"
    on flashcards
    for update
    to anon
    using (false)
    with check (false);

create policy "anon users cannot delete flashcards"
    on flashcards
    for delete
    to anon
    using (false);

-- RLS Policies for generations table
-- Policies for authenticated users
create policy "authenticated users can view own generations"
    on generations
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "authenticated users can insert own generations"
    on generations
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "authenticated users can update own generations"
    on generations
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "authenticated users can delete own generations"
    on generations
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- Policies for anon users (explicitly deny access)
create policy "anon users cannot view generations"
    on generations
    for select
    to anon
    using (false);

create policy "anon users cannot insert generations"
    on generations
    for insert
    to anon
    with check (false);

create policy "anon users cannot update generations"
    on generations
    for update
    to anon
    using (false)
    with check (false);

create policy "anon users cannot delete generations"
    on generations
    for delete
    to anon
    using (false);

-- RLS Policies for generation_error_logs table
-- Policies for authenticated users
create policy "authenticated users can view own error logs"
    on generation_error_logs
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "authenticated users can insert own error logs"
    on generation_error_logs
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "authenticated users can delete own error logs"
    on generation_error_logs
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- Policies for anon users (explicitly deny access)
create policy "anon users cannot view error logs"
    on generation_error_logs
    for select
    to anon
    using (false);

create policy "anon users cannot insert error logs"
    on generation_error_logs
    for insert
    to anon
    with check (false);

create policy "anon users cannot delete error logs"
    on generation_error_logs
    for delete
    to anon
    using (false);

-- Create trigger function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at columns
create trigger set_timestamp_flashcards
    before update on flashcards
    for each row
    execute function update_updated_at_column();

create trigger set_timestamp_generations
    before update on generations
    for each row
    execute function update_updated_at_column(); 