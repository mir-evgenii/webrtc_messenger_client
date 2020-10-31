// import {sayHi} from './DB.js';

const DB_NAME = 'msgdb';
const DB_VERSION = 1;

const MY_NAME = 'I am';

// sayHi();

Vue.component('frend-list', {
    props: ['frend'],
    template: '<b-button v-on:click="app.getMsgsFrom(frend)" block>{{ frend.name }}</b-button>'
})

Vue.component('frend-list-dropdown', {
  props: ['frend'],
  template: '<b-dropdown-item v-on:click="app.getMsgsFrom(frend)">{{ frend.name }}<b-dropdown-item>'
})

Vue.component('msg-list', {
    props: ['msg'],
    template: `
      <b-card class="mb-2" :class="msg.class">
        <b-card-text class="mb-0 small text-muted">{{ msg.from }}</b-card-text>
        <b-card-text class="mb-0">{{ msg.text }}</b-card-text>
        <b-card-text class="mb-0 small text-muted"><em>{{ msg.datetime }}</em></b-card-text>
      </b-card>`
})

var app = new Vue({
    el: '#app',
    data: {
      message: 'WEB-RTC msg in Vue!',
      frendsList: [],
      msgs: [],
      sendMsgText: '',
      db:null,

      showDismissibleAlert: true,

      name:'',
      nameState: null,

      ready:false,
      addDisabled:false,
      frend:false,
      frendId:false,
      frendListVisible: true
    },
    async created() {
        this.db = await this.getDb();
        this.frendsList = await this.getFrendsFromDb();
        this.ready = true;
        this.isMobile = false;
        this.brouser = false;
        this.detectDevice();
    },
    methods: {

      frendList() {
        this.frendListVisible = !this.frendListVisible;
      },

      detectDevice() {
        let detect = new MobileDetect(window.navigator.userAgent);
        if (detect.phone()) {
          this.isMobile = true;
        }
        // console.log("Mobile: " + detect.mobile());       // телефон или планшет 
        // console.log("Phone: " + detect.phone());         // телефон 
        // console.log("Tablet: " + detect.tablet());       // планшет 
        // console.log("OS: " + detect.os());               // операционная система 
        // console.log("userAgent: " + detect.userAgent()); // userAgent
      },

      // -------------- Add frends metods ----------------------

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

      // -------------- del frend ------------

      handleDel() {
        this.deleteFrend(this.frend.id);
        this.frend = false;
        //this.frendId = false;
      },

      // --------------- edit frend -------------------

      handleEdit() {
        this.editFrend(this.frend);
      },

      // --------------- del all msg -------------------

      handleDelAllMsg() {
        
      },

      // --------------- Metods ------------------------

        sendMsg: async function () {
          this.addMsg(this.sendMsgText, 'I am', this.frend.name);
          this.sendMsgText = '';
          this.msgs = await this.getMsgsFromDb(this.frend.name);
        },

        getFrend: async function() {
          this.getFrendFromDb(this.frend.id);
        },

        back: function() {
          this.frend = false;
          sayHi();
        },

        getMsgsFrom: async function (frend) {            
            //this.frend = frend.name;
            //this.frendId = frend.id;
            this.frend = frend;
            this.msgs = await this.getMsgsFromDb(this.frend.name);
        },

        // ------------------- Работа с БД -------------------------

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

          async editFrend(frend) {
            this.addDisabled = true;
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
            this.msgs = await this.getMsgsFromDb(this.frend.name);
            this.addDisabled = false;      
          },

          async deleteMsg(id) {
            await this.deleteMsgFromDb(id);
            this.msgs = await this.getMsgsFromDb(this.frend.name);      
          },

          // -------------------- Методы БД -------------------------

          async addFrendToDb(frend) {
            return new Promise((resolve, reject) => {
              let trans = this.db.transaction(['frends'],'readwrite');
              trans.oncomplete = e => {
                resolve();
              };
              let store = trans.objectStore('frends');
              //store.add(frend);
              store.put(frend);
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
