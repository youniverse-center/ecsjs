import View from '../src/View';
import createRegistry, { Registry } from '../src/Registry';
import type { Components } from './TestComponents';

describe('View', () => {
  let registry: Registry<Components>;

  beforeEach(() => {
    registry = createRegistry<Components>();
  });

  test('Entity matches all required components without optional', () => {
    const entity = registry.createEntity({
      Name: {
        value: 'name',
      },
    });

    const view = new View<Components>(['Name'], []);

    expect(view.test(entity)).toBe(true);
  });

  test('Entity does not match all required components', () => {
    const entity = registry.createEntity({
      Name: {
        value: 'name',
      },
    });

    const view = new View<Components>(['Name', 'Tag'], []);

    expect(view.test(entity)).toBe(false);
  });

  test('Entity matches if not containing optional components', () => {
    const entity = registry.createEntity({
      Name: {
        value: 'name',
      },
    });

    const view = new View<Components>(['Name'], ['Tag']);

    expect(view.test(entity)).toBe(true);
  });

  test('Should contain only requested components in view result (component values)', () => {
    const entity = registry.createEntity({
      Name: {
        value: 'name',
      },
      Tag: {
        name: 'tag',
      },
    });

    const view = new View<Components>(['Name'], ['Position']);
    view.addEntity(entity);

    expect(
      view.result.map(({ component }) => [
        component('Name'),
        component('Tag'),
        component('Position'),
      ]),
    ).toStrictEqual([
      [
        {
          value: 'name',
        },
        undefined,
        undefined,
      ],
    ]);
  });

  test('Should contain only requested components in view result (hasComponent check)', () => {
    const entity = registry.createEntity({
      Name: {
        value: 'name',
      },
      Tag: {
        name: 'tag',
      },
    });

    const view = new View<Components>(['Name'], ['Position']);
    view.addEntity(entity);

    expect(
      view.result.map(({ hasComponent }) => [
        hasComponent('Name'),
        hasComponent('Tag'),
        hasComponent('Position'),
      ]),
    ).toStrictEqual([[true, false, false]]);
  });

  test('Should return true if entity exists in view', () => {
    const entity = registry.createEntity();
    const view = new View<Components>([], []);
    view.addEntity(entity);

    expect(view.hasEntity(entity)).toBe(true);
  });

  test('Should return false if entity does not exist in view', () => {
    const entity = registry.createEntity();
    const view = new View<Components>([], []);

    expect(view.hasEntity(entity)).toBe(false);
  });
});
