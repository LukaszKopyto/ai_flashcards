export const FLASHCARD_PROPOSAL_STATE = {
  INITIAL: 'initial',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EDITED: 'edited',
} as const;

// Type helper to get the values of the constant
export type ValueOf<T> = T[keyof T]; 