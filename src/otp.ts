import promptPromise from 'prompt-promise';

export enum Messages {
  PROMPT = 'NPM 2-factor auth code: ',
  HELP = 'Two-factor auth is required to publish.',
}

// Hat-tip: https://github.com/facebook/react/blob/master/scripts/release/publish-commands/prompt-for-otp.js.
// TODO (Tane): This'll be nice to do at some point: https://github.com/facebook/react/blob/master/scripts/release/theme.js.
export const prompt = async () => {
  while (true) {
    const otp = await promptPromise(Messages.PROMPT);
    promptPromise.done();

    if (otp) {
      return otp;
    } else {
      console.log(Messages.HELP);
    }
  }
};
