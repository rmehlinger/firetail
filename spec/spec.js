jasmine.CATCH_EXCEPTIONS = false;
import {DepFireTailCell, DepFireTailList, RWFireTailCell, RWFireTailList} from '../src/main.js';
import * as firebase from 'firebase';
import * as rx from 'bobtail-rx';

let FirebaseServer = require('firebase-server');

new FirebaseServer(5000, 'test.firebase.localhost', {
  /* You can put your initial data model here, or just leave it empty */
});

let app = firebase.initializeApp({
  databaseURL: 'ws://test.firebaseio.localhost:5000',
});
let db = app.database();

Error.stackTraceLimit = Infinity;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});


describe('DepFireTailCell', () => {
  let fieldVal, fieldKey, peopleCell;

  beforeEach(() => {
    fieldKey = rx.cell("people");
    fieldVal = () => {
      let ref = db.ref(fieldKey.get());
      return ref;
    };
    db.ref('people').set({"Joe": {id: 0, age: 50}});
    db.ref('cats').set({"Maple": {id: 0, age: 2}});
    peopleCell = new DepFireTailCell(fieldVal);
  });
  it('should update when Firebase value of ref changes', () => {
    expect(firebase).toBeTruthy();
    expect(peopleCell.data).toEqual({"Joe": {id: 0, age: 50}});
    fieldVal().update({
      "Fred": {id: 1, age: 40},
      "Bob": {id: 2, age: 60}
    });
    expect(peopleCell.data).toEqual({
      Joe: {id: 0, age: 50},
      Fred: {id: 1, age: 40},
      Bob: {id: 2, age: 60}
    });
  });
  it('should update when Firebase ref is deleted', () => {
    fieldVal().remove();
    expect(peopleCell.data).toBeNull();
  });
  it('should update when its ref changes', () => {
    fieldKey.set('cats');
    expect(peopleCell.data).toEqual({"Maple": {id: 0, age: 2}});
  });
});

describe('DepFireTailList', () => {
  let fieldVal, fieldKey, peopleCell, people, cats;

  beforeEach(() => {
    fieldKey = rx.cell("people");
    fieldVal = () => db.ref(fieldKey.get());
    people = db.ref('people');
    people.set({});
    cats = db.ref('cats');
    cats.set({});
    db.ref('people').push({name: "Joe", id: 0, age: 50});
    db.ref('cats').push({name: "Maple", id: 0, age: 2});
    peopleCell = new DepFireTailList(fieldVal);
  });
  it('should update when Firebase children of ref change', (done) => {
    setTimeout(() => {
      expect(Object.values(peopleCell.data)).toEqual([{name: "Joe", id: 0, age: 50}]), 100
      people.push().set({name: "Fred", id: 1, age: 40});
      people.push().set({name: "Bob", id: 2, age: 60});
      setTimeout(() => {
        expect(Object.values(peopleCell.data)).toEqual([
          {name: "Joe", id: 0, age: 50},
          {name: "Fred", id: 1, age: 40},
          {name: "Bob", id: 2, age: 60}
        ]);
        done();
      }, 100)
    });
  });
  it('should update when Firebase ref is deleted', () => {
    people.remove();
    expect(peopleCell.data).toEqual({});
  });
  it('should update when its ref changes', (done) => {
    fieldKey.set('cats');
    peopleCell._loadPromise.then(() => {
      expect(Object.values(peopleCell.data)).toEqual([{name: "Maple", id: 0, age: 2}]);
      done();
    });
  });
});

describe('RWFireTailCell', () => {
  let fieldVal, fieldKey, peopleCell, people;

  beforeEach(() => {
    fieldKey = rx.cell("people");
    fieldVal = () => {
      return db.ref(fieldKey.get());
    };
    db.ref('people').set({"Joe": {id: 0, age: 50}});
    db.ref('cats').set({"Maple": {id: 0, age: 2}});
    peopleCell = new RWFireTailCell(fieldVal);
  });
  it('should update when Firebase value of ref changes', () => {
    expect(peopleCell.data).toEqual({Joe: {id: 0, age: 50}});
    db.ref('people').update({
      "Fred": {id: 1, age: 40},
      "Bob": {id: 2, age: 60}
    });
    expect(peopleCell.data).toEqual({
      "Joe": {id: 0, age: 50},
      "Fred": {id: 1, age: 40},
      "Bob": {id: 2, age: 60}
    });
  });
  it('should update Firebase when it is mutated', (done) => {
    expect(peopleCell.data).toEqual({Joe: {id: 0, age: 50}});

    peopleCell.data.Joe.age = 51;
    db.ref('people/Joe/age').once('value').then(data => {
      expect(data.val()).toBe(51);
      done();
    });
  });
  it('should update Firebase on deletion', (done) => {
    expect(peopleCell.data).toEqual({Joe: {id: 0, age: 50}});

    delete peopleCell.data.Joe.age;
    db.ref('people/Joe/age').once('value').then(data => {
      expect(data.val()).toBeNull();
      db.ref('people/Joe').once('value').then(data => {
        expect(data.val()).toEqual({id: 0});
        done();
      });
    });
  });
});

