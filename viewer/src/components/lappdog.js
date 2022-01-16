/* eslint-disable max-len */

import {
  asNumber,
  createElement,
  createFieldset,
  createForm,
  performLongOperation,
  requiredInputs,
  waitFor,
} from '../common/util.js';
import implementationImage from '../../resources/implementation.png';

const calculator = (context, id) => {
  const div = createElement('div', `${id}-calculator`);

  const { number1, number2, result, multiply, divide } = createForm(
    'form', div, '',
    [
      (parent) => createElement('input', 'number1', { parent, label: true, name: true, template: { type: 'text' } }),
      (parent) => createElement('input', 'number2', { parent, label: true, name: true, template: { type: 'text' } }),
      (parent) => createElement('input', 'result', { parent, label: true, name: true, template: { type: 'text', readOnly: true } }),
    ],
    [
      (parent) => createElement('button', 'multiply', { parent, text: true, template: { type: 'button', className: 'action' } }),
      (parent) => createElement('button', 'divide', { parent, text: true, template: { type: 'button', className: 'action' } }),
    ],
  );

  requiredInputs([multiply, divide], [number1, number2]);

  const calculate = async (operator) => {
    result.value = '';
    const value = await performLongOperation(
      () => context.calculate(asNumber(number1.value), asNumber(number2.value), operator),
    );
    if (value !== undefined) {
      result.value = value;
    }
  };
  multiply.onclick = () => calculate('multiply');
  divide.onclick = () => calculate('divide');

  return div;
};

const ledger = (context, id) => {
  const div = createElement('div', `${id}-ledger`);

  {
    const { queries, refresh, result } = createForm(
      'form', div, 'View',
      [
        (parent) => {
          const selectDiv = createElement('div', 'selection', { parent, template: { style: 'white-space: nowrap' } });

          const select = createElement('select', 'queries', { parent: selectDiv, name: true, template: { className: 'row-input', style: 'display: inline-block; width: 90%' } });
          createElement('option', 'empty', { parent: select, text: '-- select a query --', template: { value: 'empty' } });
          createElement('option', 'summary', { parent: select, text: true, template: { value: 'summary' } });
          createElement('option', 'users', { parent: select, text: true, template: { value: 'users' } });
          createElement('option', 'transactions', { parent: select, text: true, template: { value: 'transactions' } });

          const button = createElement('button', 'refresh', { parent: selectDiv, text: '\u27F3', template: { type: 'button', style: 'display: inline-block' } });

          return [select, button];
        },
        (parent) => createElement('textarea', 'result', {
          parent,
          template: {
            className: 'row-input',
            readOnly: true,
            rows: 10,
          },
        }),
      ],
      [],
    );

    queries.onchange = async () => {
      result.value = '';

      let operation;
      switch (queries.value) {
        case 'summary':
          operation = async () => {
            const { users, transactions, balance } = await context.getLedgerSummary();
            return `Number of users: ${users}\nNumber of transactions: ${transactions}\nBalance: ${balance}`;
          };
          break;

        case 'users':
          operation = async () => {
            const users = await context.getLedgerUsers();
            return users.length === 0
              ? '<no users>'
              : users
                .map(({ name, balance }) => `${name}: ${balance}`)
                .join('\n');
          };
          break;

        case 'transactions':
          operation = async () => {
            const transactions = await context.getLedgerTransactions();
            return transactions.length === 0
              ? '<no transactions>'
              : transactions
                .map(({ from, to, amount }, index) => `${index}. ${from} --(${amount})--> ${to}`)
                .join('\n');
          };
          break;

        default:
          // ignore
      }

      refresh.onclick = () => queries.onchange();

      if (operation) {
        const value = await performLongOperation(() => {
          result.value = '';
          return operation();
        });
        if (value !== undefined) {
          result.value = value;
        }
      }
    };
  }

  {
    const { name, balance, register, counterBadge } = createForm(
      'form', div, 'User',
      [
        (parent) => createElement('input', 'name', { parent, label: true, template: { type: 'text' } }),
        (parent) => createElement('input', 'balance', { parent, label: true, template: { type: 'text' } }),
      ],
      [
        (parent) => createElement('button', 'register', { parent, text: true, template: { type: 'button', className: 'action badge-top-right' } }),
        (parent) => createElement('span', 'counterBadge', { parent, template: { className: 'counter-badge' } }),
      ],
    );

    requiredInputs([register], [name, balance]);

    register['data-counter'] = 0;
    counterBadge.style.display = 'none';
    register.onclick = async () => {
      await performLongOperation(
        () => context.registerLedgerUser(name.value, asNumber(balance.value)),
        (success) => {
          if (success) {
            counterBadge.textContent = ++register['data-counter'];
            counterBadge.style.display = 'block';
          }
        },
      );
    };
  }

  {
    const { from, to, amount, record, counterBadge } = createForm(
      'form', div, 'Transaction',
      [
        (parent) => createElement('input', 'from', { parent, label: true, template: { type: 'text' } }),
        (parent) => createElement('input', 'to', { parent, label: true, template: { type: 'text' } }),
        (parent) => createElement('input', 'amount', { parent, label: true, template: { type: 'number' } }),
      ],
      [
        (parent) => createElement('button', 'record', { parent, text: true, template: { type: 'button', className: 'action' } }),
        (parent) => createElement('span', 'counterBadge', { parent, template: { className: 'counter-badge' } }),
      ],
    );

    requiredInputs([record], [from, amount, to]);

    record['data-counter'] = 0;
    counterBadge.style.display = 'none';
    record.onclick = async () => {
      await performLongOperation(
        () => context.recordLedgerTransaction(from.value, to.value, asNumber(amount.value)),
        (success) => {
          if (success) {
            counterBadge.textContent = ++record['data-counter'];
            counterBadge.style.display = 'block';
          }
        },
      );
    };
  }

  return div;
};

