'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var Entity = /*#__PURE__*/function () {
  function Entity(entityId, registry) {
    _classCallCheck(this, Entity);

    this.entityId = entityId;
    this.registry = registry;
  }

  _createClass(Entity, [{
    key: "id",
    get: function get() {
      return this.entityId;
    }
  }, {
    key: "components",
    value: function components() {
      return this.registry.getComponents(this.entityId);
    }
  }, {
    key: "hasComponent",
    value: function hasComponent(name) {
      return this.registry.hasComponent(this.entityId, name);
    }
  }, {
    key: "addComponent",
    value: function addComponent(name, component) {
      return this.registry.assignComponent(this.entityId, name, component);
    }
  }, {
    key: "removeComponent",
    value: function removeComponent(name) {
      this.registry.removeComponent(this.entityId, name);
    }
  }, {
    key: "getComponent",
    value: function getComponent(name) {
      return this.registry.getComponent(this.entityId, name);
    }
  }]);

  return Entity;
}();

var View = /*#__PURE__*/function () {
  function View(groupAll, groupAny) {
    _classCallCheck(this, View);

    this.resultMap = new Map();
    this.groupAll = groupAll;
    this.groupAny = groupAny;
  }

  _createClass(View, [{
    key: "test",
    value: function test(entity) {
      var componentList = entity.components();
      var matchedComponents = this.groupAll.filter(function (e) {
        return componentList.includes(e);
      });
      return matchedComponents.length === this.groupAll.length;
    }
  }, {
    key: "addEntity",
    value: function addEntity(entity) {
      var componentMap = new Map();
      this.resultMap.set(entity.id, {
        entity: entity,
        componentMap: componentMap
      });
      [].concat(_toConsumableArray(this.groupAll), _toConsumableArray(this.groupAny)).forEach(function (name) {
        if (entity.hasComponent(name)) {
          componentMap.set(name, entity.getComponent(name));
        }
      });
    }
  }, {
    key: "hasEntity",
    value: function hasEntity(entity) {
      return this.resultMap.has(entity.id);
    }
  }, {
    key: "result",
    get: function get() {
      var r = [];
      this.resultMap.forEach(function (resultEntry) {
        var components = resultEntry.componentMap;
        r.push({
          entity: resultEntry.entity,
          component: function component(name) {
            return components.get(name);
          },
          hasComponent: function hasComponent(name) {
            return components.has(name);
          }
        });
      });
      return r;
    }
  }]);

  return View;
}();

var matchesFilter = function matchesFilter(name, filter) {
  return !filter.length || filter.includes(name);
};

