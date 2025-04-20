# Plan Wdrożenia Usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter umożliwia integrację z API OpenRouter w celu uzupełnienia funkcjonalności czatów opartych na modelach językowych (LLM). Usługa odpowiada za:

1. Komunikację z API OpenRouter przez dedykowany API Client, który zarządza wysyłaniem żądań i odbieraniem odpowiedzi.
2. Formatowanie komunikatów, gdzie kluczowymi elementami są:
   - Komunikat systemowy – stały komunikat definiujący kontekst działania (np. "You are an AI assistant specialized in flashcards generation.")
   - Response format – schemat odpowiedzi określony jako:
     `{ type: 'json_schema', json_schema: { name: 'flashcard_response', strict: true, schema: { card: "string", relevance: "number" } } }`
   - Nazwa modelu – np. "gpt-4"
   - Parametry modelu – np. `{ max_tokens: 200 }`
3. Walidację oraz parsowanie odpowiedzi API przy użyciu zdefiniowanego schematu JSON.

## 2. Opis konstruktora

Konstruktor usługi przyjmie konfigurację obejmującą:

- Klucz API do autoryzacji przy komunikacji z OpenRouter
- Domyślne ustawienia modelu: nazwa modelu i parametry (max_tokens)
- Domyślny komunikat systemowy

Konstruktor inicjalizuje:

- API Client – do obsługi żądań HTTP
- Message Formatter – do przygotowywania payload zawierającego system message, response_format, nazwę modelu oraz parametry modelu
- Response Parser – do weryfikacji i mapowania odpowiedzi z API
- Error Handler – do centralnej obsługi błędów

## 3. Publiczne metody i pola

### Publiczne metody:

1. `sendChatMessage(userMessage: string): Promise<Response>`
   - Przyjmuje wiadomość użytkownika, przygotowuje payload, wysyła żądanie do OpenRouter API, przetwarza odpowiedź i zwraca wynik.
2. `setModelConfig(config: ModelConfig): void`
   - Umożliwia aktualizację bieżącej konfiguracji modelu (nazwa modelu i parametry modelu).
3. `getLastResponse(): Response`
   - Zwraca ostatnio otrzymaną odpowiedź od API.

### Publiczne pola:

- `currentModelConfig` – przechowuje bieżącą konfigurację modelu.
- `lastAPIResponse` – bufor ostatniej odpowiedzi API dla celów debugowania i odwołań.

## 4. Prywatne metody i pola

### Prywatne metody:

1. `preparePayload(userMessage: string): Payload`
   - Łączy stały komunikat systemowy, dynamiczny komunikat użytkownika, response_format (np. `{ type: 'json_schema', json_schema: { name: 'flashcard_response', strict: true, schema: { card: "string", relevance: "number" } } }`), nazwę modelu oraz parametry modelu w jeden obiekt payload.
2. `parseResponse(rawResponse: any): ParsedResponse`
   - Waliduje strukturę otrzymanej odpowiedzi na podstawie zdefiniowanego schematu JSON i zwraca sparsowane dane.
3. `logError(error: any): void`
   - Centralizowany mechanizm logowania błędów, który zapisuje szczegóły błędu oraz informuje użytkownika o problemach.

### Prywatne pola:

- `apiClient` – instancja klienta HTTP do komunikacji z API OpenRouter.
- `internalConfig` – przechowuje wewnętrzne ustawienia i konfigurację usługi.

## 5. Obsługa błędów

### Potencjalne scenariusze błędów i proponowane rozwiązania:

1. **Błąd połączenia sieciowego**

   - _Wyzwanie:_ Brak dostępu do API z powodu problemów sieciowych.
   - _Rozwiązanie:_ Implementacja mechanizmu retry z wykorzystaniem exponential backoff.

2. **Błąd autoryzacji**

   - _Wyzwanie:_ Niepoprawny lub wygasły klucz API.
   - _Rozwiązanie:_ Weryfikacja klucza przed wysłaniem żądania i informowanie użytkownika o konieczności aktualizacji klucza.

3. **Błąd walidacji odpowiedzi**

   - _Wyzwanie:_ Odpowiedź nie zgadza się ze schematem `response_format`.
   - _Rozwiązanie:_ Użycie bibliotek walidujących JSON i zwrócenie szczegółowego komunikatu błędu.

4. **Timeout żądania API**

   - _Wyzwanie:_ Zbyt długi czas oczekiwania na odpowiedź z API.
   - _Rozwiązanie:_ Konfiguracja odpowiedniego timeoutu oraz mechanizmu retry.

5. **Błąd przetwarzania odpowiedzi**
   - _Wyzwanie:_ Problemy przy mapowaniu lub parsowaniu odpowiedzi.
   - _Rozwiązanie:_ Centralny mechanizm obsługi błędów logujący szczegóły problemu oraz zwracający przyjazny użytkownikowi komunikat.

## 6. Kwestie bezpieczeństwa

- **Bezpieczne przechowywanie kluczy API:** Użycie mechanizmów środowiskowych (np. zmiennych środowiskowych) do przechowywania kluczy zamiast twardego kodowania.
- **Walidacja i sanitizacja danych wejściowych:** Zapewnienie, że dane przekazywane przez użytkownika nie zawierają szkodliwych treści.
- **Ograniczenie liczby żądań (rate limiting):** Zapobieganie nadużyciom przez wdrożenie mechanizmu rate limiting.
- **Szyfrowanie komunikacji:** Upewnienie się, że wszystkie komunikaty są przesyłane przez bezpieczne połączenie HTTPS.

## 7. Plan wdrożenia krok po kroku

1. **Struktura projektu:**

   - Utworzenie nowego modułu usługi w katalogu `./src/lib/openrouter`.

2. **Implementacja konstruktora:**

   - Inicjalizacja API Client, Message Formatter, Response Parser oraz Error Handler.
   - Załadowanie konfiguracji domyślnej (klucz API, domyślna konfiguracja modelu, komunikat systemowy).

3. **Implementacja metody `preparePayload`:**

   - Scalenie komunikatu systemowego (np. "You are an AI assistant specialized in flashcards generation."), komunikatu użytkownika, response_format, nazwy modelu (np. "gpt-4") i parametrów modelu (np. `{ max_tokens: 200, temperature: 0.7, top_p: 0.9 }`).

4. **Implementacja metody `sendChatMessage`:**

   - Wywołanie metody `preparePayload` w celu przygotowania żądania.
   - Wysłanie żądania do API OpenRouter poprzez API Client.
   - Obsługa odpowiedzi przez metodę `parseResponse`.
   - Implementacja logiki retry oraz obsługi timeoutu.

5. **Implementacja metody `parseResponse`:**

   - Walidacja otrzymanej odpowiedzi względem schematu JSON zdefiniowanego w response_format.
   - Mapowanie danych do struktury używanej w aplikacji.

6. **Implementacja mechanizmów retry i logowania błędów:**

   - Zaimplementowanie funkcji `retryRequest` z mechanizmem exponential backoff.
   - Centralne logowanie błędów przez `logError` w celu łatwiejszego debugowania i monitorowania.
