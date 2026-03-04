
/**
 * Defines an insterion error.
 */
export class InsertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsertionError';
  }
}
