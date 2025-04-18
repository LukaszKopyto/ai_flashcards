# Status implementacji widoku Generowanie Fiszek

## Zrealizowane kroki

1. Aktualizacja typów

   - Dodano `isAccepted` do typu `ProposalFlashcardDto` w `types.ts`
   - Usunięto redundantny typ `FlashcardWithAcceptance` z komponentów

2. Aktualizacja komponentu `FlashcardsPreviewList.vue`

   - Zmieniono interfejs Props do używania `ProposalFlashcardDto`
   - Zastąpiono callbacki emitami zdarzeń
   - Zaktualizowano przekazywanie zdarzeń do komponentu `FlashcardCard`

3. Aktualizacja komponentu `FlashcardCard.vue`

   - Dodano zieloną obwódkę dla zaakceptowanych fiszek
   - Zmieniono pozycję i rozmiar ikony akceptacji
   - Zmodyfikowano widoczność przycisków w zależności od stanu akceptacji
   - Poprawiono generowanie kluczy dla tagów
   - Dodano płynne przejścia dla zmian stanu

4. Aktualizacja komponentu `GeneratePage.vue`
   - Zaktualizowano typy i referencje
   - Uproszczono inicjalizację listy fiszek

## Kolejne kroki

1. Implementacja funkcjonalności masowego zapisu (Bulk Save)

   - Dodanie przycisku do zapisu wszystkich zaakceptowanych fiszek
   - Implementacja logiki wysyłania wielu fiszek do API

2. Implementacja dodania manulanie fiszki

   - dodanie nowej fiszki powinno odbywać sie w oknie dialogowym tak jak edycja istniejącej

3. Dodanie systemu powiadomień dla operacji masowych

   - Informacja o liczbie zapisanych fiszek
   - Obsługa błędów przy zapisie wielu fiszek

4 .Dodanie potwierdzenia przed odrzuceniem fiszki
