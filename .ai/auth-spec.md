# Specyfikacja modułu autentykacji w aplikacji AI Flashcards

## 1. Architektura interfejsu użytkownika

### a. Strony i Layouty

- Utworzenie dedykowanych stron:
  - `/register` – strona rejestracji użytkownika
  - `/login` – strona logowania
  - `/forgot-password` – strona odzyskiwania hasła
- Wprowadzenie lub rozszerzenie layoutów w folderze `./src/layouts`:
  - `AuthLayout.astro` – layout dla stron związanych z autoryzacją, zawierający m.in. elementy nawigacyjne oraz mechanizm przekierowania w przypadku braku uwierzytelnienia.
  - Dla stron publicznych wykorzystanie istniejącego layoutu, natomiast strony, do których dostęp powinien mieć tylko zalogowany użytkownik, będą renderowane z dodatkową warstwą ochronną.

### b. Komponenty Vue i Formularze

- Utworzenie osobnych komponentów Vue dla formularzy:
  - `RegisterForm.vue` – formularz rejestracji, zawierający pola: email, hasło oraz powtórzenie hasła.
  - `LoginForm.vue` – formularz logowania, zawierający pola: email i hasło.
  - `ForgotPasswordForm.vue` – formularz odzyskiwania hasła, umożliwiający wpisanie adresu email.
- Komponenty te znajdą się w folderze `./src/components/ui` lub `./src/components` w zależności od kontekstu użycia.
- Każdy formularz będzie odpowiedzialny za:
  - Kliencką walidację pól (np. sprawdzenie formatu email, wymagalność pól i minimalną długość hasła) za pomocą zod.
  - Wysyłanie danych do odpowiednich endpointów API z wykorzystaniem fetch lub dedykowanego serwisu HTTP.
  - Wyświetlanie komunikatów błędów – zarówno tych zwracanych przez backend (np. niepoprawne dane logowania, istniejący już adres email przy rejestracji), jak i komunikatów wynikających z walidacji po stronie klienta.

### c. Integracja z Nawigacją i Akcjami Użytkownika

- Komponenty Vue będą osadzone w stronach Astro, umożliwiając płynne przejście między trybem auth a non-auth.
- Mechanizm nawigacji:
  - Po pomyślnej rejestracji/logowaniu użytkownik zostanie przekierowany do strony głównej aplikacji (np. `/generates` lub innej chronionej strony).
  - W przypadku wystąpienia błędów, użytkownik pozostanie na bieżącej stronie, a komponent wyświetli odpowiedni komunikat.
- Obsługa stanów loadingu, błędów i sukcesu przy asynchronicznych akcjach, takich jak wysyłka formularza czy komunikacja z API.

### d. Scenariusze Walidacji i Komunikatów Błędów

- Walidacja na poziomie klienta:
  - Sprawdzanie wypełnienia pól, prawidłowy format email, zgodność haseł (w rejestracji).
  - Informacyjne komunikaty w przypadku niewypełnienia lub błędnego wypełnienia pól.
- Walidacja na poziomie backendu:
  - Dodatkowa walidacja danych wejściowych.
  - Obsługa wyjątków i zwracanie odpowiednich kodów statusu oraz komunikatów, które są wyświetlane przez komponenty Vue.

## 2. Logika Backendowa

### a. Endpointy API

- Struktura endpointów w folderze `./src/pages/api/auth/`:
  - `register.ts` – endpoint rejestracji użytkownika, integrujący się z Supabase Auth (wywołanie `signUp`).
  - `login.ts` – endpoint logowania, wywołanie `signIn` w Supabase.
  - `logout.ts` – endpoint wylogowywania, wywołanie `signOut` w Supabase.
  - `forgot-password.ts` – endpoint inicjujący proces resetu hasła poprzez wysyłkę maila z linkiem resetującym.

### b. Modele Danych i Walidacja

- Dane przesyłane z formularzy (email, password) będą walidowane przy pomocy mechanizmu walidacji (biblioteka Zod).
- Modele danych odwołują się do struktury użytkowników w Supabase. Nie jest wymagane utrzymanie dodatkowych modeli w bazie, gdyż Supabase Auth zarządza danymi użytkowników.
- W przypadku nieprawidłowych danych, endpoint zwróci czytelny komunikat błędu wraz z odpowiednim kodem HTTP.

### c. Obsługa Wyjątków i Bezpieczeństwo

- Mechanizm try-catch w endpointach API, aby wychwycić nieoczekiwane błędy.
- Logowanie błędów na serwerze.
- Zabezpieczenie endpointów przez autoryzację – dostęp do niektórych zasobów możliwy tylko przy ważnej sesji użytkownika.

### d. Aktualizacja Renderowania Stron Server-side

- Wykorzystanie Astro middleware (np. w `./src/middleware/index.ts`) do weryfikacji autentykacji na poziomie serwera.
- Strony wymagające autoryzacji będą sprawdzane pod kątem istnienia sesji użytkownika (np. poprzez ciasteczka zawierające token Supabase).
- W oparciu o konfigurację w `astro.config.mjs` integracja Vue i Astro pozostaje spójna, zapewniając płynne przejście między trybem renderowania server-side a client-side.

## 3. System Autentykacji

### a. Integracja z Supabase Auth

- Wykorzystanie Supabase Auth jako systemu do:
  - Rejestracji użytkowników: wywołanie metody `signUp`, walidacja email oraz hasła, opcjonalne potwierdzenie adresu email.
  - Logowania: wywołanie metody `signIn`, weryfikacja poprawności danych logowania.
  - Wylogowywania: wywołanie metody `signOut` i usunięcie tokena sesyjnego.
  - Odzyskiwania hasła: wysłanie emaila z linkiem resetującym hasło za pomocą dedykowanego endpointu `forgot-password.ts`.
- Przechowywanie sesji:
  - Utrzymywanie aktualnej sesji użytkownika poprzez ciasteczka zgodnie z najlepszymi praktykami.
  - Middleware Astro dokona weryfikacji, czy sesja jest obecna przy próbie dostępu do chronionych zasobów.

### b. Bezpieczeństwo i Prywatność

- Dane użytkowników oraz fiszek są dostępne tylko po udanej autoryzacji.
- Mechanizmy middleware i endpointy API zapewniają, że dostęp do danych odbywa się tylko w ramach poprawnie uwierzytelnionych sesji.
- Bezpieczne przechowywanie haseł oraz wrażliwych informacji przy wsparciu Supabase.

## Podsumowanie

- Nowa architektura modułu autentykacji integruje warstwę frontendową (Astro + Vue) oraz backendową logikę opartą na API, zachowując spójność z istniejącą strukturą aplikacji.
- Wykorzystanie Supabase Auth gwarantuje wysokie standardy bezpieczeństwa, skalowalność oraz prostotę implementacji procesów rejestracji, logowania i odzyskiwania hasła.
- Rozwiązanie zapewnia odpowiednią obsługę błędów, walidację danych oraz mechanizmy ochrony zasobów, co spełnia wymagania US-001, US-002 oraz US-009 z dokumentu PRD.
