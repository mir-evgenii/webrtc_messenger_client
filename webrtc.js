// offer/join
var server = { urls: "stun:stun.l.google.com:19302"};
var sdpConstraints = { optional: [{RtpDataChannels: true}]  };
var pc = new RTCPeerConnection(null);
var dc;
var state; //статус соединения
var sdp_msg; // SDP датаграмма

function joinWebRTC() {
  // join 1 
  pc.ondatachannel  = function(e) {dc = e.channel; dcInit(dc)};
  // join 2 sdp датаграмма
  pc.onicecandidate = function(e) {
    if (e.candidate) return;
    sdp_msg = JSON.stringify(pc.localDescription);
    console.log(sdp_msg);
  }
  // join 3 изменение статуса 
  pc.oniceconnectionstatechange = function(e) {
    state = pc.iceConnectionState;
    console.log(state);
  }
  // join 4
  function dcInit(dc) {
    dc.onopen    = function()  {console.log("Conected!")};
    dc.onmessage = function(e) {if (e.data) console.log(e.data); app.addMsg(e.data, app.frend.name, 'I am');}
  }
  // join 5
  function createAnswerSDP(offerSDP) {
    var offerDesc = new RTCSessionDescription(offerSDP);
    pc.setRemoteDescription(offerDesc)
    pc.createAnswer(function (answerDesc) {
      pc.setLocalDescription(answerDesc)
    }, function () {console.warn("Couldn't create offer")},
    sdpConstraints);
  }
}

function offerWebRTC() {
  // offer 1 изменение статуса 
  pc.oniceconnectionstatechange = function(e) {
    state = pc.iceConnectionState;
    console.log(state);
  }
  // offer 2 sdp датаграмма
  pc.onicecandidate = function(e) {
    if (e.candidate) return;
    sdp_msg = JSON.stringify(pc.localDescription);
    console.log(sdp_msg);
  }
  // offer 3
  function createOfferSDP() {
    dc = pc.createDataChannel("chat");
    pc.createOffer().then(function(e) {
      pc.setLocalDescription(e)
    });
    dc.onmessage = function(e) {
      if (e.data) console.log(e.data); app.addMsg(e.data, app.frend.name, 'I am'); //TODO добавление сообщения //addMSG(e.data, "other");
    }
  }
  // offer 4
  function start(answerSDP) {
    var answerDesc = new RTCSessionDescription(answerSDP);
    pc.setRemoteDescription(answerDesc);
  }

  createOfferSDP();
}


// offer/join отправка сообщения
function sendMsgWebRtc (msg) {
  dc.send(msg);
}






