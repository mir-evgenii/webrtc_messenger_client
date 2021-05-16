
const DB_NAME = 'msgdb';
const DB_VERSION = 1;

const MY_NAME = 'I am';

Vue.component('friend-list', {
    props: ['friend'],
    template: '<b-button v-if="friend.status" v-on:click="app.getMsgsFrom(friend)" block>{{ friend.name }} <b-icon-broadcast-pin v-if="friend.webrtc"></b-icon-broadcast-pin></b-button><b-button v-else v-on:click="app.getMsgsFrom(friend)" variant="outline-secondary" block>{{ friend.name }}</b-button>'
})

Vue.component('friend-list-dropdown', {
  props: ['friend'],
  template: '<b-dropdown-item v-on:click="app.getMsgsFrom(friend)">{{ friend.name }}<b-dropdown-item>'
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
      friendsList: [],
      msgs: [],
      sendMsgText: '',
      db:null,
      webrtc: [false, ''],
      showDismissibleAlert: true,
      name:'', // friend name
      nameState: null,
      key:'', // friend public RSA key
      keyState: null,
      ready:false,
      addDisabled:false,
      friend:false,
      friendId:false,
      friendListVisible: true,
      widthMsgList: 9,
      isMobile:false,
      updateInterval:5000, // частота обновления сообщений 5 сек
      boxWebrtcConnection:null, // разрешение от пользователя на соединение по webrtc
      connectedfriendKey:null // ключ пользователя который подключается по webrtc
    },
    async created() {
        this.db = await getDb();
        this.friendsList = await getfriendsFromDb(this.db);
        this.ready = true;
        this.brouser = false;
        this.detectDevice();

        if (getOnline()) { // обновление сообщений // getOnline - api
          await this.updateMsgs();
          await this.updateOnlinefriends();
        } 
    },
    methods: {

      friendList() {
        this.friendListVisible = !this.friendListVisible;
        this.widthMsgList = this.friendListVisible ? 9 : 12;
      },

      detectDevice() {
        let detect = new MobileDetect(window.navigator.userAgent);
        if (detect.phone()) {
          this.isMobile = true;
        }
      },

      // -------------- Add friends metods ----------------------

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
        this.addfriend(this.name, this.key);
        this.key = '';
        this.$nextTick(() => {
          this.$bvModal.hide('modal-add-friend')
        })
      },

      // -------------- del friend ------------

      handleDel() {
        this.deletefriend(this.friend.id);
        this.friend = false;
      },

      // --------------- edit friend -------------------

      handleEdit() {
        this.editfriend(this.friend);
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

        tested: function() {
          this.$bvModal.show('modal-video-call');
        },

      showWebrtcConnection: async function (type, offerSDP) {
        let type_ru = 'Чат';
        if (type == 'video') type_ru = 'Видео-звонок';
        if (type == 'audio') type_ru = 'Звонок';
        let friendInDB = false;
        for (var i=0; i < this.friendsList.length; i++) {
          if (this.friendsList[i]['key'] == this.connectedfriendKey) {
            this.friend = this.friendsList[i];
            this.msgs = await getMsgsFromDb(this.db, this.friend.name);
            friendInDB = true;
          }
        }
        if (!friendInDB) return false;
        this.$bvModal.msgBoxConfirm('Контакт ' + this.friend.name + ' сделал запрос на соедиенение по WebRTC.', {
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
            if (type == 'video') {
              createAnswerSDPRejectedMedia(type, offerSDP);
              this.$bvModal.show('modal-video-call');
            }
            if (type == 'audio') {
              createAnswerSDPRejectedMedia(type, offerSDP);
              this.$bvModal.show('modal-call');
            }
            if (type == 'chat') createAnswerSDPRejected(type, offerSDP);
            return value;
          })
          .catch(err => {
            console.log('Error! WebRTC connect rejected. (showWebrtcConnection)');
          })
      },

        updateOnlinefriends: async function () {
          let friends = await getfriendsFromDb(this.db);
          let keys = [];
          for (let i = 0; i < friends.length; i++) {
            keys.push(friends[i]['key']);
          }
          let onlinefriends = await getOnlinefriends(keys.join(';'));
          for (let i = 0; i < friends.length; i++) {
            if (onlinefriends.indexOf(friends[i]['key']) > -1) {
              friends[i]['status'] = 1; // онлайн
              await this.editfriend(friends[i]);
            } else {
              friends[i]['status'] = 0; // офлайн
              await this.editfriend(friends[i]);
            }
          }
          setTimeout(this.updateOnlinefriends, this.updateInterval);
        },

        updateMsgs: async function () {
          let msgs = await getMessages(); // api
          if (msgs.length > 0) {
            console.log(msgs);
            let msg = JSON.parse(msgs[0]['content']);
            this.connectedfriendKey = JSON.parse(msgs[0]['sender']);
            console.log(msg);
            let type = msg['type'];
            let sdp = JSON.parse(msg['sdp']);
            if (sdp['type'] == 'offer') createAnswerSDP(type, sdp);
            if (sdp['type'] == 'answer') start(sdp);
          }
          setTimeout(this.updateMsgs, this.updateInterval);
        },

        sendMsg: async function () {
          this.addMsg(this.sendMsgText, 'I am', this.friend.name);
          sendMsgWebRtc(this.sendMsgText); // отправка сообщения по WebRTC
          this.sendMsgText = '';
          this.msgs = await getMsgsFromDb(this.db, this.friend.name);
        },

        getfriend: async function() {
          this.getfriendFromDb(this.friend.id);
        },

        back: function() {
          this.friend = false;
        },

        getMsgsFrom: async function (friend) {            
            this.friend = friend;
            this.msgs = await getMsgsFromDb(this.db, this.friend.name);
        },

        // ------------------- Работа с БД -------------------------

          async addfriend(name, key) {
            this.addDisabled = true;
            let friend = {
              name: name,
              key: key
            };
            console.log('Add friend to DB: '+JSON.stringify(friend));
            await addfriendToDb(this.db, friend);
            this.friendsList = await getfriendsFromDb(this.db);
            this.addDisabled = false;      
          },

          async editfriend(friend) {
            this.addDisabled = true;
            await addfriendToDb(this.db, friend);
            this.friendsList = await getfriendsFromDb(this.db);
            this.addDisabled = false;
          },

          async deletefriend(id) {
            await deletefriendFromDb(this.db, id);
            this.friendsList = await getfriendsFromDb(this.db);      
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
            this.msgs = await getMsgsFromDb(this.db, this.friend.name);
            this.addDisabled = false;      
          },

          async deleteMsg(id) {
            await deleteMsgFromDb(this.db, id);
            this.msgs = await getMsgsFromDb(this.db, this.friend.name);      
          },
    }
})
