export const handleError = (consumer) => async (req, res, next) => {
  try {
    await consumer(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const hasKeys = (value) => {
  if (value && typeof value === 'object') {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        return true;
      }
    }
  }
  return false;
};

export const toNumber = (value, label = 'value') => {
  if (Number.isInteger()) {
    return value;
  }

  const type = typeof value;
  if (type === 'number') {
    return value;
  }

  if (type === 'string') {
    const number = Number(value);
    if (!Number.isNaN(number)) {
      return number;
    }
  }

  throw typeof label === 'function'
    ? label()
    : new TypeError(`The value of '${label}' must be a number and is '${value}'.`);
};
