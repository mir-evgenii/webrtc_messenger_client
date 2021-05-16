// Функции работы с БД

async function addfriendToDb(db, friend) {
  return new Promise((resolve, reject) => {
    let trans = db.transaction(['friends'],'readwrite');
    trans.oncomplete = e => {
      resolve();
    };
    let store = trans.objectStore('friends');
    store.put(friend);
  });
}

async function addMsgToDb(db, msg) {
  return new Promise((resolve, reject) => {
    let trans = db.transaction(['msgs'],'readwrite');
    trans.oncomplete = e => {
      resolve();
    };
    let store = trans.objectStore('msgs');
    store.add(msg);
  });
}

async function deletefriendFromDb(db, id) {
  return new Promise((resolve, reject) => {
    let trans = db.transaction(['friends'],'readwrite');
    trans.oncomplete = e => {
      resolve();
    };
    let store = trans.objectStore('friends');
    store.delete(id);
  });
}

async function deleteMsgFromDb(db, id) {
  return new Promise((resolve, reject) => {
    let trans = db.transaction(['msgs'],'readwrite');
    trans.oncomplete = e => {
      resolve();
    };
    let store = trans.objectStore('msgs');
    store.delete(id);
  });
}

async function getfriendsFromDb(db) {
  return new Promise((resolve, reject) => {
    let trans = db.transaction(['friends'],'readonly');
    trans.oncomplete = e => {
      resolve(friends);
    };
    let store = trans.objectStore('friends');
    let friends = [];
    store.openCursor().onsuccess = e => {
      let cursor = e.target.result;
      if (cursor) {
        friends.push(cursor.value)
        cursor.continue();
      }
    };
  });
}

async function getMsgsFromDb(db, friend) {
  return new Promise((resolve, reject) => {
  let trans = db.transaction(['msgs'],'readonly');
    trans.oncomplete = e => {
      resolve(msgs);
    };
    let store = trans.objectStore('msgs');
    let msgs = [];
    store.openCursor().onsuccess = e => {
      let cursor = e.target.result;
      if (cursor) {
        if (cursor.value.from == friend || cursor.value.to == friend) {
          if (cursor.value.from != MY_NAME) {
            cursor.value.class = "text-left"
          } else {
            cursor.value.class = "text-right"
          }
          msgs.push(cursor.value)
          cursor.continue();
        } else {
          cursor.continue();
        }
      }
    };
  });
}

async function getDb() {
  return new Promise((resolve, reject) => {
    let request = window.indexedDB.open(DB_NAME, DB_VERSION);      
    request.onerror = e => {
      console.log('Error opening db', e);
      reject('Error');
    };
    request.onsuccess = e => {
      resolve(e.target.result);
    };      
    request.onupgradeneeded = e => {
      console.log('onupgradeneeded');
      let db = e.target.result;
      let objectStorefriends = db.createObjectStore("friends", { autoIncrement: true, keyPath:'id' });
      let objectStoreMsgs = db.createObjectStore("msgs", { autoIncrement: true, keyPath:'id' });
    };
  });
}

