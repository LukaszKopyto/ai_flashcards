# Schemat bazy danych PostgreSQL

## 1. Tabele

### 1.1. Typ ENUM

```sql
CREATE TYPE flashcard_source AS ENUM ('ai', 'ai_edited', 'manual');
```

### 1.2. Tabela: flashcards

```sql
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    front VARCHAR(200) NOT NULL,
    back VARCHAR(500) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    source flashcard_source NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id)
);
```

### 1.3. Tabela: generations

```sql
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generated_count INTEGER NOT NULL DEFAULT 0,
    accepted_unedited_count INTEGER NULLABLE,
    accepted INTEGER NULLABLE,
    edited_count INTEGER NULLABLE,
    generation_duration: INTEGER NOT NULL
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id)
);
```

### 1.4. Tabela: generation_error_logs

```sql
CREATE TABLE generation_error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generation_id UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
    error_details JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id)
);
```

## 2. Relacje między tabelami

- Każdy użytkownik (z tabeli auth.users) może mieć wiele:
  - `flashcards` (poprzez kolumnę user_id)
  - `generations` (poprzez kolumnę user_id)
  - `generation_error_logs` (poprzez kolumnę user_id)
- Jedna generacja (`generations`) może być powiązana z wieloma fiszkami (`flashcards`) poprzez kolumnę generation_id.
- Każdy wpis w `generation_error_logs` odnosi się do konkretnej generacji (`generations.id`).

## 3. Indeksy

```sql
-- Flashcards
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_generation_id ON flashcards(generation_id);
CREATE INDEX idx_flashcards_created_at ON flashcards(created_at);

-- Generations
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at);

-- Generation Error Logs
CREATE INDEX idx_gen_error_logs_generation_id ON generation_error_logs(generation_id);
CREATE INDEX idx_gen_error_logs_user_id ON generation_error_logs(user_id);
```

## 4. Zasady PostgreSQL (RLS - Row Level Security)

```sql
-- Włączenie RLS na tabelach
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;

-- Przykładowe polityki RLS (zakładając, że auth.uid() zwraca ID zalogowanego użytkownika)
CREATE POLICY select_own_flashcards ON flashcards
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY modify_own_flashcards ON flashcards
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY select_own_generations ON generations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY modify_own_generations ON generations
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY select_own_generation_error_logs ON generation_error_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY modify_own_generation_error_logs ON generation_error_logs
    FOR ALL USING (user_id = auth.uid());
```

## 5. Dodatkowe uwagi

- Wszystkie klucze główne są oparte na UUID, co zapewnia unikalność i skalowalność danych.
- Mechanizm automatycznej aktualizacji liczników w tabeli `generations` można zaimplementować przy użyciu triggerów lub logiki aplikacji.
- Przechowywanie tagów jako tablica tekstowa w `flashcards` umożliwia późniejszą migrację do modelu relacji wiele-do-wielu, w miarę rozwoju projektu.
- Użycie typu ENUM (`flashcard_source`) gwarantuje, że pole `source` przyjmie tylko dozwolone wartości: 'ai', 'ai_edited', 'manual'.
- Indeksy zostały zaplanowane w celu optymalizacji zapytań, szczególnie na kolumnach kluczowych takich jak `user_id` i `created_at`.
