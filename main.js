
const DB_NAME = 'msgdb';
const DB_VERSION = 1;

const MY_NAME = 'I am';

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
        this.db = await getDb();
        this.frendsList = await getFrendsFromDb(this.db);
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
        bvModalEvt.preventDefault()
        this.handleSubmit()
      },

      handleSubmit() {
        if (!this.checkFormValidity()) {
          return
        }
        this.addFrend(this.name);
        this.$nextTick(() => {
          this.$bvModal.hide('modal-add-frend')
        })
      },

      // -------------- del frend ------------

      handleDel() {
        this.deleteFrend(this.frend.id);
        this.frend = false;
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
          this.msgs = await getMsgsFromDb(this.db, this.frend.name);
        },

        getFrend: async function() {
          this.getFrendFromDb(this.frend.id);
        },

        back: function() {
          this.frend = false;
          sayHi();
        },

        getMsgsFrom: async function (frend) {            
            this.frend = frend;
            this.msgs = await getMsgsFromDb(this.db, this.frend.name);
        },

        // ------------------- Работа с БД -------------------------

          async addFrend(name) {
            this.addDisabled = true;
            let frend = {
              name: name
            };
            console.log('Add frend to DB: '+JSON.stringify(frend));
            await addFrendToDb(this.db, frend);
            this.frendsList = await getFrendsFromDb(this.db);
            this.addDisabled = false;      
          },

          async editFrend(frend) {
            this.addDisabled = true;
            await addFrendToDb(this.db, frend);
            this.frendsList = await getFrendsFromDb(this.db);
            this.addDisabled = false;
          },

          async deleteFrend(id) {
            await deleteFrendFromDb(this.db, id);
            this.frendsList = await getFrendsFromDb(this.db);      
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
            await addMsgToDb(this.db, msg);
            this.msgs = await getMsgsFromDb(this.db, this.frend.name);
            this.addDisabled = false;      
          },

          async deleteMsg(id) {
            await deleteMsgFromDb(this.db, id);
            this.msgs = await getMsgsFromDb(this.db, this.frend.name);      
          },
    }
})
