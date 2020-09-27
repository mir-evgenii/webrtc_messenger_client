const DB_NAME = 'msgdb';
const DB_VERSION = 1;

const MY_NAME = 'I am';

Vue.component('frend-list', {
    props: ['frend'],
    template: '<b-button v-on:click="app.getMsgsFrom(event, frend.id)" block>{{ frend.name }}</b-button>'
})

Vue.component('msg-list', {
    props: ['msg'],
    template: '<b-card class="mb-2" :class="msg.class" :header="msg.from" header-tag="header" :footer="msg.datetime" footer-tag="footer"><b-card-text>{{ msg.text }}</b-card-text></b-card>'
})

var app = new Vue({
    el: '#app',
    data: {
      message: 'WEB-RTC msg in Vue!',
      frendsList: [],
      msgs: [],
      sendMsgText: '',
      db:null,

      name:'',
      nameState: null,

      ready:false,
      addDisabled:false,
      frend:false
    },
    async created() {
        this.db = await this.getDb();
        this.frendsList = await this.getFrendsFromDb();
        this.ready = true;
    },
    methods: {

      checkFormValidity() {
        const valid = this.$refs.form.checkValidity()
        this.nameState = valid
        return valid
      },
      resetModal() {
        this.name = ''
        this.nameState = null
      },
      handleOk(bvModalEvt) {
        // Prevent modal from closing
        bvModalEvt.preventDefault()
        // Trigger submit handler
        this.handleSubmit()
      },
      handleSubmit() {
        // Exit when the form isn't valid
        if (!this.checkFormValidity()) {
          return
        }
        // Push the name to submitted names
        this.addFrend(this.name);
        // Hide the modal manually
        this.$nextTick(() => {
          this.$bvModal.hide('modal-add-frend')
        })
      },


        sendMsg: async function () {
          this.addMsg(this.sendMsgText, 'I am', this.frend);
          this.sendMsgText = '';
          this.msgs = await this.getMsgsFromDb(this.frend);
        },

        addFrend: async function() {

        },

        getMsgsFrom: async function (event, id) {
            console.log(event.target.textContent, id)
            //this.addFrend(event.target.textContent);
            //this.deleteFrend(id);
            //this.addMsg('Hi!', 'Bob', 'I am');
            
            this.frend = event.target.textContent;
            // this.msgs = [];
            this.msgs = await this.getMsgsFromDb(this.frend);
            console.log(this.msgs);
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

          async addMsg(text, from, to) {
            this.addDisabled = true;
            let nowStr = new Date().toLocaleString();
            let msg = {
              datetime: nowStr,
              text: text,
              from: from,
              to: to
            };
            console.log('Add msg to DB: '+JSON.stringify(msg));
            await this.addMsgToDb(msg);
            this.msgs = await this.getMsgsFromDb(this.frend);
            this.addDisabled = false;      
          },

          async deleteFrend(id) {
            await this.deleteMsgFromDb(id);
            this.msgs = await this.getMsgsFromDb(this.frend);      
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

          async getMsgsFromDb(frend) {
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
