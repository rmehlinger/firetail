import {autoSub, bind, snap, transaction} from 'bobtail-rx';
import {ObsJsonCell, SrcJsonCell} from 'bobtail-json-cell';
import safeSet from 'lodash.set';

let listEvents = {
  child_added(data){
    return this._updating(() => safeSet(this, ['data', data.key], data.val()));
  },
  child_changed(data){
    return this._updating(() => safeSet(this, ['data', data.key], data.val()));
  },
  child_removed(data){
    return this._updating(() => delete this.data[data.key]);
  }
};

class FireTailBase extends ObsJsonCell {
  constructor(refFn, init=null) {
    super(init);
    this.refFn = typeof refFn === 'function' ? refFn: () => refFn;
    this.refCell = bind(this.refFn);
  }
}

class DepFireTailBase extends FireTailBase {
  constructor() {
    super(...arguments);
  }
  // FIXME: figure out some way to do this via inheritance rather than copy-paste from bobtail-json-cell.
  setProperty(getPath, basePath, obj, prop, val) {
    if (!this._nowUpdating) {
      throw new DepMutationError("Cannot mutate DepJsonCell!");
    }
    else return super.setProperty(getPath, basePath, obj, prop, val);
  }

  deleteProperty(getPath, basePath, obj, prop) {
    if (!this._nowUpdating) {
      throw new DepMutationError("Cannot mutate DepJsonCell!");
    }
    else return super.deleteProperty(getPath, basePath, obj, prop);
  }
}

export class DepFireTailCell extends DepFireTailBase {
  constructor(refFn, init=null) {
    super(refFn, init);
    autoSub(this.refCell.onSet, ([o, n]) => {
      if(o) {
        o.off();  // turn off old listeners, if any
      }
      n.on('value', data => this._update(data.val()));
    });
  }
}

export class DepFireTailList extends DepFireTailBase {
  constructor(refFn, init) {
    super(refFn, init || {}, listEvents);
    this._loadPromise = null;
    autoSub(this.refCell.onSet, ([o, n]) => {
      if(o) {
        o.off();  // turn off old listeners, if any
      }
      this._loadPromise = n.once('value').then(data => {
        this._update(data.val());
        let entries = Object.entries(listEvents);
        transaction(() => this._updating(() => entries.forEach(([ev, handler]) => n.on(ev, handler.bind(this)))));
      });
    });
  }
}

class RWFireTailBase extends FireTailBase {
  constructor(refFn, init, events) {
    super(refFn, init, events);
  }
  setProperty (getPath, basePath, obj, prop, val) {
    super.setProperty(getPath, basePath, obj, prop, val);
    if(true || !this._nowUpdating) {
      let path = getPath(prop).slice(1).join('/');
      this.refCell.raw().update({[path]: val});
    }
    return true;
  }
  deleteProperty (getPath, basePath, obj, prop) {
    super.deleteProperty(getPath, basePath, obj, prop);
    if(true || !this._nowUpdating) {
      this.refCell.raw().update({[getPath(prop).slice(1).join('/')]: null});
    }
    return true;
  }
  set data(val) {this._update(val);}
  get data() {return this._data.value;}
}

export class RWFireTailCell extends RWFireTailBase {
  constructor(refFn, init) {
    super(refFn, init);
    autoSub(this.refCell.onSet, ([o, n]) => {
      if(o) {
        o.off();  // turn off old listeners, if any
      }
      n.on('value', data => {
        this._update(data.val());
      });
    });
  }
}

export class RWFireTailList extends RWFireTailBase {
  constructor(refFn, init) {
    super(refFn, init || {}, listEvents);
    this._loadPromise = null;
    autoSub(this.refCell.onSet, ([o, n]) => {
      if(o) {
        o.off();  // turn off old listeners, if any
      }
      this._loadPromise = n.once('value').then(data => {
        this._update(data.val());
        let entries = Object.entries(listEvents);
        entries.forEach(([ev, handler]) => n.on(ev, handler.bind(this)));
      });
    });
  }
  push(elem) {
    let ref = this.refCell.raw().push();
    ref.set(elem);
    return ref;
  }
}