/* eslint-disable @typescript-eslint/ban-ts-ignore */

import NodeHttpAdapter from '@pollyjs/adapter-node-http';
import { Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import path from 'path';
import { setupPolly } from 'setup-polly-jest';

class CustomFSPersister extends FSPersister {
  // @ts-ignore
  static get name() {
    return 'custom-fs';
  }

  // @ts-ignore
  saveRecording(recordingId, data) {
    // @ts-ignore
    this.api.saveRecording(
      recordingId,
      // @ts-ignore
      JSON.parse(this.stringify(data).replace(/"token.*?"/g, '"<redacted>"'))
    );
  }
}

Polly.register(NodeHttpAdapter);
Polly.register(CustomFSPersister);

setupPolly({
  adapters: ['node-http'],
  matchRequestsBy: {
    headers: false
  },
  persister: 'custom-fs',
  persisterOptions: {
    'custom-fs': {
      recordingsDir: path.resolve(process.cwd(), 'test', '__recordings__')
    }
  },
  recordIfMissing: false
});
