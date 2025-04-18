# Architektura UI dla AI Flashcards

## 1. Przegląd struktury UI

Architektura UI dla AI Flashcards została zaprojektowana, aby efektywnie spełniać wymagania produktu, integrację z API oraz zapewnić doskonałe doświadczenie użytkownika. Projekt podzielony jest na publiczne widoki (logowanie, rejestracja) oraz prywatne widoki dostępne tylko dla zalogowanych użytkowników, takie jak widok generowania fiszek, przegląd fiszek oraz Profile. Interfejs opiera się na tailwind dla responsywności, a bezpieczeństwo zapewnia przechowywanie tokena w ciasteczkach z odpowiednimi flagami. Całość jest zgodna ze standardami dostępności WCAG AA.

## 2. Lista widoków

- **Login / Rejestracja**

  - **Ścieżka widoku:** `/login`, `/register`
  - **Główny cel:** Umożliwienie użytkownikom uwierzytelnienia i rejestracji.
  - **Kluczowe informacje:** Formularze logowania i rejestracji, komunikaty o błędach wyświetlane inline.
  - **Kluczowe komponenty:** Formularze, pola input, przyciski, elementy walidacji.
  - **UX, dostępność i względy bezpieczeństwa:** Intuicyjne formularze z czytelnymi komunikatami, dostępne dla czytników ekranu, zabezpieczenia dla przesyłania danych.

- **Generowanie fiszek**

  - **Ścieżka widoku:** `/generate`
  - **Główny cel:** Umożliwienie użytkownikom wprowadzania tekstu, generowania i edycji fiszek.
  - **Kluczowe informacje:** Duże pole tekstowe do wprowadzania tekstu, sekcja podglądu wygenerowanych fiszek, opcje edycji za pomocą modalu, zatwierdzania oraz bulk saving.
  - **Kluczowe komponenty:** Formularze, modal edycji, przyciski akcji, system powiadomień (toast).
  - **UX, dostępność i względy bezpieczeństwa:** Wyraźny podział na sekcje, intuicyjne komunikaty błędów (inline dla formularzy, toast dla błędów API), pełna responsywność, obsługa klawiatury.

- **Przegląd fiszek**

  - **Ścieżka widoku:** `/flashcards`
  - **Główny cel:** Prezentacja listy zapisanych fiszek i umożliwienie zarządzania nimi.
  - **Kluczowe informacje:** Lista fiszek użytkownika, szczegóły fiszek, opcje edycji lub usunięcia.
  - **Kluczowe komponenty:** Tabele/listy, przyciski akcji, filtry wyszukiwania.
  - **UX, dostępność i względy bezpieczeństwa:** Szybkie wyszukiwanie i filtrowanie, czytelny interfejs, zgodność z WCAG AA.

- **Profile**
  - **Ścieżka widoku:** `/profile`
  - **Główny cel:** Zarządzanie informacjami o koncie użytkownika, edycja danych konta i wylogowanie.
  - **Kluczowe informacje:** Formularz edycji konta, ustawienia konta, przycisk wylogowania.
  - **Kluczowe komponenty:** Formularze, pola input, przyciski, system powiadomień.
  - **UX, dostępność i względy bezpieczeństwa:** Intuicyjny interfejs, zgodny z WCAG AA, łatwa nawigacja, zabezpieczenia dla operacji na koncie.

## 3. Mapa podróży użytkownika

1. Użytkownik trafia na widok logowania lub rejestracji.
2. Po skutecznym logowaniu/rejestracji, użytkownik zostaje przekierowany do widoku generowania fiszek.
3. W widoku generowania fiszek użytkownik wprowadza tekst, inicjuje proces generacji, a następnie przegląda i edytuje wygenerowane fiszki.
4. Użytkownik może z poziomu menu wybrać widok przeglądu fiszek, gdzie zarządza swoimi fiszkami (edycja, usuwanie).
5. Z menu dostępny jest również widok Profile, gdzie użytkownik może zarządzać informacjami o koncie, m.in. edytować dane konta oraz się wylogować.

## 4. Układ i struktura nawigacji

- **Główna nawigacja:** Widoczna w nagłówku po zalogowaniu, zawiera odnośniki do widoku generowania fiszek, przeglądu fiszek oraz Profile.
- **Menu boczne/pasek boczny:** Umożliwia szybką nawigację między kluczowymi widokami.
- **Publiczne widoki:** Logowanie i rejestracja, dostępne bez głównej nawigacji, z prostym layoutem nawigacyjnym.
- **Mechanizmy przechodzenia:** Proste linki i przyciski umożliwiające płynne przejścia między widokami, z uwzględnieniem animacji i płynnych przejść tam, gdzie to możliwe.

## 5. Kluczowe komponenty

- **Formularze logowania/rejestracji:** Z walidacją inline, przyjazne dla użytkownika, zabezpieczające dane.
- **Komponent edycji inline:** Umożliwia bezpośrednią edycję treści fiszek bez przeładowania strony.
- **Komponent listy/tabeli:** Prezentacja fiszek w formie listy, z funkcjami sortowania i filtrowania.
- **System powiadomień (toast):** Do wyświetlania błędów API oraz komunikatów o akcjach wykonanych przez użytkownika.
- **Przyciski bulk saving:** Umożliwiają zbiorcze zapisywanie zmian, upraszczając operacje na wielu fiszkach naraz.
