(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('bobtail-deep-cell', ['exports', 'bobtail-rx', 'bobtail-json-cell', 'lodash.set'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('bobtail-rx'), require('bobtail-json-cell'), require('lodash.set'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.rx, global.bobtailJsonCell, global.lodashSet);
    global.bobtailDeepCell = mod.exports;
  }
})(this, function (exports, _bobtailRx, _bobtailJsonCell, _lodash) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RWFireTailList = exports.RWFireTailCell = exports.DepFireTailList = exports.DepFireTailCell = undefined;

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

  var listEvents = {
    child_added: function child_added(data) {
      var _this = this;

      return this._updating(function () {
        return (0, _lodash2.default)(_this, ['data', data.key], data.val());
      });
    },
    child_changed: function child_changed(data) {
      var _this2 = this;

      return this._updating(function () {
        return (0, _lodash2.default)(_this2, ['data', data.key], data.val());
      });
    },
    child_removed: function child_removed(data) {
      var _this3 = this;

      return this._updating(function () {
        return delete _this3.data[data.key];
      });
    }
  };

  var FireTailBase = function (_ObsJsonCell) {
    _inherits(FireTailBase, _ObsJsonCell);

    function FireTailBase(refFn) {
      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, FireTailBase);

      var _this4 = _possibleConstructorReturn(this, (FireTailBase.__proto__ || Object.getPrototypeOf(FireTailBase)).call(this, init));

      _this4.refFn = refFn;
      _this4.refCell = (0, _bobtailRx.bind)(_this4.refFn);
      return _this4;
    }

    _createClass(FireTailBase, [{
      key: 'destroy',
      value: function destroy() {
        this.refCell.raw().off();
        this.refCell.disconnect();
        this.onChange.subs = {};
      }
    }]);

    return FireTailBase;
  }(_bobtailJsonCell.ObsJsonCell);

  var DepFireTailBase = function (_FireTailBase) {
    _inherits(DepFireTailBase, _FireTailBase);

    function DepFireTailBase() {
      _classCallCheck(this, DepFireTailBase);

      return _possibleConstructorReturn(this, (DepFireTailBase.__proto__ || Object.getPrototypeOf(DepFireTailBase)).apply(this, arguments));
    }
    // FIXME: figure out some way to do this via inheritance rather than copy-paste from bobtail-json-cell.


    _createClass(DepFireTailBase, [{
      key: 'setProperty',
      value: function setProperty(getPath, basePath, obj, prop, val) {
        if (!this._nowUpdating) {
          throw new DepMutationError("Cannot mutate DepJsonCell!");
        } else return _get(DepFireTailBase.prototype.__proto__ || Object.getPrototypeOf(DepFireTailBase.prototype), 'setProperty', this).call(this, getPath, basePath, obj, prop, val);
      }
    }, {
      key: 'deleteProperty',
      value: function deleteProperty(getPath, basePath, obj, prop) {
        if (!this._nowUpdating) {
          throw new DepMutationError("Cannot mutate DepJsonCell!");
        } else return _get(DepFireTailBase.prototype.__proto__ || Object.getPrototypeOf(DepFireTailBase.prototype), 'deleteProperty', this).call(this, getPath, basePath, obj, prop);
      }
    }]);

    return DepFireTailBase;
  }(FireTailBase);

  var DepFireTailCell = exports.DepFireTailCell = function (_DepFireTailBase) {
    _inherits(DepFireTailCell, _DepFireTailBase);

    function DepFireTailCell(refFn) {
      var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, DepFireTailCell);

      var _this6 = _possibleConstructorReturn(this, (DepFireTailCell.__proto__ || Object.getPrototypeOf(DepFireTailCell)).call(this, refFn, init));

      (0, _bobtailRx.autoSub)(_this6.refCell.onSet, function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            o = _ref2[0],
            n = _ref2[1];

        if (o) {
          o.off(); // turn off old listeners, if any
        }
        n.on('value', function (data) {
          return _this6._update(data.val());
        });
      });
      return _this6;
    }

    return DepFireTailCell;
  }(DepFireTailBase);

  var DepFireTailList = exports.DepFireTailList = function (_DepFireTailBase2) {
    _inherits(DepFireTailList, _DepFireTailBase2);

    function DepFireTailList(refFn, init) {
      _classCallCheck(this, DepFireTailList);

      var _this7 = _possibleConstructorReturn(this, (DepFireTailList.__proto__ || Object.getPrototypeOf(DepFireTailList)).call(this, refFn, init || {}, listEvents));

      _this7._loadPromise = null;
      (0, _bobtailRx.autoSub)(_this7.refCell.onSet, function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            o = _ref4[0],
            n = _ref4[1];

        if (o) {
          o.off(); // turn off old listeners, if any
        }
        _this7._loadPromise = n.once('value').then(function (data) {
          _this7._update(data.val());
          var entries = Object.entries(listEvents);
          (0, _bobtailRx.transaction)(function () {
            return _this7._updating(function () {
              return entries.forEach(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    ev = _ref6[0],
                    handler = _ref6[1];

                return n.on(ev, handler.bind(_this7));
              });
            });
          });
        });
      });
      return _this7;
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
        if (true || !this._nowUpdating) {
          var path = getPath(prop).slice(1).join('/');
          this.refCell.raw().update(_defineProperty({}, path, val));
        }
        return true;
      }
    }, {
      key: 'deleteProperty',
      value: function deleteProperty(getPath, basePath, obj, prop) {
        _get(RWFireTailBase.prototype.__proto__ || Object.getPrototypeOf(RWFireTailBase.prototype), 'deleteProperty', this).call(this, getPath, basePath, obj, prop);
        if (true || !this._nowUpdating) {
          this.refCell.raw().update(_defineProperty({}, getPath(prop).slice(1).join('/'), null));
        }
        return true;
      }
    }]);

    return RWFireTailBase;
  }(FireTailBase);

  var RWFireTailCell = exports.RWFireTailCell = function (_RWFireTailBase) {
    _inherits(RWFireTailCell, _RWFireTailBase);

    function RWFireTailCell(refFn, init) {
      _classCallCheck(this, RWFireTailCell);

      var _this9 = _possibleConstructorReturn(this, (RWFireTailCell.__proto__ || Object.getPrototypeOf(RWFireTailCell)).call(this, refFn, init));

      (0, _bobtailRx.autoSub)(_this9.refCell.onSet, function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
            o = _ref8[0],
            n = _ref8[1];

        if (o) {
          o.off(); // turn off old listeners, if any
        }
        n.on('value', function (data) {
          return _this9._update(data.val());
        });
      });
      return _this9;
    }

    return RWFireTailCell;
  }(RWFireTailBase);

  var RWFireTailList = exports.RWFireTailList = function (_RWFireTailBase2) {
    _inherits(RWFireTailList, _RWFireTailBase2);

    function RWFireTailList(refFn, init) {
      _classCallCheck(this, RWFireTailList);

      var _this10 = _possibleConstructorReturn(this, (RWFireTailList.__proto__ || Object.getPrototypeOf(RWFireTailList)).call(this, refFn, init || {}, listEvents));

      _this10._loadPromise = null;
      (0, _bobtailRx.autoSub)(_this10.refCell.onSet, function (_ref9) {
        var _ref10 = _slicedToArray(_ref9, 2),
            o = _ref10[0],
            n = _ref10[1];

        if (o) {
          o.off(); // turn off old listeners, if any
        }
        _this10._loadPromise = n.once('value').then(function (data) {
          _this10._update(data.val());
          var entries = Object.entries(listEvents);
          entries.forEach(function (_ref11) {
            var _ref12 = _slicedToArray(_ref11, 2),
                ev = _ref12[0],
                handler = _ref12[1];

            return n.on(ev, handler.bind(_this10));
          });
        });
      });
      return _this10;
    }

    _createClass(RWFireTailList, [{
      key: 'push',
      value: function push(elem) {
        var ref = this.refCell.raw().push();
        ref.set(elem);
        return ref;
      }
    }]);

    return RWFireTailList;
  }(RWFireTailBase);
});

//# sourceMappingURL=main.js.map