import _createRegistry from './Registry';

// eslint-disable-next-line import/prefer-default-export
export const createRegistry = _createRegistry;

export type { default as Entity } from './Entity';
export type { Registry } from './Registry';
export type { ComponentListener, RegistryListener, EntityListener } from './RegistryListeners';
export type { ComponentGroup, default as View } from './View';
