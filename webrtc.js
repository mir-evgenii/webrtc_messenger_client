// offer
// createOfferSDP(type); // type = 'chat'/'video'/'audio'
// start(answerSDP);

// join
// createAnswerSDP(offerSDP);


// offer/join
var server = { urls: "stun:stun.l.google.com:19302"};
var sdpConstraints = { optional: [{RtpDataChannels: true}]  };
var pc = new RTCPeerConnection(null);
var dc;
var state; //статус соединения
var sdp_msg; // SDP датаграмма

//---------media--------------

// type = 'video'/'audio'
async function mediaWebRTC(type, offerSDP = false, Reject = false){
  console.log('1 mediaWebRTC');
  let constraints = {audio: true, video: true};
  if (type == 'audio') constraints = {audio: true, video: false};

  pc.ontrack = event => {
    console.log('2 mediaWebRTC pc.ontrack');
    const stream = event.streams[0];
    if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
      remoteVideo.srcObject = stream;
    }
  };
  

  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    console.log('3 mediaWebRTC getUserMedia');
    // Display your local video in #localVideo element 
    localVideo.srcObject = stream;
    // Add your stream to be sent to the conneting peer
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    console.log('3 mediaWebRTC getUserMedia end ...');
    if (Reject) {
      createAnswerSDPRejected(type, offerSDP);
    } else {
      createOfferSDP(type);
    }
  });
}

//----------join--------------

// join 4
function dcInit(dc) {
  dc.onopen    = function()  {console.log("Conected!")};
  dc.onmessage = function(e) {if (e.data) console.log(e.data); app.addMsg(e.data, app.frend.name, 'I am');}
}

function joinWebRTC() {
    // join 1 
    pc.ondatachannel = function(e) {dc = e.channel; dcInit(dc)};
    // join 2 sdp датаграмма
    pc.onicecandidate = function(e) {
      if (e.candidate) return;
      sdp_msg = JSON.stringify(pc.localDescription);
      console.log(sdp_msg);

      msg = JSON.stringify({
        type: '',
        sdp: sdp_msg
      });

      sendMessage(msg, my_sender_data.key, app.frend.key);
    }
    // join 3 изменение статуса 
    pc.oniceconnectionstatechange = async function(e) {
      state = pc.iceConnectionState;
      console.log(state);
      if (state == 'connected') {
        app.frend['webrtc'] = 1;
        await app.editFrend(app.frend);
      } else {
        app.frend['webrtc'] = 0;
        await app.editFrend(app.frend);
      }
    }
}

// join 5
// type = 'chat'/'video'/'audio'
async function createAnswerSDP(type, offerSDP) {
  await app.showWebrtcConnection(type, offerSDP); // main
}

function createAnswerSDPRejectedMedia(type, offerSDP) {
  if (type == 'video' || type == 'audio') mediaWebRTC(type, offerSDP, true);
}

async function createAnswerSDPRejected(type, offerSDP) {
  //if (type == 'video' || type == 'audio') await mediaWebRTC(type);
  joinWebRTC();
  var offerDesc = new RTCSessionDescription(offerSDP);
  pc.setRemoteDescription(offerDesc);
  pc.createAnswer(function (answerDesc) {
    pc.setLocalDescription(answerDesc)
  }, function () {console.warn("Couldn't create offer")},
  sdpConstraints);
}

//----------offer--------------

function offerWebRTC(type) {
  console.log('5 offerWebRTC');
  // offer 1 изменение статуса 
  pc.oniceconnectionstatechange = async function(e) {
    console.log('6 pc.oniceconnectionstatechange');
    state = pc.iceConnectionState;
    console.log(state);
    if (state == 'connected') {
      app.frend['webrtc'] = 1;
      await app.editFrend(app.frend);
    } else {
      app.frend['webrtc'] = 0;
      await app.editFrend(app.frend);
    }
  }
  // offer 2 sdp датаграмма
  pc.onicecandidate = function(e) {
    console.log('7 pc.onicecandidate');
    if (e.candidate) {
      return;
    } 
    sdp_msg = JSON.stringify(pc.localDescription);
    console.log(sdp_msg);

    msg = JSON.stringify({
      type: type,
      sdp: sdp_msg
    });

    console.log(msg);
    
    sendMessage(msg, my_sender_data.key, app.frend.key); // api
  }
}

// offer 3
// type = 'chat'/'video'/'audio'
function createOfferSDPMedia(type) {
  if (type == 'video' || type == 'audio') mediaWebRTC(type);
}

async function createOfferSDP(type) {
  //if (type == 'video' || type == 'audio') await mediaWebRTC(type);
  console.log('4 createOfferSDP cont....');
  offerWebRTC(type);
  if (type == 'chat') dc = pc.createDataChannel("chat");
  pc.createOffer().then(function(e) {
    console.log('8 createOffer');
    pc.setLocalDescription(e)
  });
  if (type == 'chat') {
    dc.onmessage = function(e) {
      if (e.data) console.log(e.data); app.addMsg(e.data, app.frend.name, 'I am'); //TODO добавление сообщения //addMSG(e.data, "other");
    }
  }
}

// offer 4
function start(answerSDP) {
  var answerDesc = new RTCSessionDescription(answerSDP);
  pc.setRemoteDescription(answerDesc);
}

//-----------------------------

// offer/join отправка сообщения
function sendMsgWebRtc (msg) {
  dc.send(msg);
}