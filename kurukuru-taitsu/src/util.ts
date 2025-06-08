export function lookUpReverse<T extends Record<string, number | string>>(map: T) {
  return (value: T[keyof T]): keyof T => {
    const entry = Object.entries(map).find(([, v]) => v === value);
    if (!entry) throw new Error(`Value ${value} not found`);
    return entry[0] as keyof T;
  };
}
