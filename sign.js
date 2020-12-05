function signMessage() {

var md = new KJUR.crypto.MessageDigest({"alg": "sha1", "prov": "sgcl"});
var hashValueString = md.digestString('1');
console.log(hashValueString);

var sig = new KJUR.crypto.Signature({"alg": "SHA256withRSA"});

let key = `-----BEGIN RSA PRIVATE KEY-----`;

sig.init(key, 'the most popular password in the world');
sig.sign(hashValueString)
var sigValueHex = sig.sign()
console.log(sigValueHex);
}

function validSign() {
    var md = new KJUR.crypto.MessageDigest({"alg": "md5", "prov": "cryptojs"});
    var hashValueHex = md.digest('1');

    var sigValueHex1 = `hash`;
    var sig = new KJUR.crypto.Signature({"alg": "SHA256withRSA"});
    sig.init(`-----BEGIN PUBLIC KEY-----`);
    sig.updateString(hashValueHex)
    var isValid = sig.verify(sigValueHex1)
    console.log(isValid);
}
