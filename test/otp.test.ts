jest.mock('prompt-promise');

import promptPromise from 'prompt-promise';
import { Messages, prompt as promptForOTP } from '../src/otp';

test('returns otp', async () => {
  ((promptPromise as unknown) as jest.Mock).mockResolvedValue('123');

  const otp = await promptForOTP();

  expect(promptPromise).toHaveBeenCalledTimes(1);
  expect(promptPromise).toHaveBeenCalledWith(Messages.PROMPT);
  expect(otp).toBe('123');
});

test('re-prompts for otp', async () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  ((promptPromise as unknown) as jest.Mock).mockResolvedValueOnce(null);
  ((promptPromise as unknown) as jest.Mock).mockResolvedValueOnce('123');

  const otp = await promptForOTP();

  expect(promptPromise).toHaveBeenCalledTimes(2);
  expect(promptPromise).toHaveBeenNthCalledWith(1, Messages.PROMPT);
  expect(promptPromise).toHaveBeenNthCalledWith(2, Messages.PROMPT);
  expect(logSpy).toHaveBeenCalledTimes(1);
  expect(logSpy).toHaveBeenCalledWith(Messages.HELP);
  expect(otp).toBe('123');
});
