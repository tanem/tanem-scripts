const path = require('path');
const { Polly } = require('@pollyjs/core');
const { setupPolly } = require('setup-polly-jest');
const NodeHttpAdapter = require('@pollyjs/adapter-node-http');
const FSPersister = require('@pollyjs/persister-fs');

class CustomFSPersister extends FSPersister {
  // @ts-ignore
  static get name() {
    return 'custom-fs';
  }

  // @ts-ignore
  saveRecording(recordingId, data) {
    this.api.saveRecording(
      recordingId,
      JSON.parse(this.stringify(data).replace(/"token.*?"/g, '"<redacted>"'))
    );
  }
}

Polly.register(NodeHttpAdapter);
Polly.register(CustomFSPersister);

setupPolly({
  adapters: ['node-http'],
  persister: 'custom-fs',
  persisterOptions: {
    'custom-fs': {
      recordingsDir: path.resolve(process.cwd(), 'test', '__recordings__')
    }
  }
});
