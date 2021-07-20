import createRegistry, { Registry } from '../src/Registry';

type Components = {
  Tag: {
    name: string
  },
  Name: {
    value: string
  },
  Position: {
    x: number,
    y: number,
    z: number
  }
};

describe('Registry', () => {
  let registry: Registry<Components>;

  beforeEach(() => {
    registry = createRegistry<Components>();
  });

  test('creates entities with sequential ids', () => {
    const entity1 = registry.createEntity();
    const entity2 = registry.createEntity();
    expect(entity1.id).toBe(1);
    expect(entity2.id).toBe(2);
  });
});