var Registry = /*#__PURE__*/function () {
  function Registry() {
    _classCallCheck(this, Registry);

    this.entityComponents = new Map();
    this.components = new Map();
    this.nextEntity = 1;
    this.listeners = {
      afterComponentRemoved: [],
      componentAdded: [],
      componentRemoved: [],
      entityCreated: [],
      entityRemoved: []
    };
  }

  _createClass(Registry, [{
    key: "getComponentMap",
    value: function getComponentMap(componentName) {
      if (!this.components.has(componentName)) {
        this.components.set(componentName, new Map());
      }

      return this.components.get(componentName);
    }
  }, {
    key: "createEntity",
    value: function createEntity() {
      var components = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var entity = new Entity(this.nextEntity, this);
      this.nextEntity += 1;
      this.entityComponents.set(entity.id, new Set());
      this.listeners.entityCreated.forEach(function (listener) {
        listener(entity);
      });
      var componentEntries = Object.entries(components);
      componentEntries.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            name = _ref2[0],
            value = _ref2[1];

        entity.addComponent(name, value);
      });
      return entity;
    }
  }, {
    key: "getEntity",
    value: function getEntity(entity) {
      if (!this.entityComponents.has(entity)) {
        throw new Error("Entity ".concat(entity, " not found"));
      }

      return new Entity(entity, this);
    }
  }, {
    key: "getComponents",
    value: function getComponents(entity) {
      var components = this.entityComponents.get(entity);

      if (!components) {
        return [];
      }

      return Array.from(components);
    }
  }, {
    key: "hasComponent",
    value: function hasComponent(entity, name) {
      return this.getComponentMap(name).has(entity);
    }
  }, {
    key: "assignComponent",
    value: function assignComponent(entity, name, component) {
      var _this = this;

      var componentList = this.entityComponents.get(entity);

      if (!componentList) {
        throw new Error("Entity ".concat(entity, " not found"));
      }

      componentList.add(name);
      this.getComponentMap(name).set(entity, component);
      this.listeners.componentAdded.filter(function (listener) {
        return matchesFilter(name, listener.filter);
      }).forEach(function (listener) {
        listener.handler(new Entity(entity, _this), name, component);
      });
      return component;
    }
  }, {
    key: "removeComponent",
    value: function removeComponent(entity, name) {
      var _this2 = this;

      var componentList = this.entityComponents.get(entity);

      if (!componentList) {
        throw new Error("Entity ".concat(entity, " not found"));
      }

      var component = this.getComponent(entity, name);
      this.listeners.componentRemoved.filter(function (listener) {
        return matchesFilter(name, listener.filter);
      }).forEach(function (listener) {
        listener.handler(new Entity(entity, _this2), name, component);
      });
      componentList["delete"](name);
      this.getComponentMap(name)["delete"](entity);
      this.listeners.afterComponentRemoved.filter(function (listener) {
        return matchesFilter(name, listener.filter);
      }).forEach(function (listener) {
        listener.handler(new Entity(entity, _this2), name, component);
      });
    }
  }, {
    key: "getComponent",
    value: function getComponent(entityId, name) {
      var component = this.getComponentMap(name).get(entityId);

      if (!component) {
        throw new Error("Entity ".concat(entityId, " does not have component ").concat(String(name)));
      }

      return component;
    }
  }, {
    key: "removeEntity",
    value: function removeEntity(entity) {
      var _this3 = this;

      var componentList = this.entityComponents.get(entity);

      if (!componentList) {
        return;
      }

      this.listeners.entityRemoved.forEach(function (listener) {
        listener(new Entity(entity, _this3));
      });
      componentList.forEach(function (componentName) {
        _this3.removeComponent(entity, componentName);
      });
      this.entityComponents["delete"](entity);
    }
  }, {
    key: "getView",
    value: function getView(groupAll) {
      var groupAny = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var view = new View(groupAll, groupAny);
      this.all().filter(function (entity) {
        return view.test(entity);
      }).forEach(function (matchedEntity) {
        view.addEntity(matchedEntity);
      });
      return view;
    }
  }, {
    key: "all",
    value: function all() {
      var _this4 = this;

      return Array.from(this.entityComponents.keys()).map(function (entityId) {
        return new Entity(entityId, _this4);
      });
    }
  }, {
    key: "onAfterComponentRemoved",
    value: function onAfterComponentRemoved(listener) {
      var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      this.listeners.afterComponentRemoved.push({
        filter: filter,
        handler: listener
      });
    }
  }, {
    key: "offAfterComponentRemoved",
    value: function offAfterComponentRemoved(listener) {
      this.listeners.afterComponentRemoved = this.listeners.afterComponentRemoved.filter(function (l) {
        return l.handler !== listener;
      });
    }
  }, {
    key: "onComponentAdded",
    value: function onComponentAdded(listener) {
      var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      this.listeners.componentAdded.push({
        filter: filter,
        handler: listener
      });
    }
  }, {
    key: "offComponentAdded",
    value: function offComponentAdded(listener) {
      this.listeners.componentAdded = this.listeners.componentAdded.filter(function (l) {
        return l.handler !== listener;
      });
    }
  }, {
    key: "onComponentRemoved",
    value: function onComponentRemoved(listener) {
      var filter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      this.listeners.componentRemoved.push({
        filter: filter,
        handler: listener
      });
    }
  }, {
    key: "offComponentRemoved",
    value: function offComponentRemoved(listener) {
      this.listeners.componentRemoved = this.listeners.componentRemoved.filter(function (l) {
        return l.handler !== listener;
      });
    }
  }, {
    key: "onEntityCreated",
    value: function onEntityCreated(listener) {
      this.listeners.entityCreated.push(listener);
    }
  }, {
    key: "offEntityCreated",
    value: function offEntityCreated(handler) {
      this.listeners.entityCreated = this.listeners.entityCreated.filter(function (listener) {
        return listener !== handler;
      });
    }
  }, {
    key: "onEntityRemoved",
    value: function onEntityRemoved(listener) {
      this.listeners.entityRemoved.push(listener);
    }
  }, {
    key: "offEntityRemoved",
    value: function offEntityRemoved(handler) {
      this.listeners.entityRemoved = this.listeners.entityRemoved.filter(function (listener) {
        return listener !== handler;
      });
    }
  }]);

  return Registry;
}();

var createRegistry = function createRegistry() {
  return new Registry();
};

var CacheableView = /*#__PURE__*/function () {
  function CacheableView(registry, requiredComponents) {
    var optionalComponents = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    _classCallCheck(this, CacheableView);

    this.view = null;
    this.registry = registry;
    this.requiredComponents = requiredComponents;
    this.optionalComponents = optionalComponents;
    var viewComponents = [].concat(_toConsumableArray(this.requiredComponents), _toConsumableArray(this.optionalComponents));
    this.registry.onComponentAdded(this.onEntityChanged.bind(this), viewComponents);
    this.registry.onAfterComponentRemoved(this.onEntityChanged.bind(this), viewComponents);
  }

  _createClass(CacheableView, [{
    key: "result",
    get: function get() {
      if (this.view === null) {
        this.rebuildView();
      }

      return this.view.result;
    }
  }, {
    key: "invalidate",
    value: function invalidate() {
      this.view = null;
    }
  }, {
    key: "rebuildView",
    value: function rebuildView() {
      this.view = this.registry.getView(this.requiredComponents, this.optionalComponents);
    }
  }, {
    key: "onEntityChanged",
    value: function onEntityChanged(entity) {
      if (this.view === null) {
        return;
      }

      var hasAllRequiredComponents = this.requiredComponents.every(function (componentName) {
        return entity.hasComponent(componentName);
      });

      if (hasAllRequiredComponents && !this.view.hasEntity(entity) || !hasAllRequiredComponents && this.view.hasEntity(entity)) {
        this.invalidate();
      }
    }
  }]);

  return CacheableView;
}();

exports.CacheableView = CacheableView;
exports.createRegistry = createRegistry;
