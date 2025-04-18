# Plan implementacji widoku Generowanie fiszek

## 1. Przegląd

Widok generowania fiszek umożliwia użytkownikowi wprowadzenie tekstu (1000-10000 znaków), uruchomienie procesu generowania propozycji fiszek poprzez API oparte na LLM, a następnie przegląd, edycję, zatwierdzanie lub odrzucanie zaproponowanych fiszek. Celem jest automatyzacja procesu tworzenia wysokiej jakości fiszek.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką `/generate`.

## 3. Struktura komponentów

- **GeneratePage** (strona główna i kontener)
  - **TextInputArea** – duże pole tekstowe dla inputu użytkownika.
  - **GenerationButton** – przycisk uruchamiający generowanie propozycji.
  - **FlashcardsPreviewList** – lista wyświetlająca wygenerowane propozycje fiszek.
    - **FlashcardCard** – pojedyncza karta fiszki z opcjami: zatwierdź, edytuj, odrzuć.
  - **EditModal** – modal służący do edycji wybranej fiszki.
  - **NotificationToast** – system powiadomień dla komunikacji z użytkownikiem (błędy, sukces).

## 4. Szczegóły komponentów

### GeneratePage

- Opis: Główny kontener widoku `/generate` zarządzający stanem całej strony.
- Główne elementy: pole tekstowe, przycisk generowania, lista fiszek, przycisk bulk saving.
- Obsługiwane interakcje: wysłanie API po kliknięciu przycisku, aktualizacja stanu wpisanego tekstu, zarządzanie stanem listy fiszek.
- Warunki walidacji: Sprawdzenie, czy tekst mieści się w zakresie 1000-10000 znaków.
- Typy: GenerationRequest, GenerationResponse, FlashcardProposal.
- Propsy: Opcjonalne ustawienia inicjalne.

### TextInputArea

- Opis: Komponent zawierający duży textarea do wprowadzania tekstu.
- Główne elementy: textarea, komunikat walidacyjny.
- Obsługiwane interakcje: onInput – aktualizacja stanu tekstu, walidacja długości.
- Warunki walidacji: Minimalnie 1000 i maksymalnie 10000 znaków.
- Typy: string (dla inputu).
- Propsy: Wartość tekstu, funkcja callback przy zmianie.

### GenerationButton

- Opis: Przycisk, który po kliknięciu inicjuje wywołanie API generacji.
- Główne elementy: przycisk z etykietą "Generuj".
- Obsługiwane interakcje: onClick – wywołanie funkcji generowania.
- Warunki walidacji: Aktywowany tylko, gdy input spełnia kryteria długości.
- Typy: Brak custom typów.
- Propsy: Callback onClick, stan ładowania (disabled w trakcie generowania).

### FlashcardsPreviewList

- Opis: Lista wyświetlająca propozycje fiszek.
- Główne elementy: Kolekcja komponentów FlashcardCard.
- Obsługiwane interakcje: Przekazywanie akcji akceptacji, edycji, odrzucenia do rodzica.
- Warunki walidacji: Weryfikacja istnienia listy fiszek.
- Typy: Array of FlashcardProposal.
- Propsy: Lista fiszek, callbacki na akcje (accept, edit, reject).

### FlashcardCard

- Opis: Pojedyncza karta fiszki wyświetlająca tytuł, przód, tył i tagi.
- Główne elementy: Tekst (tytuł, front, back), przyciski akcji (Akceptuj, Edytuj, Odrzuć).
- Obsługiwane interakcje: onAccept, onEdit (otwarcie modalu), onReject (usunięcie z listy).
- Warunki walidacji: Dane muszą być zgodne z typami API.
- Typy: FlashcardProposal.
- Propsy: Obiekt fiszki, callbacki dla akcji.

### EditModal

- Opis: Modal umożliwiający edycję szczegółów fiszki.
- Główne elementy: Formularz edycji (inputy dla tytułu, frontu, backu i tagów), przyciski zapisu i anulowania.
- Obsługiwane interakcje: onSubmit – zapisanie zmienionych danych, onCancel – zamknięcie modalu.
- Warunki walidacji: Tytuł – niepusty; Front – do 200 znaków; Back – do 500 znaków.
- Typy: FlashcardProposal (widok edycji) oraz lokalny EditViewModel.
- Propsy: Aktualne dane fiszki, funkcje onSubmit oraz onCancel.

### NotificationToast

