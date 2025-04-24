# Plan testów

## 1. Wprowadzenie i cele testowania

Celem testowania jest zapewnienie, że aplikacja do generowania fiszek opartych na AI działa zgodnie z wymaganiami funkcjonalnymi i niefunkcjonalnymi. Testy mają za zadanie:

- Weryfikację poprawności przekształcania tekstu wejściowego w fiszki.
- Zapewnienie stabilności, responsywności i bezpieczeństwa interfejsu użytkownika.
- Sprawdzenie poprawności integracji między frontendem (Astro, Vue, shadcn-vue) a backendem (Supabase, API).
- Identyfikację krytycznych błędów oraz problemów z wydajnością i dostępnością.

## 2. Zakres testów

Testy obejmują:

- **Frontend:**
  - Strony i komponenty Astro.
  - Interaktywne komponenty Vue oraz elementy UI oparte na shadcn-vue.
  - Stylowanie za pomocą Tailwind.
- **Backend:**
  - API endpoints zlokalizowane w `src/pages/api`.
  - Integrację z bazą danych Supabase.
  - Komunikację z usługą AI (Openrouter.ai) oraz obsługę limitów API.
- **Integracja:** Testy przepływu danych między frontendem i backendem.
- **Wydajność i bezpieczeństwo:** Ocena szybkości działania, testy obciążeniowe oraz zabezpieczeń aplikacji.

## 3. Typy testów

- **Testy jednostkowe:** Weryfikacja pojedynczych funkcji i komponentów, np. walidacja danych wejściowych, logika tworzenia fiszek.
- **Testy integracyjne:** Sprawdzenie poprawności interakcji między poszczególnymi modułami (np. współpraca API z Supabase i usługą AI).
- **Testy end-to-end (E2E):** Symulacja pełnego przepływu użytkownika – od wprowadzenia tekstu, przez generowanie fiszek, po wyświetlanie wyników.
- **Testy wydajnościowe:** Pomiar czasu odpowiedzi aplikacji oraz testy obciążeniowe.
- **Testy użyteczności i dostępności:** Ocena intuicyjności interfejsu oraz zgodności z wytycznymi dostępności.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

- **Generowanie fiszek:**
  - Weryfikacja poprawności przekształcania wprowadzonego tekstu w fiszki.
  - Testy przypadków poprawnych oraz niekompletnych lub błędnych danych wejściowych.
  - Sprawdzenie mechanizmu obsługi limitowania zapytań do usługi AI.
- **Interfejs użytkownika:**
  - Sprawdzenie poprawnego renderowania komponentów Astro i Vue.
  - Test responsywności na różnych urządzeniach i przeglądarkach.
  - Weryfikacja interaktywności i doświadczenia użytkownika.
- **API i backend:**
  - Testy komunikacji między frontendem a API (w `src/pages/api`).
  - Weryfikacja poprawności operacji na bazie danych Supabase.
  - Testy obsługi błędów (np. niepoprawne zapytania, awarie usług zewnętrznych).
- **Bezpieczeństwo i wydajność:**
  - Testy obciążeniowe w celu oceny wydajności aplikacji.
  - Weryfikacja zabezpieczeń przed typowymi atakami (np. XSS, SQL Injection).

## 5. Środowisko testowe

- **Środowisko deweloperskie:**
  - Lokalna instancja aplikacji dla szybkich iteracji i testów jednostkowych/integracyjnych.
- **Środowisko staging:**
  - Pełna symulacja produkcji dla przeprowadzenia testów end-to-end oraz wydajnościowych.
- **Środowisko produkcyjne:**
  - Monitorowanie aplikacji oraz testy regresji w działającym systemie.

## 6. Narzędzia do testowania

- **Testy jednostkowe i integracyjne:**
  - Vitest (Vitest rekomendowany dla szybszych testów i lepszej integracji z Vite/Astro).
  - Vue Test Utils z Testing Library (dla komponentów Vue).
  - MSW (Mock Service Worker) do mockowania żądań API w testach integracyjnych.
- **Testy end-to-end (E2E):**
  - Playwright (rekomendowany dla wieloprzeglądarkowego testowania, lepszej izolacji testów i stabilniejszych wyników).
- **Testy wydajnościowe i dostępności:**
  - Lighthouse, PageSpeed Insights, WebPageTest.
  - k6 do testów obciążeniowych.
  - Axe lub Pa11y do testów dostępności.
- **Inne narzędzia:**
  - Supertest do testowania API w środowisku Node.js.
  - GitHub Actions do podstawowej automatyzacji testów
  - Narzędzia monitorujące: Sentry oraz OpenTelemetry + Grafana do kompleksowego monitoringu.

## 7. Harmonogram testów

- **Testy jednostkowe:** Uruchamiane przy każdym commicie i pull request.
- **Testy integracyjne:** Przeprowadzane przy łączeniu nowych funkcjonalności oraz w ramach cyklicznych buildów na środowisku staging.
- **Testy end-to-end (E2E):** Wykonywane przy wdrożeniach do środowiska staging oraz przed wdrożeniem na produkcję.
- **Testy wydajnościowe:** Przeprowadzane cyklicznie (np. co sprint) oraz przed większymi wdrożeniami.
- **Testy bezpieczeństwa:** Przeprowadzane przy wprowadzaniu istotnych zmian w kodzie i konfiguracjach.

## 8. Kryteria akceptacji testów

- Wszystkie testy jednostkowe, integracyjne i E2E muszą zakończyć się sukcesem na etapie CI/CD.
- Czas odpowiedzi API oraz czas ładowania strony nie mogą przekraczać ustalonych limitów.
- Brak krytycznych błędów wpływających na funkcjonalność i bezpieczeństwo aplikacji.
- Zgodność z wymaganiami funkcjonalnymi i specyfikacją UI/UX.
- Osiągnięcie określonych wskaźników dostępności w testach Axe/Pa11y.

## 9. Role i odpowiedzialności

- **Inżynierowie QA:** Opracowanie, wdrożenie i uruchamianie testów, analiza wyników.
- **Deweloperzy:** Utrzymywanie oraz aktualizacja testów, naprawa wykrytych błędów.
- **Menedżer produktu:** Definiowanie kryteriów akceptacji oraz weryfikacja zgodności funkcjonalności z wymaganiami.
- **DevOps:** Integracja testów w pipeline CI/CD oraz monitorowanie środowisk testowych i produkcyjnych.

## 10. Procedury raportowania błędów

- Raportowanie błędów odbywać się będzie za pomocą systemu ticketowego (np. Jira, GitHub Issues).
- Każdy zgłoszony błąd powinien zawierać:
  - Dokładny opis problemu.
  - Kroki reprodukcji błędu.
  - Zrzuty ekranu oraz logi systemowe (jeśli dostępne).
  - Informację dotyczącą stopnia wpływu na użytkownika (priorytet).
- Po zgłoszeniu błąd zostanie sklasyfikowany (blokujący, wysoki, średni, niski) i przydzielony do odpowiedniego członka zespołu.
- Regularne spotkania zespołu QA i deweloperów w celu przeglądu zgłoszonych błędów i ustalenia planu działania.
