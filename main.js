const DB_NAME = 'msgdb';
const DB_VERSION = 1;

Vue.component('frend-list', {
    props: ['frend'],
    template: '<b-button v-on:click="app.getMsgsFrom(event, frend.id)" block>{{ frend.name }}</b-button>'
})

Vue.component('msg-list', {
    props: ['msg'],
    template: '<b-card class="mb-2" :class="msg.class" :header="msg.from" header-tag="header" :footer="msg.datetime" footer-tag="footer" title="Title"><b-card-text>{{ msg.text }}</b-card-text></b-card>'
})

var app = new Vue({
    el: '#app',
    data: {
      message: 'WEB-RTC msg in Vue!',
      frendsList: [],
      msgs: [],
      db:null,
      ready:false,
      addDisabled:false
    },
    async created() {
        this.db = await this.getDb();
        this.frendsList = await this.getFrendsFromDb();
        this.msgs = await this.getMsgsFromDb();
        this.ready = true;
    },
    methods: {
        getMsgsFrom: function (event, id) {
            console.log(event.target.textContent, id)
            //this.addFrend(event.target.textContent);
            //this.deleteFrend(id);
            this.addMsg('Hi!', 'Bob')
        },

        // Работа с БД

          async addFrend(name) {
            this.addDisabled = true;
            let frend = {
              name: name
            };
            console.log('Add frend to DB: '+JSON.stringify(frend));
            await this.addFrendToDb(frend);
            this.frendsList = await this.getFrendsFromDb();
            this.addDisabled = false;      
          },

          async deleteFrend(id) {
            await this.deleteFrendFromDb(id);
            this.frendsList = await this.getFrendsFromDb();      
          },

          async addMsg(text, from) {
            this.addDisabled = true;
            let nowStr = new Date().toLocaleString();
            let msg = {
              datetime: nowStr,
              text: text,
              from: from,
              class: "text-left"
            };
            console.log('Add msg to DB: '+JSON.stringify(msg));
            await this.addMsgToDb(msg);
            this.msgs = await this.getMsgsFromDb();
            this.addDisabled = false;      
          },

          async deleteFrend(id) {
            await this.deleteMsgFromDb(id);
            this.msgs = await this.getMsgsFromDb();      
          },

          // Методы БД

          async addFrendToDb(frend) {
            return new Promise((resolve, reject) => {
              let trans = this.db.transaction(['frends'],'readwrite');
              trans.oncomplete = e => {
                resolve();
              };
              let store = trans.objectStore('frends');
              store.add(frend);
            });
          },

          async addMsgToDb(msg) {
            return new Promise((resolve, reject) => {
              let trans = this.db.transaction(['msgs'],'readwrite');
              trans.oncomplete = e => {
                resolve();
              };
              let store = trans.objectStore('msgs');
              store.add(msg);
            });
          },

          async deleteFrendFromDb(id) {
            return new Promise((resolve, reject) => {
              let trans = this.db.transaction(['frends'],'readwrite');
              trans.oncomplete = e => {
                resolve();
              };
              let store = trans.objectStore('frends');
              store.delete(id);
            });
          },

          async deleteMsgFromDb(id) {
            return new Promise((resolve, reject) => {
              let trans = this.db.transaction(['msgs'],'readwrite');
              trans.oncomplete = e => {
                resolve();
              };
              let store = trans.objectStore('msgs');
              store.delete(id);
            });
          },

          async getFrendsFromDb() {
            return new Promise((resolve, reject) => {
              let trans = this.db.transaction(['frends'],'readonly');
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
          },

          async getMsgsFromDb() {
            return new Promise((resolve, reject) => {
              let trans = this.db.transaction(['msgs'],'readonly');
              trans.oncomplete = e => {
                resolve(msgs);
              };
              let store = trans.objectStore('msgs');
              let msgs = [];
              store.openCursor().onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                  msgs.push(cursor.value)
                  cursor.continue();
                }
              };
            });
          },

          async getDb() {
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

        //
    }
})
