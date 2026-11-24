/**
 * A business transaction. work receives the repositories bound to this transaction; if it throws, nothing it wrote is kept
 */
export interface UnitOfWork<R> {
  run<T>(work: (repos: R) => Promise<T>): Promise<T>;
}
