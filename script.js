let public_key = "", private_key = "";
let keyPair
let loc = 100
let cicadaFile
let correct = false

function fileHandler(input) {
    cicadaFile = input.files[0]
    let area = document.getElementById('cipher-image-area')
    area.src = cicadaFile.name
    area.hidden = false
}

// cipher key pressed
document.getElementById('cipher-key-button').addEventListener('click', async function (event) {
    let loc_input = document.getElementById('cipher-location-input').value
    if (loc_input.length != 0) {
        loc = parseInt(loc_input)
    }
    await cipherData(loc, await str2ab(public_key))
    document.getElementById('decipher-div').hidden = false;
})

// decipher key pressed
document.getElementById('decipher-key-button').addEventListener('click', function (event) {
    let loc_input = document.getElementById('decipher-location-input')
    if(parseInt(loc_input.value) == loc) {
        correct = true
    } else {
        correct = false
    }
    document.getElementById('key-exchange-div').hidden = true;
    document.getElementById('chat-div').hidden = false;
})

// encrypt and send message pressed
document.getElementById('encrypt-message-button').addEventListener('click', async function (event) {
    let input = document.getElementById('message-send-area').value
    document.getElementById('message-recv-area').value = await encryptData(input)
})

// decrypt pressed
document.getElementById('decrypt-message-button').addEventListener('click', async function (event) {
    let box = document.getElementById('message-recv-area')
    let encryptedData = box.value
    box.value = await decryptData(encryptedData)
})

async function readImageAsArrayBuffer(file) {
    let reader = new FileReader()
    return reader.readAsArrayBuffer(file)
}

// ciphering and deciphering algorithms

// cipher
function cipherData(location, keyab) {
    let imageab = readImageAsArrayBuffer(cicadaFile)
    console.log(imageab.byteLength)
} 













// converter from ab to str and str to ab
async function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}
async function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
    }
    return buf;
}


// don't touch
// code related to encryption, decryption and key generation
// generate public and private keys

// pkcs8 for privateKey and spki for publicKey
async function exportCryptoKey(format, key) {
    const plainKey = window.btoa(String.fromCharCode.apply(null, new Uint8Array(await window.crypto.subtle.exportKey(format, key))))
    return plainKey
}

// generateKey returns cryptoKeyPair
async function generateKeys(){
    keyPair = await window.crypto.subtle.generateKey({
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        }, true, ["encrypt", "decrypt"])

    public_key = await exportCryptoKey('spki', keyPair.publicKey)
    private_key = await exportCryptoKey('pkcs8', keyPair.privateKey)
    
    // test public private keys
    // console.log(public_key)
    // console.log('\n\n\n')
    // console.log(private_key)
}

async function encryptData(data) {
    let res = await window.crypto.subtle.encrypt("RSA-OAEP", keyPair.publicKey, await str2ab(data));
    return await ab2str(res)
}

async function decryptData(data) {
    let useKey = keyPair.privateKey
    if(!correct) {
        useKey = keyPair.publicKey
    }
    let res = await window.crypto.subtle.decrypt("RSA-OAEP", useKey, await str2ab(data))
    return await ab2str(res)
}

generateKeys()