const prankster = (context, id) => {
  const div = createElement('div', `${id}-prankster`);

  const { form, loop, interval } = createForm(
    'form', div, 'Frontend',
    [
      (parent) => createElement('input', 'loop', { parent, label: true, name: true, template: { type: 'number', min: 1, max: 50 } }),
      (parent) => createElement('input', 'interval', { parent, label: true, name: true, template: { type: 'number', min: 0 } }),
    ],
  );

  const { code, exception, sleep, submit, successBadge, errorBadge } = createFieldset(
    form, 'Backend',
    [
      (parent) => createElement('input', 'code', { parent, label: true, name: 'Status Code', template: { type: 'number', min: 100, max: 599 } }),
      (parent) => createElement('input', 'exception', { parent, label: true, name: true, template: { type: 'text' } }),
      (parent) => createElement('input', 'sleep', { parent, label: true, name: true, template: { type: 'number', min: 0 } }),
    ],
    [
      (parent) => createElement('button', 'submit', { parent, text: 'Submit', template: { type: 'button', className: 'action' } }),
      (parent) => createElement('span', 'errorBadge', { parent, template: { className: 'error-badge' } }),
      (parent) => createElement('span', 'successBadge', { parent, template: { className: 'counter-badge' } }),
    ],
  );

  const loopMax = () => Math.max(Number(loop.value), 1);
  const successCount = () => Number(successBadge.textContent) || 0;
  const errorCount = () => Number(errorBadge.textContent) || 0;

  const createExecution = () => {
    const createController = () => {
      const frontendMax = loopMax();
      const frontendHiatus = Math.max(Number(interval.value), 0);

      const backendException = exception.value;
      const backendCode = code.value;
      const backendSleep = sleep.value;

      let runPromise = Promise.resolve();
      let active = true;

      return {
        get frontendMax() {
          return frontendMax;
        },

        async send(listener) {
          if (active) {
            try {
              await context.prankIt(backendException, backendCode, backendSleep);
              listener?.(this, true);
            } catch (error) {
              listener?.(this, false);
            }
          }
        },

        async run(listener) {
          if (frontendMax > 1) {
            const task = () => (active
              ? Promise.allSettled([this.send(listener), waitFor(frontendHiatus)])
              : undefined);

            runPromise = Promise.resolve();
            for (let i = 0; i < frontendMax; i++) {
              runPromise = runPromise
                .then(() => task());
            }
            await runPromise;
          } else if (active) {
            await this.send(listener);
          }
        },

        async stop() {
          active = false;
          return runPromise;
        },
      };
    };

    const setup = () => {
      loop.readOnly = true;
      interval.readOnly = true;
      code.readOnly = true;
      exception.readOnly = true;
      sleep.readOnly = true;

      if (successCount() > 500) {
        successBadge.textContent = 0;
      }
      if (errorCount() > 500) {
        errorBadge.textContent = 0;
      }
    };

    const update = (controller, successful) => {
      if (successful) {
        successBadge.textContent = 1 + successCount();
      } else {
        errorBadge.textContent = 1 + errorCount();
      }
    };

    const tearDown = () => {
      loop.readOnly = false;
      interval.readOnly = false;
      code.readOnly = false;
      exception.readOnly = false;
      sleep.readOnly = false;
    };

    const controller = createController();
    return {
      run: async () => {
        setup();
        await controller.run(update);
        tearDown();
      },

      stop: async () => {
        await controller.stop();
        tearDown();
      },
    };
  };

  successBadge.textContent = 0;
  errorBadge.textContent = 0;

  interval.readOnly = true;
  interval.classList.add('strikedout');

  submit.textContent = 'Send';
  loop.value = 1;
  interval.value = 0;
  code.value = 200;
  sleep.value = 0;

  loop.oninput = () => {
    if (loopMax() === 1) {
      interval.readOnly = true;
      interval.classList.add('strikedout');
      submit.textContent = 'Send';
    } else {
      interval.readOnly = false;
      interval.classList.remove('strikedout');
      submit.textContent = 'Start';
    }
  };

  exception.oninput = () => {
    if (exception.value === '') {
      code.classList.remove('strikedout');
      code.readOnly = false;
    } else {
      code.classList.add('strikedout');
      code.readOnly = true;
    }
  };

  let execution;
  submit.onclick = async () => {
    if (execution) {
      submit.disabled = true;
      await execution.stop();
      submit.textContent = loopMax() === 1 ? 'Send' : 'Start';
      submit.disabled = false;
      execution = undefined;
    } else {
      if (loopMax() === 1) {
        submit.disabled = true;
      } else {
        submit.textContent = 'Stop';
      }

      execution = createExecution();
      await execution.run();

      submit.disabled = false;
      execution = undefined;

      if (loopMax() > 1) {
        submit.textContent = 'Start';
      }
    }
  };

  return div;
};

