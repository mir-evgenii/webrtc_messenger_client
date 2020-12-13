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
    dc.onmessage = function(e) {if (e.data) console.log(e.data);}
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
    //dc.onopen = function(){$("textarea").attr("disabled",true);addMSG("CONNECTED!", "info")};
    dc.onmessage = function(e) {
      if (e.data) console.log(e.data); app.addMsg(e.data, app.frend.name, 'I am'); //TODO добавление сообщения //addMSG(e.data, "other");
    }
  }
  // offer 4
  function start(answerSDP) {
    //var answerSDP = {"type":"answer","sdp":"v=0\r\no=- 5324069349305549997 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\nb=AS:30\r\na=candidate:4033732497 1 udp 2113937151 b6e7effc-985f-44a5-a312-623d12fa6c04.local 52805 typ host generation 0 network-cost 999\r\na=ice-ufrag:ImJe\r\na=ice-pwd:M5pn/Xq/hurYwTxCvFxXmoHh\r\na=ice-options:trickle\r\na=fingerprint:sha-256 37:3D:68:C4:2A:4A:69:56:AE:CC:BF:06:6D:6A:CF:17:00:89:31:71:5F:58:8B:F0:A1:8E:00:C0:A9:E0:AF:5E\r\na=setup:active\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n"}; //TODO получение ответа
    var answerDesc = new RTCSessionDescription(answerSDP);
    pc.setRemoteDescription(answerDesc);
  }

  createOfferSDP();
}


// offer/join отправка сообщения
function sendMsgWebRtc (msg) {
  dc.send(msg);
}






