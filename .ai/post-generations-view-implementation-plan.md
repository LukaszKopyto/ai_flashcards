/\*
API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego

Endpoint służy do inicjowania sesji generowania propozycji fiszek przy użyciu AI. Użytkownik wysyła dużą ilość tekstu (input_text) wraz z opcjonalnymi metadanymi. Na podstawie tego tekstu, system wywołuje usługę AI (np. Openrouter.ai), generuje propozycje fiszek oraz zapisuje sesję w bazie danych.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: /generations
- Parametry:
  - Wymagane:
    - `input_text`: string (1000-10000 znaków)
  - Opcjonalne:
    - `metadata`: obiekt zawierający dodatkowy kontekst
- Request Body:
  ```json
  {
    "input_text": "...",
    "metadata": { ... }
  }
  ```

## 3. Wykorzystywane typy

- DTOs i Command Modele:
  - `StartGenerationCommand`: reprezentuje dane wejściowe sesji generacji. Zawiera `input_text` oraz opcjonalnie `metadata`.
  - `GenerationDto`: format odpowiedzi, który zwraca dane sesji generacji, łącznie z listą propozycji fiszek.
  - `ProposalFlashcardDto`: DTO dla każdej zaproponowanej fiszki (z polami: title, front, back, tags, source).

## 4. Szczegóły odpowiedzi

- Status: 201 Created w przypadku poprawnego utworzenia sesji.
- Struktura Response JSON:
  ```json
  {
    "id": "UUID",
    "generated_count": 10,
    "accepted_unedited_count": null,
    "accepted": null,
    "edited_count": null,
    "generation_duration": 2500,
    "created_at": "ISO8601 timestamp",
    "updated_at": "ISO8601 timestamp",
    "flashcards_proposals": [
      {
        "title": "string",
        "front": "string",
        "back": "string",
        "tags": ["string"],
        "source": "ai"
      }
    ]
  }
  ```
- Kody błędów:
  - 400 Bad Request: Nieprawidłowe dane wejściowe (np. zbyt krótki lub za długi tekst)
  - 401 Unauthorized: Brak lub niewłaściwy token autoryzacyjny
  - 500 Internal Server Error: Błąd po stronie serwera lub nieudane połączenie z usługą AI

## 5. Przepływ danych

1. Klient wysyła żądanie POST /generations wraz z `input_text` oraz (opcjonalnie) `metadata`.
2. Middleware autoryzacyjny weryfikuje token JWT i przypisuje `user_id` do żądania.
3. Warstwa walidacji sprawdza:
   - Obecność i poprawność `input_text` (długość 1000-10000 znaków).
   - (Opcjonalnie) poprawność struktury `metadata`.
4. Logika biznesowa (service layer):
   - Inicjuje sesję generacji w bazie danych, wstawiając rekord do tabeli `generations` z odpowiednimi domyślnymi wartościami (np. generated_count = 0, generation_duration, etc.).
   - Uruchamia zewnętrzny serwis AI (np. Openrouter.ai) do wygenerowania propozycji fiszek na podstawie przekazanego tekstu.
   - Przetwarza odpowiedź z serwisu AI, mapując wyniki do tablicy `flashcards_proposals`.
5. Aktualizuje rekord sesji w bazie danych (np. generation_duration, generated_count).
6. Zwraca JSON z danymi sesji i propozycjami fiszek do klienta.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: Weryfikacja tokenu JWT zapewniającego autoryzowany dostęp.
- Ograniczenia RLS: Baza danych (Supabase) z politykami RLS dla tabeli `generations` uniemożliwiającymi manipulację danymi przez nieautoryzowanych użytkowników.
- Walidacja danych wejściowych: Zapewnienie, że `input_text` spełnia kryteria długości oraz sanitizacja potencjalnie niebezpiecznych danych w `metadata`.

## 7. Obsługa błędów

- Błędy walidacji wejścia powinny zwracać 400 Bad Request z jasnym komunikatem o przyczynie błędu.
- Błędy autoryzacyjne (np. brak tokenu) zwracają 401 Unauthorized.
- Problemy z komunikacją z zewnętrznym serwisem AI lub błędy bazy danych zwracają 500 Internal Server Error.
- Zarejestrowanie błędów (np. w tabeli `generation_error_logs` jeśli dotyczy): Logowanie szczegółowych informacji o błędach umożliwiających diagnostykę problemów.

## 8. Rozważania dotyczące wydajności

- Indeksy bazy danych na polach `user_id` i `created_at` w tabeli `generations` poprawiają wydajność zapytań.
- Asynchroniczne wywoływanie serwisu AI by nie blokować głównego wątku przetwarzania.
- Możliwość wprowadzenia limitów rozmiaru wejściowego `input_text`, aby chronić system przed nadużyciami.

## 9. Etapy wdrożenia

1. Utworzenie/aktualizacja endpointu POST /generations w katalogu API (np. w pliku /src/pages/api/generations.ts).
2. Implementacja middleware do weryfikacji tokenu JWT.
3. Implementacja walidacji danych wejściowych zgodnie z wymaganiami (sprawdzenie długości `input_text` i struktury `metadata`).
4. Utworzenie warstwy service odpowiedzialnej za:
   - Inicjację rekordu sesji w bazie danych
   - Wywołanie zewnętrznego serwisu AI
   - Przetworzenie i mapowanie odpowiedzi na DTO `GenerationDto`
5. Aktualizacja rekordu w bazie danych z wynikami generacji (np. generation_duration, generated_count).
6. Implementacja logiki rejestrowania błędów, które mogą być zapisane do tabeli `generation_error_logs`.
7. Testowanie endpointu:
   - Testy jednostkowe walidacyjne i logiki biznesowej
   - Testy integracyjne sprawdzające komunikację z serwisem AI oraz interakcję z bazą danych
8. Przegląd kodu przez zespół i wdrożenie na środowisko testowe
9. Monitorowanie i optymalizacja wydajności po wdrożeniu
   \*/