const fibonacci = (context, id) => {
  const div = createElement('div', `${id}-fibonacci`);

  const { form, size, compute } = createForm(
    'form', div, '',
    [
      (parent) => createElement('input', 'size', { parent, label: true, name: true, template: { type: 'number', min: 1 } }),
    ],
    [
      (parent) => createElement('button', 'compute', { parent, text: 'Compute Last Element', template: { type: 'button', className: 'action' } }),
    ],
  );

  const { basicValue, basicTime } = createFieldset(
    form, 'Basic',
    [
      (parent) => createElement('input', 'basicValue', { parent, label: 'Value', name: true, template: { type: 'text' } }),
      (parent) => createElement('input', 'basicTime', { parent, label: 'Time (ns)', name: true, template: { type: 'text' } }),
    ],
  );

  const { recursionValue, recursionTime } = createFieldset(
    form, 'Recursion',
    [
      (parent) => createElement('input', 'recursionValue', { parent, label: 'Value', name: true, template: { type: 'text' } }),
      (parent) => createElement('input', 'recursionTime', { parent, label: 'Time (ns)', name: true, template: { type: 'text' } }),
    ],
  );

  const { memoizedValue, memoizedTime } = createFieldset(
    form, 'Memoized',
    [
      (parent) => createElement('input', 'memoizedValue', { parent, label: 'Value', name: true, template: { type: 'text' } }),
      (parent) => createElement('input', 'memoizedTime', { parent, label: 'Time (ns)', name: true, template: { type: 'text' } }),
    ],
  );

  size.value = 1;
  basicValue.readOnly = true;
  basicTime.readOnly = true;
  recursionValue.readOnly = true;
  recursionTime.readOnly = true;
  memoizedValue.readOnly = true;
  memoizedTime.readOnly = true;

  size.oninput = () => {
    basicValue.value = '';
    basicTime.value = '';
    recursionValue.value = '';
    recursionTime.value = '';
    memoizedValue.value = '';
    memoizedTime.value = '';
    compute.disabled = size.value < 1;
  };

  compute.onclick = async () => {
    basicValue.value = '';
    basicTime.value = '';
    recursionValue.value = '';
    recursionTime.value = '';
    memoizedValue.value = '';
    memoizedTime.value = '';
    compute.disabled = true;
    size.readOnly = true;

    const result = await performLongOperation(
      () => context.computeFibonacci(size.value),
      () => {
        compute.disabled = false;
        size.readOnly = false;
      },
    );
    if (result) {
      basicValue.value = result.basic.last ?? result.basic.message;
      basicTime.value = result.basic.duration ?? '';
      recursionValue.value = result.recursive.last ?? result.recursive.message;
      recursionTime.value = result.recursive.duration ?? '';
      memoizedValue.value = result.memoized?.last ?? result.memoized.message;
      memoizedTime.value = result.memoized.duration ?? '';
    }
  };

  return div;
};

// see menubar.changeCollapsibleState
const createSection = (context, parent, text, sectionSupplier) => {
  const button = createElement('button', 'ledger-button', {
    parent,
    text,
    template: {
      type: 'button',
      className: 'collapsible',
    },
  });

  const section = sectionSupplier(context, parent.id);
  section.className = 'content section';
  section.style.display = 'none';
  parent.appendChild(section);

  button.onclick = () => {
    button.classList.toggle('active');
    section.style.display = section.style.display === 'block' ? 'none' : 'block';
  };
};

export default (context) => {
  const { id, name, uri, image, color } = context.implementation;

  const lappdog = document.createElement('div');
  lappdog.id = `${id}-lappdog`;
  lappdog.className = 'lappdog';

  if (color) {
    lappdog.style.setProperty('--lappdogColor', color);
  }

  {
    const header = createElement('div', 'header', { parent: lappdog, template: { className: 'header' } });
    createElement('img', 'logo', { parent: header, template: { src: image || implementationImage } });
    const text = createElement('div', 'text', { parent: header });
    createElement('h1', 'title', { parent: text, text: name });
    createElement('h2', 'detail', { parent: text, text: uri });
  }

  createSection(context, lappdog, 'Calculator', calculator);
  createSection(context, lappdog, 'Fibonacci', fibonacci);
  createSection(context, lappdog, 'Ledger', ledger);
  createSection(context, lappdog, 'Prankster', prankster);

  return lappdog;
};
