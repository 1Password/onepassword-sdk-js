// An (asynchronously) iterable object to be returned by listing operations.
export class SdkList<T> implements AsyncIterable<T> {
  // Constructor
  public constructor(private readonly elements: T[]) {}

  public [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.asyncIterator();
  }

  private async *asyncIterator(): AsyncIterator<T> {
    for (const element of this.elements) {
      yield element;
    }
  }
}
