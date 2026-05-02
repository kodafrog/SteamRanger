export function moveItem<T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const copy = [...array];

  const [item] = copy.splice(fromIndex, 1);

  if (!item) return array;

  copy.splice(toIndex, 0, item);

  return copy;
}


export function removeFromArray<T>(
  array: T[],
  predicate: (item: T) => boolean
): T[] {
  return array.filter((item) => !predicate(item));
}


export function insertIntoArray<T>(
  array: T[],
  item: T,
  index: number
): T[] {
  const copy = [...array];

  copy.splice(index, 0, item);

  return copy;
}