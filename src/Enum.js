const $isEnumProp = `$isEnum${Date.now()}`;

class Enum {
  constructor(values = []) {
    values.forEach((value) => {
      Object.defineProperty(this, value, {
        value,
        writable: false,
      });
    });
    Object.defineProperty(this, $isEnumProp, {
      value: true,
      writable: false,
      enumerable: false,
    });

  }
}

export function defineEnum(values) {
  return Object.seal(new Enum(values));
}

export function isEnum(sth) {
  return !!sth[$isEnumProp];
}
