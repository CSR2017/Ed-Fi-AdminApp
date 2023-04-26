import 'reflect-metadata';

export const ENTITY_GENERATOR_METADATA = Symbol.for(
  'entity-generator:attribute-faker'
);

export type AttributeFaker = (() => any) | any;

/**
 * Declarative configuration for fake data generation.
 *
 * @param faker a fake value or a function to generate one.
 *
 * @see {@link generateFake} which allows overrides to be provided at runtime.
 *
 * Note that if you define foreign key constraints on your entities, it may be
 * _impossible_ to generate and save instances without such overrides, because a
 * "fake" foreign key value that isn't supplied from the database at runtime just
 * won't work.
 *
 * Also note that this is not typesafe; it is on you to provide a faker
 * appropriate for the property you're decorating.
 *
 */
export function FakeMeUsing(faker: AttributeFaker) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(
      ENTITY_GENERATOR_METADATA,
      {
        ...Reflect.getMetadata(ENTITY_GENERATOR_METADATA, target.constructor),
        [propertyKey]: faker,
      },
      target.constructor
    );
  };
}

type ClassConstructor<T> = {
  new(...args: any[]): T;
};

export type PartialEntityGeneratorFn<T extends object> = () => {
  [k in keyof Partial<T>]: any;
};
export type PartialEntityGenerator<T extends object> =
  | PartialEntityGeneratorFn<T>
  | { [k in keyof Partial<T>]: any };

/**
 * Generate fake entity instances. Uses config defined by {@link FakeMeUsing} but also accepts overrides.
 *
 * @param entityClass Class to be mocked.
 * @param overrides Overrides of the original individual attribute fakers. This might commonly be used to specify foreign key properties when generating several related entities.
 */
export function generateFake<T extends object>(
  entityClass: ClassConstructor<T>,
  overrides?: PartialEntityGenerator<T> | undefined
): Partial<T>;
/**
 * Generate fake entity instances. Uses config defined by {@link FakeMeUsing} but also accepts overrides.
 *
 * @param entityClass Class to be mocked.
 * @param overrides Overrides of the original individual attribute fakers. This might commonly be used to specify foreign key properties when generating several related entities.
 * @param count Number of entities to generate. Falls back to one, returned singly.
 */
export function generateFake<T extends object>(
  entityClass: ClassConstructor<T>,
  overrides: PartialEntityGenerator<T> | undefined,
  count: number
): Partial<T>[];
export function generateFake<T extends object>(
  entityClass: ClassConstructor<T>,
  overrides?: PartialEntityGenerator<T> | undefined,
  count?: number | undefined
) {
  const meta: [string, AttributeFaker][] = Object.entries(
    Reflect.getMetadata(ENTITY_GENERATOR_METADATA, entityClass) || {}
  );

  const propertyGenerators: PartialEntityGeneratorFn<ClassConstructor<T>>[] = [
    ...meta.map(([key, faker]) => () => ({
      [key]: typeof faker === 'function' ? faker() : faker,
    })),
    ...(overrides
      ? [typeof overrides === 'function' ? overrides : () => overrides]
      : []),
  ];

  const generateEntity = () => {
    let out: Partial<T> = {};
    propertyGenerators.forEach((g) => {
      out = { ...out, ...g() };
    });
    return out;
  };

  if (count === undefined) {
    return generateEntity();
  } else {
    return Array.from(Array(count)).map(() => generateEntity());
  }
}
