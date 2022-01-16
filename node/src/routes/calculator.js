import { Router } from 'express';

import { handleError, hasKeys, toNumber } from '../common/util.js';

export default () => {
  const router = Router();

  router.post('/', handleError(async (req, res) => {
    let input = req.body;
    if (!hasKeys(input)) {
      input = req.query;
      if (!hasKeys) {
        input = {};
      }
    }

    const number1 = toNumber(input.number1, 'number1');
    const number2 = toNumber(input.number2, 'number2');

    let result;
    const operator = input.operator;
    switch (operator) {
      case 'multiply':
        result = number1 * number2;
        break;

      case 'divide':
        result = number1 / number2;
        break;

      default:
        throw new TypeError(`The value of 'operator' must be either 'multiply' or 'divide' and is '${operator}'.`);
    }

    res.set('Content-Type', 'text/plain');
    res.send(`${result}`);
  }));

  return router;
};
