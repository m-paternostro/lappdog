export const capitalize = ([first, ...rest]) => [
  first.toLocaleUpperCase(),
  ...rest.map((s) => s.toLocaleLowerCase()),
].join('');

export const isNotEmptyString = (value) => typeof value === 'string' && value !== '';

export const asNumber = (value) => {
  const number = Number(value);
  return Number.isNaN(number) ? value : number;
};

export const waitFor = async (timeout) => (timeout > 0
  ? new Promise((resolve) => setTimeout(resolve, timeout))
  : Promise.resolve());

export const createElement = (tag, id, { parent, label, name, text, template } = {}) => {
  const elementId = parent ? `${parent.id}-${id}` : id;

  if (label) {
    const labelElement = document.createElement('label');
    parent.appendChild(labelElement);
    labelElement.for = elementId;
    labelElement.appendChild(document.createTextNode(label === true ? capitalize(id) : label));
  }

  const element = document.createElement(tag);
  element.id = elementId;
  element['data-id'] = id;

  if (parent) {
    parent.appendChild(element);
  }

  if (name) {
    element.name = name === true ? id : name;
  }

  if (text) {
    element.appendChild(document.createTextNode(text === true ? capitalize(id) : text));
  }

  if (template) {
    Object.assign(element, template);
  }

  return element;
};

export const createList = (id, parent, suppliers) => {
  const ol = createElement('ol', id, { parent });
  return suppliers.reduce(
    (object, supplier, index) => {
      const li = createElement('li', index, { parent: ol });
      const element = supplier(li);
      if (Array.isArray(element)) {
        element.forEach((e) => object[e['data-id']] = e);
      } else {
        object[element['data-id']] = element;
      }
      return object;
    },
    {},
  );
};

export const createFieldset = (form, text, fieldSuppliers, suppliers = []) => {
  const fieldset = createElement('fieldset', 'fieldset', { parent: form });
  if (text) {
    createElement('legend', 'legend', { parent: fieldset, text });
  }

  return {
    ...createList('ol', fieldset, fieldSuppliers),
    ...suppliers.reduce(
      (object, supplier) => {
        const element = supplier(fieldset);
        object[element['data-id']] = element;
        return object;
      },
      { [form['data-id']]: form },
    ),
  };
};

export const createForm = (id, parent, text, fieldSuppliers, suppliers) => {
  const form = createElement('form', id, { parent });
  return createFieldset(form, text, fieldSuppliers, suppliers);
};

export const requiredInputs = (buttons, inputs) => {
  buttons.forEach((button) => button.disabled = true);

  const enableButtons = () => {
    const disabled = inputs.some((input) => input.value === '');
    buttons.forEach((button) => button.disabled = disabled);
  };
  inputs.forEach((input) => input.oninput = enableButtons);
};

export const withinRange = (input) => {
  if (input.value !== '') {
    const number = Number(input.value);
    return number >= Number(input.min) && number <= Number(input.max);
  }
  return false;
};

export const handleError = async (producer, ...finalizers) => {
  const finalize = finalizers.length === 0
    ? () => true
    : async (success) => {
      finalizers
        .filter((finalizer) => finalizer)
        .reduce(
          async (promise, finalizer) => {
            await promise;
            try {
              await finalizer(success);
            } catch (error) {
              console.log('A finalizer has thrown an error', error);
            }
          },
          Promise.resolve(),
        );
    };

  try {
    const result = await producer();
    await finalize(true);
    return result;
  } catch (error) {
    console.log(error);
    await finalize(false);
    alert(error.message || 'An error occurred while performing the operation.');
  }
  return undefined;
};

export const performLongOperation = async (producer, ...finalizers) => handleError(
  () => {
    document.body.style.cursor = 'wait';
    return producer();
  },
  ...finalizers,
  () => document.body.style.cursor = 'default',
);

const doFetchEnvironmentVariables = async (names) => {
  const url = `/env?name=${names.join('&name=')}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to obtain the required environment variables.');
  }

  return response.status !== 204 ? response.json() : undefined;
};

// eslint-disable-next-line max-len
export const fetchEnvironmentVariables = async (...names) => performLongOperation(() => doFetchEnvironmentVariables(names));
