import NodeHttpAdapter from '@pollyjs/adapter-node-http';
import { Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import path from 'path';
import { cache } from '../src/data';

declare global {
  // eslint-disable-next-line no-var
  var polly: InstanceType<typeof Polly>;
}

jasmine.getEnv().addReporter({
  specStarted: (result) => {
    jasmine.fullName = result.fullName;
  },
});

Polly.register(NodeHttpAdapter);
Polly.register(FSPersister);

beforeEach(() => {
  global.polly = new Polly(jasmine.fullName, {
    adapters: ['node-http'],
    matchRequestsBy: {
      headers: false,
    },
    persister: 'fs',
    persisterOptions: {
      fs: {
        recordingsDir: path.resolve(process.cwd(), 'test', '__recordings__'),
      },
    },
    recordIfMissing: false,
  });

  global.polly.server.any().on('beforePersist', (_, recording) => {
    recording.request.headers.map((header: { name: string; value: string }) => {
      if (header.name === 'authorization') {
        header.value = '<token>';
      }
      return header;
    });
  });
});

afterEach(async () => {
  cache.clear();
  await global.polly.stop();
});
