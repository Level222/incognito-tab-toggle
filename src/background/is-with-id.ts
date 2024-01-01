export type WithId<T> = T & { id: number };

const isWithId = <T extends { id?: number }>(value: T): value is WithId<T> =>
  typeof value.id === "number";

export default isWithId;
