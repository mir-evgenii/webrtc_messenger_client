
const DB_NAME = 'msgdb';
const DB_VERSION = 1;

const MY_NAME = 'I am';

Vue.component('frend-list', {
    props: ['frend'],
    template: '<b-button v-if="frend.status" v-on:click="app.getMsgsFrom(frend)" block>{{ frend.name }} <b-icon-broadcast-pin v-if="frend.webrtc"></b-icon-broadcast-pin></b-button><b-button v-else v-on:click="app.getMsgsFrom(frend)" variant="outline-secondary" block>{{ frend.name }}</b-button>'
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
      webrtc: [false, ''],

      showDismissibleAlert: true,

      // frend name
      name:'',
      nameState: null,

      // frend public RSA key
      key:'',
      keyState: null,

      ready:false,
      addDisabled:false,
      frend:false,
      frendId:false,
      frendListVisible: true,
      widthMsgList: 9,
      isMobile:false,
      updateInterval:5000, // частота обновления сообщений 5 сек
      boxWebrtcConnection:null, // разрешение от пользователя на соединение по webrtc
      connectedFrendKey:null // ключ пользователя который подключается по webrtc
    },
    async created() {
        this.db = await getDb();
        this.frendsList = await getFrendsFromDb(this.db);
        this.ready = true;
        //this.isMobile = false;
        this.brouser = false;
        this.detectDevice();

        if (getOnline()) { // обновление сообщений // getOnline - api
          await this.updateMsgs();
          await this.updateOnlineFrends();
        } 
    },
    methods: {

      frendList() {
        this.frendListVisible = !this.frendListVisible;
        this.widthMsgList = this.frendListVisible ? 9 : 12;
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
        this.addFrend(this.name, this.key);
        this.key = '';
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
        if (this.msgs.length > 0) {
          for (let i = 0; i < this.msgs.length; i++) {
            this.deleteMsg(this.msgs[i].id);
          }
        }
      },

      // --------------- Metods ------------------------

      showWebrtcConnection: async function (type) {
        type_ru = 'Чат';
        if (type == 'video') type_ru = 'Видео-звонок';
        if (type == 'audio') type_ru = 'Звонок';
        let frendInDB = false;
        for (let i=0; i > frendsList.length; i++) {
          if (frendsList[i]['key'] == this.connectedFrendKey) {
            this.frend = frendsList[i];
            frendInDB = true;
          }
        }
        if (!frendInDB) return false;
        this.$bvModal.msgBoxConfirm('Контакт {this.frend.name} сделал запрос на соедиенение по WebRTC.', {
          title: type_ru,
          buttonSize: 'lg',
          okVariant: 'success',
          okTitle: 'Соединиться',
          cancelVariant: 'danger',
          cancelTitle: 'Отклонить',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true
        })
          .then(value => {
            return value;
          })
          .catch(err => {
            console.log('Error! WebRTC connect rejected. (showWebrtcConnection)');
          })
      },

        updateOnlineFrends: async function () {
          let frends = await getFrendsFromDb(this.db);
          let keys = [];
          for (let i = 0; i < frends.length; i++) {
            keys.push(frends[i]['key']);
          }
          let onlineFrends = await getOnlineFrends(keys.join(';'));
          for (let i = 0; i < frends.length; i++) {
            if (onlineFrends.indexOf(frends[i]['key']) > -1) {
              frends[i]['status'] = 1; // онлайн
              await this.editFrend(frends[i]);
            } else {
              frends[i]['status'] = 0; // офлайн
              await this.editFrend(frends[i]);
            }
          }
          setTimeout(this.updateOnlineFrends, this.updateInterval);
        },

        updateMsgs: async function () {
          let msgs = await getMessages(); // api
          if (msgs.length > 0) {
            msgs = JSON.parse(msgs[0]['content']);
            this.connectedFrendKey = msgs[0]['sender'];
            console.log(msgs);
            let type = msgs['type'];
            let sdp = JSON.parse(msgs['sdp']);
            if (sdp['type'] == 'offer') createAnswerSDP(type, sdp);
            if (sdp['type'] == 'answer') start(sdp);
          }
          setTimeout(this.updateMsgs, this.updateInterval);
        },

        sendMsg: async function () {
          this.addMsg(this.sendMsgText, 'I am', this.frend.name);
          sendMsgWebRtc(this.sendMsgText); // отправка сообщения по WebRTC
          this.sendMsgText = '';
          this.msgs = await getMsgsFromDb(this.db, this.frend.name);
        },

        getFrend: async function() {
          this.getFrendFromDb(this.frend.id);
        },

        back: function() {
          this.frend = false;
        },

        getMsgsFrom: async function (frend) {            
            this.frend = frend;
            this.msgs = await getMsgsFromDb(this.db, this.frend.name);
        },

        // ------------------- Работа с БД -------------------------

          async addFrend(name, key) {
            this.addDisabled = true;
            let frend = {
              name: name,
              key: key
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
