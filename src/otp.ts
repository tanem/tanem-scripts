import promptPromise from 'prompt-promise';

// Hat-tip: https://github.com/facebook/react/blob/master/scripts/release/publish-commands/prompt-for-otp.js.
// TODO (Tane): This'll be nice to do at some point: https://github.com/facebook/react/blob/master/scripts/release/theme.js.
export const prompt = async () => {
  while (true) {
    const otp = await promptPromise('NPM 2-factor auth code: ');
    promptPromise.done();

    if (otp) {
      return otp;
    } else {
      console.log('Two-factor auth is required to publish.');
    }
  }
};
