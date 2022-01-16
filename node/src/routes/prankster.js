import { Router } from 'express';

import { handleError, hasKeys, toNumber } from '../common/util.js';

const send = async (res, { exceptionMessage, statusCode, inputDelay }) => {
  const doit = () => {
    if (exceptionMessage !== undefined) {
      throw new Error(exceptionMessage);
    }
    res.status(statusCode).end();
  };

  const delay = inputDelay !== undefined
    ? toNumber(inputDelay, 'delay')
    : 0;

  if (delay === 0) {
    return doit();
  }

  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        try {
          doit();
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      delay,
    );
  });
};

export default () => {
  const router = Router();

  router.post('/', handleError(async (req, res) => {
    const input = req.body;
    if (hasKeys(input)) {
      const exceptionMessage = input.exceptionMessage;
      if (exceptionMessage !== undefined) {
        if (typeof exceptionMessage !== 'string' || exceptionMessage.length === 0) {
          throw new Error(`The value of 'exceptionMessage' must be a not-empty string and is '${exceptionMessage}'.`);
        }
        return send(res, { exceptionMessage, inputDelay: input.delay });
      }

      if (input.statusCode !== undefined) {
        const statusCode = toNumber(input.statusCode, 'statusCode');
        if (statusCode < 100) {
          throw new Error(`The value of 'statusCode' must be a number greater or equal to 100 and is '${statusCode}'.`);
        }
        return send(res, { statusCode, inputDelay: input.delay });
      }
    }

    throw new Error('Either \'statusCode\' or \'exceptionMessage\' must be informed.');
  }));

  return router;
};
