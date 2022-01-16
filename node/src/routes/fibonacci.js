import { Router } from 'express';

import { handleError, hasKeys, toNumber } from '../common/util.js';

const timeIt = async (producer, size) => {
  const timeout = 2 * 10 ** 9;

  try {
    const start = process.hrtime.bigint();

    const control = {
      check() {
        if (process.hrtime.bigint() - start > timeout) {
          const error = new Error('Interrupted after 2s');
          error.interrupted = true;
          throw error;
        }
      },
    };

    const last = producer(control, size);
    const end = process.hrtime.bigint();
    return { first: 0, last, duration: `${end - start}` };
  } catch (error) {
    if (error.interrupted === true) {
      return { message: error.message };
    }
    throw error;
  }
};

const basic = (control, size) => {
  let value = 0;
  if (size >= 2) {
    let previous = value;
    value = 1;
    for (let i = 2; i < size; i++) {
      control.check();
      const current = previous + value;
      previous = value;
      value = current;
    }
  }
  return value;
};

const recursive = (control, size) => {
  control.check();
  if (size === 1) return 0;
  if (size === 2) return 1;

  return recursive(control, size - 1) + recursive(control, size - 2);
};

const memoized = (control, size, memo = {}) => {
  control.check();
  if (size in memo) return memo[size];
  if (size === 1) return 0;
  if (size === 2) return 1;

  return (memo[size] = memoized(control, size - 1, control, memo) + memoized(control, size - 2, control, memo));
};

export default () => {
  const router = Router();

  router.post('/', handleError(async (req, res) => {
    const input = req.query;
    if (hasKeys(input)) {
      const size = Math.max(toNumber(input.size, 'size'), 1);
      const result = {
        size,
        basic: await timeIt(basic, size),
        recursive: await timeIt(recursive, size),
        memoized: await timeIt(memoized, size),
      };
      return res.send(result);
    }

    throw new Error('The index must be informed.');
  }));

  return router;
};
