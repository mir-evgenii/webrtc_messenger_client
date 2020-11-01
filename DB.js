// Функции работы с БД

async function addFrendToDb(db, frend) {
  return new Promise((resolve, reject) => {
    let trans = db.transaction(['frends'],'readwrite');
    trans.oncomplete = e => {
      resolve();
    };
    let store = trans.objectStore('frends');
    //store.add(frend);
    store.put(frend);
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

async function deleteFrendFromDb(db, id) {
  return new Promise((resolve, reject) => {
    let trans = db.transaction(['frends'],'readwrite');
    trans.oncomplete = e => {
      resolve();
    };
    let store = trans.objectStore('frends');
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

async function getFrendsFromDb(db) {
  return new Promise((resolve, reject) => {
    let trans = db.transaction(['frends'],'readonly');
    trans.oncomplete = e => {
      resolve(frends);
    };
    let store = trans.objectStore('frends');
    let frends = [];
    store.openCursor().onsuccess = e => {
      let cursor = e.target.result;
      if (cursor) {
        frends.push(cursor.value)
        cursor.continue();
      }
    };
  });
}

async function getMsgsFromDb(db, frend) {
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
        if (cursor.value.from == frend || cursor.value.to == frend) {
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
      let objectStoreFrends = db.createObjectStore("frends", { autoIncrement: true, keyPath:'id' });
      let objectStoreMsgs = db.createObjectStore("msgs", { autoIncrement: true, keyPath:'id' });
    };
  });
}