describe('RWFireTailList', () => {
  let fieldVal, fieldKey, peopleCell, people, cats;
  let i = 0;
  beforeEach((done) => {
    fieldKey = rx.cell("people2");
    fieldVal = () => db.ref(fieldKey.get());
    people = db.ref('people2');
    cats = db.ref('cats2');
    cats.transaction(() => {
      cats.set({});
      cats.push().set({name: "Maple", id: 0, age: 2});
    }).then(() => {
      people.transaction(() => {
        people.set({});
        people.push().set({name: "Joe", id: 0, age: 50});
      }).then(() => {
        peopleCell = new RWFireTailList(fieldVal);
        done();
      });
    });
  });
  it('should update firebase on writes', (done) => {
    peopleCell._loadPromise.then(() => {
      peopleCell.data[Object.keys(peopleCell.data)[0]].age = 51
      setTimeout(() => {
        expect(Object.values(peopleCell.data)).toEqual([{name: "Joe", id: 0, age: 51}]);
        people.once('value').then(data => {
          expect(Object.values(data.val())).toEqual([{name: "Joe", id: 0, age: 51}]);
          done();
        });
      }, 100);
    });
  });
  it('should be able to push new elements', (done) => {
    peopleCell._loadPromise.then(() => {
      peopleCell.push("foo");
      expect(Object.values(peopleCell.data).includes('foo')).toBe(true);
      people.once('value').then(data => {
        expect(Object.values(data.val()).includes('foo')).toBe(true)
        done();
      });
    });
  });

  it('should update when Firebase children of ref change', (done) => {
    setTimeout(() => {
      expect(Object.values(peopleCell.data)).toEqual([{name: "Joe", id: 0, age: 50}]);
      people.push().set({name: "Fred", id: 1, age: 40});
      people.push().set({name: "Bob", id: 2, age: 60});
      setTimeout(() => {
        expect(Object.values(peopleCell.data)).toEqual([
          {name: "Joe", id: 0, age: 50},
          {name: "Fred", id: 1, age: 40},
          {name: "Bob", id: 2, age: 60}
        ]);
        done();
      }, 100);
    });
  });
  it('should update when Firebase ref is deleted', () => {
    people.remove();
    expect(peopleCell.data).toEqual({});
  });
  it('should update when its ref changes', (done) => {
    fieldKey.set('cats2');
    peopleCell._loadPromise.then(() => {
      expect(Object.values(peopleCell.data)).toEqual([{name: "Maple", id: 0, age: 2}]);
      done();
    }, (error) => console.error(error));
  });
});

describe('primitives', () => {
  let prims, a;
  beforeEach(() => {
    prims = db.ref('prims');
    prims.set({a: 0, b: 1});
    a = db.ref('prims/a');
  });
  it('should work with DepFireTailCells', (done) => {
    let aCell = new DepFireTailCell(() => a);
    setTimeout(() => {
      expect(aCell.data).toBe(0);
      a.set(1);
      setTimeout(() => {
        expect(aCell.data).toBe(1);
        done();
      }, 100);
    }, 100);
  });
  it('should work with RWFireTailCells', (done) => {
    let aCell = new RWFireTailCell(() => a);
    setTimeout(() => {
      expect(aCell.data).toBe(0);
      a.set(1);
      setTimeout(() => {
        expect(aCell.data).toBe(1);
        aCell.data = 2;
        setTimeout(() => {
          a.once('value').then(data => expect(data.val()).toBe(2));
          done();
        }, 100)
      }, 100);
    }, 100);
  });
  it('should work as elements of DepFireTailLists', (done) => {
    let primsList = new DepFireTailList(() => prims);
    setTimeout(() => {
      expect(primsList.data).toEqual({a: 0, b: 1});
      prims.push().set(42);
      setTimeout(() => {
        expect(Object.values(primsList.data)).toEqual([0, 1, 42]);
        done();
      }, 100);
    }, 100);
  });
  it('should work as elements of RWFireTailLists', (done) => {
    let primsList = new RWFireTailList(() => prims);
    setTimeout(() => {
      expect(primsList.data).toEqual({a: 0, b: 1});
      primsList.push(2);
      setTimeout(() => {
        expect(Object.values(primsList.data)).toEqual([0, 1, 2]);
        primsList.data.a = -1;
        setTimeout(() => {
          a.once('value').then(data => expect(data.val()).toEqual(-1));
          expect(Object.values(primsList.data)).toEqual([-1, 1, 2]);
          done();
        }, 100);
      }, 100);
    }, 100);
  });
});