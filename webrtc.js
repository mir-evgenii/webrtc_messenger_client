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
};

function start() {
  var answerSDP = ''; //TODO получение ответа
  var answerDesc = new RTCSessionDescription(JSON.parse(answerSDP));
  pc.setRemoteDescription(answerDesc);
}

function sendMsgWebRtc (msg) {
  dc.send(msg);
  // добавить сообщение в базу addMSG(value, "me");
}

//createOfferSDP();

pc.ondatachannel  = function(e) {dc = e.channel; dcInit(dc)};

function dcInit(dc) {
  dc.onopen    = function()  {console.log("Conected!")};
  dc.onmessage = function(e) {if (e.data) console.log(e.data);}
}

function createAnswerSDP(offerSDP) {
  var offerDesc = new RTCSessionDescription(JSON.parse(offerSDP));
  pc.setRemoteDescription(offerDesc)
  pc.createAnswer(function (answerDesc) {
    pc.setLocalDescription(answerDesc)
  }, function () {console.warn("Couldn't create offer")},
  sdpConstraints);
};