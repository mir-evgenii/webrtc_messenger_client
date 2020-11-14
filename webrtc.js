//connect

//var server       = { urls: "stun:stun.l.google.com:19302" };
var sdpConstraints = { optional: [{RtpDataChannels: true}]  };
var pc = new RTCPeerConnection(null);
var dc;
var state; //статус соединения
var creater_sdp; // SDP датаграмма инициатора соединения

// изменение статуса 
pc.oniceconnectionstatechange = function(e) {
  state = pc.iceConnectionState;
  console.log(state);
};

pc.onicecandidate = function(e) {
  if (e.candidate) return;
  creater_sdp = JSON.stringify(pc.localDescription);
  console.log(creater_sdp);
}

function createOfferSDP() {
  dc = pc.createDataChannel("chat");
  pc.createOffer().then(function(e) {
    pc.setLocalDescription(e)
  });
  //dc.onopen = function(){$("textarea").attr("disabled",true);addMSG("CONNECTED!", "info")};
  dc.onmessage = function(e) {
    if (e.data) console.log(e.data);//TODO добавление сообщения //addMSG(e.data, "other");
  }
  getOnline();

};

function start() {
  var answerSDP = ''; //TODO получение ответа
  var answerDesc = new RTCSessionDescription(JSON.parse(answerSDP));
  pc.setRemoteDescription(answerDesc);
}

//createOfferSDP();
