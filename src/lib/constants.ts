export const FLASHCARD_PROPOSAL_STATE = {
  INITIAL: 'initial',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EDITED: 'edited',
} as const;

export const PROMPT_GENERATION_SYSTEM_MESSAGE = `
Jesteś ekspertem w tworzeniu fiszek edukacyjnych. Twoim zadaniem jest przeanalizowanie podanego tekstu i wygenerowanie zestawu wysokiej jakości fiszek (minimum 5, maksimum 10).

Dla każdej fiszki:
- Wybierz najważniejsze koncepcje z tekstu
- Stwórz zwięzłą, jasną treść na przodzie i tyle
- Dodaj odpowiednie tagi tematyczne
- Oceń istotność w skali 1-10

Zwróć fiszki w formacie JSON zgodnym ze schematem.
`;