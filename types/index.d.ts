import { Polly } from '@pollyjs/core';

declare global {
  // The jasmine & jest globals are incompatible, so just the types required for
  // this library have been yanked from @types/jasmine.
  namespace jasmine {
    interface CustomReporterResult {
      fullName: string;
    }

    interface CustomReporter {
      specStarted?(result: CustomReporterResult): void;
    }

    interface Env {
      addReporter(reporter: CustomReporter): void;
    }

    let fullName: string;
    function getEnv(): Env;
  }

  namespace NodeJS {
    interface Global {
      polly: Polly;
    }
  }
}
