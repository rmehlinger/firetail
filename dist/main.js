(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('bobtail-deep-cell', ['exports', 'bobtail-rx', 'bobtail-json-cell', 'underscore', 'lodash.set'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('bobtail-rx'), require('bobtail-json-cell'), require('underscore'), require('lodash.set'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.rx, global.bobtailJsonCell, global.underscore, global.lodashSet);
    global.bobtailDeepCell = mod.exports;
  }
})(this, function (exports, _bobtailRx, _bobtailJsonCell, _underscore, _lodash) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.DepSyncArray = exports.RWFireTailList = exports.RWFireTailCell = exports.DepFireTailList = exports.DepFireTailCell = undefined;

  var _underscore2 = _interopRequireDefault(_underscore);

  var _lodash2 = _interopRequireDefault(_lodash);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var _get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var listEvents = {
    child_added: function child_added(data) {
      var _this = this;

      return this._reloading(function () {
        return (0, _lodash2.default)(_this, ['data', data.key], data.val());
      });
    },
    child_changed: function child_changed(data) {
      var _this2 = this;

      return this._reloading(function () {
        return (0, _lodash2.default)(_this2, ['data', data.key], data.val());
      });
    },
    child_removed: function child_removed(data) {
      var _this3 = this;

      return this._reloading(function () {
        return delete _this3.data[data.key];
      });
    }
  };

  function initCell(_ref) {
    var _this4 = this;

    var _ref2 = _slicedToArray(_ref, 2),
        o = _ref2[0],
        n = _ref2[1];

    if (o) {
      o.off(); // turn off old listeners, if any
    }
    return n.on('value', function (data) {
      return _this4._reload(data.val());
    });
  }

  function initList(_ref3) {
    var _this5 = this;

    var _ref4 = _slicedToArray(_ref3, 2),
        o = _ref4[0],
        n = _ref4[1];

    if (o) {
      o.off(); // turn off old listeners, if any
    }
    var entries = Object.entries(listEvents);
    this._reload({});
    entries.map(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
          ev = _ref6[0],
          handler = _ref6[1];

      return n.on(ev, handler.bind(_this5));
    });
  }

  var FireTailBase = function (_ObsJsonCell) {
    _inherits(FireTailBase, _ObsJsonCell);

    function FireTailBase(refFn) {
      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, FireTailBase);

      var _this6 = _possibleConstructorReturn(this, (FireTailBase.__proto__ || Object.getPrototypeOf(FireTailBase)).call(this, init));

      _this6.refFn = typeof refFn === 'function' ? refFn : function () {
        return refFn;
      };
      _this6.refCell = (0, _bobtailRx.bind)(_this6.refFn);
      _this6._nowReloading = false;
      return _this6;
    }

    _createClass(FireTailBase, [{
      key: '_reload',
      value: function _reload(data) {
        var _this7 = this;

        this._reloading(function () {
          return _this7._update(data);
        });
      }
    }, {
      key: '_reloading',
      value: function _reloading(f) {
        var _this8 = this;

        var _wasReloading = this._nowReloading;
        this._nowReloading = true;
        (0, _bobtailRx.transaction)(function () {
          try {
            _this8._updating(f);
          } finally {
            _this8._nowReloading = _wasReloading;
          }
        });
      }
    }]);

    return FireTailBase;
  }(_bobtailJsonCell.ObsJsonCell);

  var DepFireTailBase = function (_FireTailBase) {
    _inherits(DepFireTailBase, _FireTailBase);

    function DepFireTailBase() {
      var _this9;

      _classCallCheck(this, DepFireTailBase);

      (_this9 = _possibleConstructorReturn(this, (DepFireTailBase.__proto__ || Object.getPrototypeOf(DepFireTailBase)).apply(this, arguments)), _this9)._makeReadOnly();
      return _this9;
    }

    return DepFireTailBase;
  }(FireTailBase);

  var DepFireTailCell = exports.DepFireTailCell = function (_DepFireTailBase) {
    _inherits(DepFireTailCell, _DepFireTailBase);

    function DepFireTailCell(refFn) {
      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, DepFireTailCell);

      var _this10 = _possibleConstructorReturn(this, (DepFireTailCell.__proto__ || Object.getPrototypeOf(DepFireTailCell)).call(this, refFn, init));

      (0, _bobtailRx.autoSub)(_this10.refCell.onSet, initCell.bind(_this10));
      return _this10;
    }

    return DepFireTailCell;
  }(DepFireTailBase);

  var DepFireTailList = exports.DepFireTailList = function (_DepFireTailBase2) {
    _inherits(DepFireTailList, _DepFireTailBase2);

    function DepFireTailList(refFn, init) {
      _classCallCheck(this, DepFireTailList);

      var _this11 = _possibleConstructorReturn(this, (DepFireTailList.__proto__ || Object.getPrototypeOf(DepFireTailList)).call(this, refFn, init || {}));

      (0, _bobtailRx.autoSub)(_this11.refCell.onSet, initList.bind(_this11));
      return _this11;
    }

    return DepFireTailList;
  }(DepFireTailBase);

  var RWFireTailBase = function (_FireTailBase2) {
    _inherits(RWFireTailBase, _FireTailBase2);

    function RWFireTailBase(refFn, init, events) {
      _classCallCheck(this, RWFireTailBase);

      return _possibleConstructorReturn(this, (RWFireTailBase.__proto__ || Object.getPrototypeOf(RWFireTailBase)).call(this, refFn, init, events));
    }

    _createClass(RWFireTailBase, [{
      key: 'setProperty',
      value: function setProperty(getPath, basePath, obj, prop, val) {
        _get(RWFireTailBase.prototype.__proto__ || Object.getPrototypeOf(RWFireTailBase.prototype), 'setProperty', this).call(this, getPath, basePath, obj, prop, val);
        if (!this._nowReloading) {
          var path = getPath(prop).slice(1).join('/');
          this.refCell.raw().ref.update(_defineProperty({}, path, val));
        }
        return true;
      }
    }, {
      key: 'deleteProperty',
      value: function deleteProperty(getPath, basePath, obj, prop) {
        _get(RWFireTailBase.prototype.__proto__ || Object.getPrototypeOf(RWFireTailBase.prototype), 'deleteProperty', this).call(this, getPath, basePath, obj, prop);
        if (!this._nowReloading) {
          this.refCell.raw().ref.update(_defineProperty({}, getPath(prop).slice(1).join('/'), null));
        }
        return true;
      }
    }, {
      key: 'data',
      set: function set(val) {
        this._update(val);
      },
      get: function get() {
        return this._proxify().value;
      }
    }]);

    return RWFireTailBase;
  }(FireTailBase);

  var RWFireTailCell = exports.RWFireTailCell = function (_RWFireTailBase) {
    _inherits(RWFireTailCell, _RWFireTailBase);

    function RWFireTailCell(refFn, init) {
      _classCallCheck(this, RWFireTailCell);

      var _this13 = _possibleConstructorReturn(this, (RWFireTailCell.__proto__ || Object.getPrototypeOf(RWFireTailCell)).call(this, refFn, init));

      (0, _bobtailRx.autoSub)(_this13.refCell.onSet, initCell.bind(_this13));
      return _this13;
    }

    return RWFireTailCell;
  }(RWFireTailBase);

  var RWFireTailList = exports.RWFireTailList = function (_RWFireTailBase2) {
    _inherits(RWFireTailList, _RWFireTailBase2);

    function RWFireTailList(refFn, init) {
      _classCallCheck(this, RWFireTailList);

      var _this14 = _possibleConstructorReturn(this, (RWFireTailList.__proto__ || Object.getPrototypeOf(RWFireTailList)).call(this, refFn, init || {}));

      (0, _bobtailRx.autoSub)(_this14.refCell.onSet, initList.bind(_this14));
      return _this14;
    }

    _createClass(RWFireTailList, [{
      key: 'push',
      value: function push(elem) {
        var ref = this.refCell.raw().ref.push();
        ref.set(elem);
        return ref;
      }
    }]);

    return RWFireTailList;
  }(RWFireTailBase);

  var BaseSyncArray = function (_FireTailBase3) {
    _inherits(BaseSyncArray, _FireTailBase3);

    function BaseSyncArray(refFn) {
      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      _classCallCheck(this, BaseSyncArray);

      var _this15 = _possibleConstructorReturn(this, (BaseSyncArray.__proto__ || Object.getPrototypeOf(BaseSyncArray)).call(this, refFn, init));

      (0, _bobtailRx.autoSub)(_this15.refCell.onSet, function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
            o = _ref8[0],
            n = _ref8[1];

        if (o) {
          o.off();
        }

        _this15._initListeners();
      });
      return _this15;
    }

    _createClass(BaseSyncArray, [{
      key: '_monit',
      value: function _monit(event, method) {
        this.refCell.raw().on(event, method.bind(this));
      }
    }, {
      key: '_initListeners',
      value: function _initListeners() {
        this._monit('child_added', this._serverAdd);
        this._monit('child_removed', this._serverRemove);
        this._monit('child_changed', this._serverChange);
        this._monit('child_moved', this._serverMove);
      }
    }, {
      key: '_serverAdd',
      value: function _serverAdd(snap, prevId) {
        var _this16 = this;

        this._reloading(function () {
          var data = { value: snap.val(), key: snap.key };
          _this16._moveTo(data, prevId);
        });
      }
    }, {
      key: '_serverRemove',
      value: function _serverRemove(snap) {
        var _this17 = this;

        this._reloading(function () {
          var pos = _this17.posByKey(snap.key);
          if (pos !== -1) {
            _this17._proxify().value.splice(pos, 1);
          }
        });
      }
    }, {
      key: '_serverChange',
      value: function _serverChange(snap) {
        var _this18 = this;

        this._reloading(function () {
          var pos = _this18.posByKey(snap.key);
          if (pos !== -1) {
            _this18._proxify().value[pos] = { key: snap.key, value: snap.val() };
          }
        });
      }
    }, {
      key: '_serverMove',
      value: function _serverMove(snap, prevId) {
        var _this19 = this;

        this._reloading(function () {
          var id = snap.key;
          var oldPos = _this19.posByKey(id);
          if (oldPos !== -1) {
            _this19._proxify().value.splice(oldPos, 1);
            _this19._moveTo({ value: snap.val(), key: snap.key }, prevId);
          }
        });
      }
    }, {
      key: '_moveTo',
      value: function _moveTo(data, prevId) {
        var pos = this.posByKey(prevId);
        this._proxify().value.splice(pos + 1, 0, data);
      }
    }, {
      key: 'posByKey',
      value: function posByKey(key) {
        return _underscore2.default.findIndex(this._proxify().value, function (data) {
          return data.key === key;
        });
      }
    }, {
      key: 'keys',
      value: function keys() {
        return _underscore2.default.pluck(this._proxify().value, 'key');
      }
    }, {
      key: 'object',
      value: function object() {
        return _underscore2.default.object(_underscore2.default.zip(this.keys(), this.data));
      }
    }, {
      key: 'raw',
      value: function raw() {
        var _this20 = this;

        return (0, _bobtailRx.snap)(function () {
          return _this20.data;
        });
      }
    }, {
      key: 'data',
      get: function get() {
        return _underscore2.default.pluck(this._proxify().value, 'value');
      }
    }]);

    return BaseSyncArray;
  }(FireTailBase);

  var DepSyncArray = exports.DepSyncArray = function (_BaseSyncArray) {
    _inherits(DepSyncArray, _BaseSyncArray);

    function DepSyncArray(refFn, init) {
      _classCallCheck(this, DepSyncArray);

      var _this21 = _possibleConstructorReturn(this, (DepSyncArray.__proto__ || Object.getPrototypeOf(DepSyncArray)).call(this, refFn, init || []));

      _this21._makeReadOnly();
      return _this21;
    }

    return DepSyncArray;
  }(BaseSyncArray);
});

//# sourceMappingURL=main.js.map