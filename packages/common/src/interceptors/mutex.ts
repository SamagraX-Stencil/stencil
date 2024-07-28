export class Mutex {
    private mutex: Promise<void> = Promise.resolve();
  
    lock(): PromiseLike<() => void> {
      let begin: (unlock: () => void) => void = (unlock) => {};
  
      this.mutex = this.mutex.then(() => new Promise(begin));
  
      return new Promise((res) => {
        begin = res;
      });
    }
  }
  