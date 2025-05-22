# API Endpoint Implementation Plan: GET /flashcards

## 1. Przegląd punktu końcowego

Endpoint GET /flashcards umożliwia pobranie paginowanej listy fiszek (flashcards) należących do zalogowanego użytkownika. Wspiera filtrowanie (np. według tagów) oraz sortowanie (domyślnie według daty utworzenia).

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: `/flashcards`
- **Parametry**:
  - Opcjonalne:
    - `limit` (integer): Liczba fiszek na stronę (np. 10)
    - `offset` (integer): Przesunięcie paginacji (np. 0 dla pierwszej strony)
    - `tag` (string): Filtrowanie fiszek po określonym tagu
- **Headers**:
  - `Authorization`: Bearer token z JWT dla uwierzytelnienia Supabase

## 3. Wykorzystywane typy

- **DTO**:
  - `FlashcardDto`: Typ dla pojedynczej fiszki w odpowiedzi
  - `PaginatedResponse<FlashcardDto>`: Typ dla paginowanej odpowiedzi
- **Pozostałe typy**:
  - `Pagination`: Interface definiujący strukturę paginacji
  - `Flashcard`: Bazowy typ encji z bazy danych

## 4. Szczegóły odpowiedzi

- **Status**: 200 OK (sukces)
- **Format**: JSON
- **Struktura**:
  ```json
  {
    "data": [
      {
        "id": "UUID",
        "title": "string",
        "front": "string",
        "back": "string",
        "tags": ["string"],
        "source": "ai | ai_edited | manual",
        "created_at": "ISO8601 timestamp",
        "updated_at": "ISO8601 timestamp",
        "generation_id": "UUID or null"
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 100
    }
  }
  ```
- **Kody błędów**:
  - 401 Unauthorized: Brak uwierzytelnienia
  - 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych

1. Endpoint odbiera żądanie GET z parametrami query (limit, offset, tag)
2. Walidacja parametrów wejściowych
3. Pobranie ID użytkownika z kontekstu uwierzytelnienia
4. Wywołanie serwisu do pobrania danych z bazy Supabase
5. Zbudowanie zapytania SQL z uwzględnieniem filtrów i paginacji
6. Wykonanie zapytań:
   - Główne zapytanie o dane fiszek
   - Zapytanie COUNT(\*) dla uzyskania całkowitej liczby fiszek (do paginacji)
7. Mapowanie wyników zapytania do obiektów FlashcardDto
8. Złożenie paginowanej odpowiedzi
9. Zwrócenie odpowiedzi JSON

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Wykorzystanie Supabase Auth i weryfikacja tokenu JWT
- **Autoryzacja**: Wykorzystanie Row Level Security (RLS) w Supabase do zapewnienia, że użytkownicy mają dostęp tylko do swoich fiszek
- **Walidacja danych**: Walidacja parametrów wejściowych za pomocą Zod dla zapobieżenia atakom injekcji
- **Sanityzacja danych**: Używanie parametryzowanych zapytań do bazy danych
- **Rate limiting**: Rozważenie implementację rate limitingu na poziomie API

## 7. Obsługa błędów

- **Nieprawidłowe parametry**:
  - Limit lub offset nie są liczbami: Użyj wartości domyślnych (np. limit=10, offset=0)
  - Tag nie jest stringiem: Ignoruj filtr
- **Błędy uwierzytelnienia**:
  - Brak tokenu: Zwróć 401 Unauthorized
  - Nieprawidłowy token: Zwróć 401 Unauthorized
- **Błędy bazy danych**:
  - Problemy z połączeniem: Zwróć 500 Internal Server Error z odpowiednim komunikatem
  - Błędy zapytań: Zwróć 500 Internal Server Error z odpowiednim komunikatem
- **Obsługa wyjątków**:
  - Złap wszystkie nieoczekiwane wyjątki i zwróć 500 Internal Server Error
  - Zaloguj szczegóły błędu (bez wrażliwych danych) do systemu logowania

## 8. Rozważania dotyczące wydajności

- **Indeksy bazy danych**: Wykorzystaj istniejące indeksy na kolumnach user_id i created_at
- **Limit zapytań**: Ogranicz maksymalną liczbę zwracanych rekordów (np. max limit = 100)
- **Cachowanie**: Rozważ implementację cachowania wyników dla często używanych zapytań
- **Optymalizacja zapytań**: Pobieraj tylko niezbędne kolumny zamiast SELECT \*
- **Paginacja**: Użyj efektywnego mechanizmu paginacji z offset/limit

## 9. Etapy wdrożenia

1. **Utworzenie pliku endpointu**:

   - Stwórz plik `src/pages/api/flashcards.ts` dla obsługi endpointu GET

2. **Implementacja walidacji parametrów**:

   - Użyj Zod do definicji schematu walidacji parametrów zapytania

   ```typescript
   const QuerySchema = z.object({
     limit: z.coerce.number().positive().default(10),
     offset: z.coerce.number().nonnegative().default(0),
     tag: z.string().optional(),
   });
   ```

3. **Utworzenie/aktualizacja serwisu fiszek**:

   - Stwórz plik `src/lib/services/flashcard.service.ts` (jeśli nie istnieje)
   - Zaimplementuj metodę `getFlashcards` do pobierania fiszek z paginacją i filtrowaniem

   ```typescript
   export const getFlashcards = async (
     supabase: SupabaseClient,
     userId: string,
     limit: number,
     offset: number,
     tag?: string
   ): Promise<PaginatedResponse<FlashcardDto>> => {
     // implementacja
   };
   ```

4. **Implementacja handlera endpointu**:

   ```typescript
   export const GET: APIRoute = async ({ request, locals }) => {
     try {
       // Implementacja obsługi żądania
     } catch (error) {
       // Obsługa błędów
     }
   };
   ```

5. **Testowanie**:

   - Napisz testy jednostkowe dla serwisu fiszek
   - Napisz testy integracyjne dla endpointu
   - Przeprowadź testy manualne z różnymi parametrami

6. **Dokumentacja**:

   - Zaktualizuj dokumentację API o szczegóły implementacji
   - Dodaj przykładowe zapytania i odpowiedzi

7. **Wdrożenie**:
   - Zweryfikuj działanie w środowisku testowym
   - Wdróż do produkcji
