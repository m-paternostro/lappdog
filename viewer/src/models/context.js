import { isNotEmptyString } from '../common/util.js';

const send = async (uri, path, options, textResult) => {
  const url = uri + path;
  const response = await fetch(uri + path, options);

  if (response.ok) {
    return textResult === true ? response.text() : response.json();
  }

  let message = `An error occurred while fetching a resource from '${url}'`;
  try {
    const content = await response.text();
    if (content) {
      try {
        const json = JSON.parse(content);
        console.error('backend error', json);
        if (json.message) {
          message += `\n${json.message}`;
        }
      } catch (error) {
        console.error('backend error', content);
        message = `${message}\n${content}`;
      }
    }
  } catch (error) {
    // ignore
  }

  const error = new Error(message);
  error.status = response.status;
  throw error;
};

const get = async (uri, path, textResult) => send(uri, path, undefined, textResult);

const post = async (uri, path, body, textResult) => {
  const options = {
    method: 'POST',
    mode: 'cors',
  };
  if (body) {
    options.headers = {
      'Content-Type': 'application/json',
    };
    options.body = JSON.stringify(body, undefined, 2);
  }

  return send(uri, path, options, textResult);
};

class Lappdog {
  constructor(uri, implementation) {
    this._internal = { uri, implementation };
  }

  get implementation() {
    return this._internal.implementation;
  }

  async calculate(number1, number2, operator) {
    const result = await post(this._internal.uri, '/calculator', { number1, number2, operator }, true);
    return Number(result);
  }

  async getLedgerSummary() {
    return get(this._internal.uri, '/ledger');
  }

  async getLedgerUsers() {
    return get(this._internal.uri, '/ledger/users');
  }

  async registerLedgerUser(name, balance) {
    await post(this._internal.uri, '/ledger/users', { name, balance }, true);
  }

  async getLedgerTransactions() {
    return get(this._internal.uri, '/ledger/transactions');
  }

  async recordLedgerTransaction(from, to, amount) {
    await post(this._internal.uri, '/ledger/transactions', { from, to, amount }, true);
  }

  async prankIt(exceptionMessage, statusCode, delay) {
    const body = {};
    if (exceptionMessage !== '') {
      body.exceptionMessage = exceptionMessage;
    }
    if (statusCode !== '') {
      body.statusCode = Number(statusCode);
    }
    if (delay !== '') {
      body.delay = Number(delay);
    }

    await post(this._internal.uri, '/prankster', body, true);
  }

  async computeFibonacci(size) {
    return post(this._internal.uri, `/fibonacci?size=${size}`);
  }
}

const resolveLappdog = async (lappdogs, uri) => {
  const implementation = await get(uri, '/');
  if (isNotEmptyString(implementation.id) && isNotEmptyString(implementation.name)) {
    implementation.uri = uri;
    const lappdog = new Lappdog(uri, implementation);
    for (let i = 1; lappdogs.some((s) => s.id === lappdog.id); i++) {
      lappdog.id += `-${i}`;
    }
    lappdogs.push(lappdog);
    return lappdog;
  }

  throw new Error(`The uri '${uri}' does not expose the LappDog API.`);
};

export default () => {
  const lappdogs = [];
  const consumers = [];

  return {
    empty: () => lappdogs.length === 0,

    list: () => [...lappdogs],

    listen: (consumer) => {
      consumers.push(consumer);
    },

    resolve: async (uri) => {
      const lappdog = await resolveLappdog(lappdogs, uri);
      consumers.forEach((consumer) => consumer(lappdog));
      return lappdog;
    },
  };
};
