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

Error.stackTraceLimit = 20;


describe('DepFireTailCell', () => {
  let fieldVal, fieldKey, peopleCell;

  beforeEach(() => {
    fieldKey = rx.cell("people");
    fieldVal = () => {
      return db.ref(fieldKey.get());
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
  it('should update when Firebase children of ref change', () => {
    expect(Object.values(peopleCell.data)).toEqual([{name: "Joe", id: 0, age: 50}]);
    people.push({name: "Fred", id: 1, age: 40});
    people.push({name: "Bob", id: 2, age: 60});
    expect(Object.values(peopleCell.data)).toEqual([
      {name: "Joe", id: 0, age: 50},
      {name: "Fred", id: 1, age: 40},
      {name: "Bob", id: 2, age: 60}
    ]);
  });
  it('should update when Firebase ref is deleted', () => {
    people.remove();
    expect(peopleCell.data).toBeNull();
  });
  it('should update when its ref changes', () => {
    fieldKey.set('cats');
    expect(Object.values(peopleCell.data)).toEqual([{name: "Maple", id: 0, age: 2}]);
  });
});

describe('RWFireTailList', () => {
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
    peopleCell = new RWFireTailList(fieldVal, data => data.orderByKey());
  });

  it('should update firebase on writes', () => {

  });
});

describe('RWFireTailCell', () => {
  let fieldVal, fieldKey, peopleCell, people, cats;

  beforeEach(() => {
    fieldKey = rx.cell("people");
    fieldVal = () => db.ref(fieldKey.get());
    db.ref('people').set({"Joe": {id: 0, age: 50}});
    db.ref('cats').set({"Maple": {id: 0, age: 2}});
    people = db.ref('people');
    cats = db.ref('cats');
    peopleCell = new RWFireTailCell(fieldVal);
  });
  fit('should update when Firebase value of ref changes', () => {
    expect(Object.values(peopleCell.data)).toEqual([{name: "Joe", id: 0, age: 50}]);
    people.push({name: "Fred", id: 1, age: 40});
    people.push({name: "Bob", id: 2, age: 60});
    expect(Object.values(peopleCell.data)).toEqual([
      {name: "Joe", id: 0, age: 50},
      {name: "Fred", id: 1, age: 40},
      {name: "Bob", id: 2, age: 60}
    ]);
  });
  it('should update Firebase when it is mutated', () => {
  });
});
