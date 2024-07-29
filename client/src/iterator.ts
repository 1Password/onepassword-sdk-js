// An (asynchronously) iterable object to be returned by listing operations.
export class OpList<T> implements AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncIterator<T> {
    return new OpIterator<T>(this.elements);
  }

  // Constructor
  constructor(private elements: T[]) {}
}

// (Asynchronous) Iterator to be used for listing operations.
class OpIterator<T> implements AsyncIterator<T> {
  // Constructor
  constructor(private elements: T[]) {
    this.#index = 0;
    this.#end = elements.length;
  }

  // Keeping track of the iterations.
  #index: number;
  #end: number;

  // Returns a promise of the next element.
  next(): Promise<IteratorResult<T>> {
    if (this.#index == this.#end) {
      return Promise.resolve({
        done: true,
        value: undefined,
      });
    } else {
      let e = this.elements[this.#index++];
      return Promise.resolve({
        done: false,
        value: e,
      });
    }
  }
}
