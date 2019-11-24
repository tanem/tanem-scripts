// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    function getEnv(): Env;

    let fullName: string;
  }

  namespace NodeJS {
    interface Global {
      polly: Polly;
    }
  }
}
