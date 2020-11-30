function signMessage() {

var md = new KJUR.crypto.MessageDigest({"alg": "sha1", "prov": "sgcl"});
var hashValueString = md.digestString(1);
console.log(hashValueString);

var sig = new KJUR.crypto.Signature({"alg": "SHA256withRSA"});

// TEST PRIVATE KEY
let key = `-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: DES-EDE3-CBC,215DC8F3B08343A9

YUrwwIzGCM++VBfu4UJEzIIsgFr549rwz4VsrkS5y9vL3jWRHulITfZDtlB6dsiC
Xs+z0ttoObqcwfWYNeUWZxmUX6SEqiVet/3O7YEs7nBd3CGEg9tg6CjUl5honQM3
HLwIIdT+V4+kCW7VtsBKkFfZHPjoE3oVHmtL1iPUbvXQ8DTUZTviQ8PXVPNWDCCk
bdTrhXX86XpMl3RB+w6fMkH8rLlk6CqEGYYKRsixW3GLqtVS0sXFYVJA1mCYaoj/
9XuO3HT+z8KJ+iYGvx9pczH2D0/r/rpMlrEOHrpttYMle5lhVjr0Gl4009e7uz1n
jemyFNE40mLqQJZwgwpyHX6EiIAvTuOGlbD/Gu8tCxE9ojnF7rVoF5gFekpSt8vT
iAFBBFVQeQL2iDE82Hvsa4Yxj4kaTpFUVXNYwFamwxsqsSU3kag22BIPao7y4cjd
YtLHZx8RoyWw0dhiqxDlCngt6CyrkZMlZ2fMCWR1LAQrWKdqpDPxTR6Iwb6Nz49B
e4LCC7TryAJVhUq4WeqAN92I0x4KE0s65unqj8au9sgXPF+x4IgaIYhkwQ2MO7dh
vkrynx0drfZnqjBXS9jBLetyIvC+Bcx5HDSEGKN/tQ+eVzo/wzEkg15xWbp+dTCS
0Pxu78TsuYhg0DItBGL2LO6ZQ/hL0lDiBH0P1gt7rpF6eaKJHJlOyXkrCjtO5/96
dno8XrT1XvG9MViPplvUdT7DCNVoEQS55/T1tYofcIBRz05OyZYAYZ/6t5rTAYf/
vwAm9Q85U2NibLlNtlVabaqGIxwsXj+DDsCAyN1jxSUKmE1IsNkNPQ==
-----END RSA PRIVATE KEY-----`;

sig.init(key, 'qwe123');
sig.sign(hashValueString)
var sigValueHex = sig.sign()
console.log(sigValueHex);
}

function validSign() {
    var md = new KJUR.crypto.MessageDigest({"alg": "md5", "prov": "cryptojs"});
    var hashValueHex = md.digest('aaa');

    var sigValueHex1 = `1bebc0343d1621b0d3a0355528438c57d13751bf8c695b96b257edee6abaa390df0a6d4be1fa1cc2939c112fcf6f85631be7c5a3e40382bf862c8cfa673080d08e52fa3247c9a05fa123da50b6956818558bacb774a27b72298277b935e0e372fea97c05dd965911788f9b5e83110b2530dd6bbcfc3c26a76045673838a23a32`;
    var sig = new KJUR.crypto.Signature({"alg": "SHA256withRSA"});
    sig.init(`-----BEGIN PUBLIC KEY-----
    MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDemy8amIYv5Okhbhol2WnjCkcH
    1mbhQdKGmuJtBVsfaAMyxFq+8YrIr9WauFrBVWQkmCxyC8/N4DzVXqQdP/Hw3Xxh
    bjGFmlPaOzhmlZNw/Zy2fNrKthwQ1p5wVg+BkaP7yrQW2/jzVDe0Wt84kM44lh6W
    Sd5dwzqNLnT7xC923wIDAQAB
    -----END PUBLIC KEY-----`);
    sig.updateString(hashValueHex)
    var isValid = sig.verify(sigValueHex1)
    console.log(isValid);
}
