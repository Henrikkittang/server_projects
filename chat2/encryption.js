const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
require('dotenv').config();

function encrypt(toEncrypt) {
    const absolutePath = path.resolve('keys/public.pem')
    const publicKey = fs.readFileSync(absolutePath, 'utf8')
    const buffer = Buffer.from(toEncrypt, 'utf8')
    const encrypted = crypto.publicEncrypt(publicKey, buffer)
    return encrypted.toString('base64')
}

function decrypt(toDecrypt) {
    const absolutePath = path.resolve('keys/private.pem')
    const privateKey = fs.readFileSync(absolutePath, 'utf8')
    const buffer = Buffer.from(toDecrypt, 'base64')

    const decrypted = crypto.privateDecrypt({
        key: privateKey.toString(),
        passphrase: process.env.PASSPHRASE || '',
    }, buffer)
    return decrypted.toString('utf8')
}

function generateKeys() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', 
    {
            modulusLength: 4096,
            namedCurve: 'secp256k1', 
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'     
            },     
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: process.env.PASSPHRASE || ''
            } 
    });

    return {publicKey, privateKey};
}


function generateAndStoreKeys() {
    const { publicKey, privateKey } = generateKeys();
    
    fs.writeFileSync('keys/private.pem', privateKey)
    fs.writeFileSync('keys/public.pem', publicKey)
}
 
module.exports = {encrypt, decrypt, generateKeys, generateAndStoreKeys}