- Opis: System komunikatów dla użytkownika (błędy, sukcesy).
- Główne elementy: Komponent wyświetlający krótkoterminowe komunikaty.
- Obsługiwane interakcje: Automatyczne pojawianie się i znikanie, możliwość ręcznego zamknięcia.
- Warunki walidacji: Brak – działa jako dodatkowa warstwa informacyjna.
- Typy: NotificationMessage model.
- Propsy: Wiadomość, typ (error, success), czas wyświetlania.

## 5. Typy

- GenerationRequest: StartGenerationCommand
- GenerationResponse: GenerationDto
- FlashcardProposal: ProposalFlashcardDto
- EditViewModel: Omit<ProposalFlashcardDto, 'source'>

## 6. Zarządzanie stanem

Widok będzie korzystał z mechanizmu reactive state management przy użyciu Vue 3 Composition API:

- rawInput: przechowuje wartość tekstu wejściowego.
- isGenerating: boolean określający stan wywołania API.
- generationResponse: obiekt zawierający dane odpowiedzi z API.
- flashcardsList: tablica propozycji fiszek (FlashcardProposal) modyfikowana lokalnie.
- modalVisible: boolean kontrolujący widoczność EditModal.
- currentEditingFlashcard: obiekt fiszki aktualnie edytowany.
  Dodatkowo, możliwe użycie custom hooka/composable do obsługi powiadomień.

## 7. Integracja API

- Wywołanie POST `/generations` przy kliknięciu przycisku "Generuj". Payload: GenerationRequest. Po sukcesie otrzymana odpowiedź (GenerationResponse) aktualizuje stan `flashcardsList`.
- Wywołanie POST `/flashcards` przy akceptacji lub zapisie fiszek. Payload zawiera: title, front (max 200 znaków), back (max 500 znaków), tags, source oraz generation_id jeśli dotyczy.
- Obsługa statusów: 201 (sukces), 400 (błędy walidacji), 500 (błędy serwera).

## 8. Interakcje użytkownika

- Wpisanie tekstu i kliknięcie "Generuj" inicjuje wysyłkę tekstu do API.
- Po otrzymaniu odpowiedzi użytkownik widzi listę propozycji fiszek.
- Kliknięcie "Akceptuj" oznacza fiszkę do zapisu.
- Kliknięcie "Edytuj" otwiera modal do modyfikacji treści fiszki.
- Kliknięcie "Odrzuć" usuwa fiszkę z listy.
- Bulk Save umożliwia zapisanie wszystkich zaakceptowanych fiszek poprzez wywołanie API `/flashcards`.

## 9. Warunki i walidacja

- Tekst wejściowy musi mieć od 1000 do 10000 znaków (walidacja w TextInputArea).
- Podczas edycji: tytuł nie może być pusty, front - maks. 200 znaków, back - maks. 500 znaków.
- Przycisk generowania aktywny jest tylko przy poprawnym input'cie.
- Dane wysyłane do API muszą odpowiadać wymaganym DTO.
- Walidacja za pomocą zod

## 10. Obsługa błędów

- Walidacja tekstu wejściowego wyświetlana inline w komponencie TextInputArea.
- Błędy zwracane przez API (np. 400, 500) wyświetlane są za pomocą NotificationToast.
- W przypadku nieudanego zapisu fiszek, użytkownik otrzymuje odpowiedni komunikat oraz możliwość edycji danych przed ponownym wysłaniem.

## 11. Kroki implementacji

1. Utworzenie strony `/generate` w Astro i skonfigurowanie routingu.
2. Implementacja komponentu GeneratePage z integracją stanu oraz logiki wywołań API.
3. Stworzenie komponentu TextInputArea z walidacją długości wprowadzanego tekstu.
4. Implementacja GenerationButton, który wywołuje API `/generations`.
5. Utworzenie FlashcardsPreviewList oraz FlashcardCard do wyświetlania propozycji fiszek.
6. Implementacja EditModal umożliwiającego edycję wybranej fiszki z odpowiednimi walidacjami.
7. Integracja z API: poprawne wysyłanie żądań do `/generations` i `/flashcards` oraz obsługa odpowiedzi.
8. Dodanie systemu NotificationToast dla komunikatów sukcesu i błędów.
9. Testowanie interakcji użytkownika, walidacji i responsywności widoku.
10. Refaktoryzacja i finalne poprawki UX oraz dostępności.
