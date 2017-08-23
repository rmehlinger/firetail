import {autoSub, bind, snap, transaction} from 'bobtail-rx';
import {ObsJsonCell, DepJsonCell} from 'bobtail-json-cell';
import _ from 'underscore';
import safeSet from 'lodash.set';

let listEvents = {
  child_added(data){
    return this._reloading(() => safeSet(this, ['data', data.key], data.val()));
  },
  child_changed(data){
    return this._reloading(() => safeSet(this, ['data', data.key], data.val()));
  },
  child_removed(data){
    return this._reloading(() => delete this.data[data.key]);
  }
};

function initCell ([o, n]) {
  if(o) {
    o.off();  // turn off old listeners, if any
  }
  return n.on('value', data => this._reload(data.val()));
}

function initList ([o, n]) {
  if(o) {
    o.off();  // turn off old listeners, if any
  }
  let entries = Object.entries(listEvents);
  this._reload({});
  entries.map(([ev, handler]) => n.on(ev, handler.bind(this)));
}

class FireTailBase extends ObsJsonCell {
  constructor(refFn, init=null) {
    super(init);
    this.refFn = typeof refFn === 'function' ? refFn: () => refFn;
    this.refCell = bind(this.refFn);
    this._nowReloading = false;
  }
  _reload(data) {
    this._reloading(() => this._update(data));
  }
  _reloading(f) {
    let _wasReloading = this._nowReloading;
    this._nowReloading = true;
    transaction(() => {
      try {this._updating(f)} finally {
        this._nowReloading = _wasReloading;
      }
    });
  }
}

class DepFireTailBase extends FireTailBase {
  constructor() {
    super(...arguments)._makeReadOnly();
  }
}

export class DepFireTailCell extends DepFireTailBase {
  constructor(refFn, init=null) {
    super(refFn, init);
    autoSub(this.refCell.onSet, initCell.bind(this))
  }
}

export class DepFireTailList extends DepFireTailBase {
  constructor(refFn, init) {
    super(refFn, init || {});
    autoSub(this.refCell.onSet, initList.bind(this));
  }
}


class RWFireTailBase extends FireTailBase {
  constructor(refFn, init, events) {
    super(refFn, init, events);
  }
  setProperty (getPath, basePath, obj, prop, val) {
    super.setProperty(getPath, basePath, obj, prop, val);
    if(!this._nowReloading) {
      let path = getPath(prop).slice(1).join('/');
      this.refCell.raw().ref.update({[path]: val});
    }
    return true;
  }
  deleteProperty (getPath, basePath, obj, prop) {
    super.deleteProperty(getPath, basePath, obj, prop);
    if(!this._nowReloading) {
      this.refCell.raw().ref.update({[getPath(prop).slice(1).join('/')]: null});
    }
    return true;
  }
  set data(val) {this._update(val);}
  get data() {return this._data.value;}
}

export class RWFireTailCell extends RWFireTailBase {
  constructor(refFn, init) {
    super(refFn, init);
    autoSub(this.refCell.onSet, initCell.bind(this));
  }
}

export class RWFireTailList extends RWFireTailBase {
  constructor(refFn, init) {
    super(refFn, init || {});
    autoSub(this.refCell.onSet, initList.bind(this));
  }
  push(elem) {
    let ref = this.refCell.raw().ref.push();
    ref.set(elem);
    return ref;
  }
}

class BaseSyncArray extends FireTailBase {
  constructor(refFn, init=[]) {
    super(refFn, init);

    autoSub(this.refCell.onSet, ([o, n]) => {
      if(o) {o.off();}

      this._initListeners();
    });
  }

  _monit (event, method) {
    this.refCell.raw().on(event, method.bind(this));
  };

  _initListeners () {
    this._monit('child_added', this._serverAdd);
    this._monit('child_removed', this._serverRemove);
    this._monit('child_changed', this._serverChange);
    this._monit('child_moved', this._serverMove);
  };

  _serverAdd (snap, prevId) {
    this._reloading(() => {
      let data = {value: snap.val(), key: snap.key};
      this._moveTo(data, prevId);
    });
  };

  _serverRemove (snap) {
    this._reloading(() => {
      let pos = this.posByKey(snap.key);
      if( pos !== -1 ) {
        let len = this._data.value.length;
        this._data.value.splice(pos, 1);
      }
    });
  };

  _serverChange (snap) {
    this._reloading(() => {
      let pos = this.posByKey(snap.key);
      if( pos !== -1 ) {
        this._data.value[pos] = {key: snap.key, value: snap.val()};
      }
    });
  };

  _serverMove (snap, prevId) {
    this._reloading(() => {
      let id = snap.key;
      let oldPos = this.posByKey(id);
      if( oldPos !== -1 ) {
        this._data.value.splice(oldPos, 1);
        this._moveTo({value: snap.val(), key: snap.key}, prevId);
      }
    });
  };

  _moveTo (data, prevId) {
    let pos = this.posByKey(prevId);
    this._data.value.splice(pos + 1, 0, data);
  };

  posByKey (key) {
    return _.findIndex(this._data.value, (data) => data.key === key)
  };

  keys () {
    return _.pluck(this._data.value, 'key');
  }

  object () {
    return _.object(_.zip(this.keys(), this.data));
  }

  raw () {
    return snap(() => this.data);
  }

  get data() {
    return _.pluck(this._data.value, 'value');
  }
}

export class DepSyncArray extends BaseSyncArray {
  constructor(refFn, init) {
    super(refFn, init || []);
    this._makeReadOnly();
  }
}
