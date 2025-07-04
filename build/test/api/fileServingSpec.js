"use strict";
/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const frisby = __importStar(require("frisby"));
const config_1 = __importDefault(require("config"));
const utils = __importStar(require("../../lib/utils"));
const URL = 'http://localhost:3000';
let blueprint;
for (const product of config_1.default.get('products')) {
    if (product.fileForRetrieveBlueprintChallenge) {
        blueprint = product.fileForRetrieveBlueprintChallenge;
        break;
    }
}
describe('Server', () => {
    it('GET responds with index.html when visiting application URL', () => {
        return frisby.get(URL)
            .expect('status', 200)
            .expect('header', 'content-type', /text\/html/)
            .expect('bodyContains', 'main.js')
            .expect('bodyContains', 'runtime.js')
            .expect('bodyContains', 'polyfills.js');
    });
    it('GET responds with index.html when visiting application URL with any path', () => {
        return frisby.get(URL + '/whatever')
            .expect('status', 200)
            .expect('header', 'content-type', /text\/html/)
            .expect('bodyContains', 'main.js')
            .expect('bodyContains', 'runtime.js')
            .expect('bodyContains', 'polyfills.js');
    });
    xit('GET a restricted file directly from file system path on server via Directory Traversal attack loads index.html instead', () => {
        return frisby.get(URL + '/public/images/../../ftp/eastere.gg')
            .expect('status', 200)
            .expect('bodyContains', '<meta name="description" content="Probably the most modern and sophisticated insecure web application">');
    });
    it('GET a restricted file directly from file system path on server via URL-encoded Directory Traversal attack loads index.html instead', () => {
        return frisby.get(URL + '/public/images/%2e%2e%2f%2e%2e%2fftp/eastere.gg')
            .expect('status', 200)
            .expect('bodyContains', '<meta name="description" content="Probably the most modern and sophisticated insecure web application">');
    });
    it('GET serves a security.txt file', () => {
        return frisby.get(URL + '/security.txt')
            .expect('status', 200);
    });
    it('GET serves a security.txt file under well-known subfolder', () => {
        return frisby.get(URL + '/.well-known/security.txt')
            .expect('status', 200);
    });
    it('GET serves a robots.txt file', () => {
        return frisby.get(URL + '/robots.txt')
            .expect('status', 200);
    });
    it('GET serves a csaf provider-metadata.json', () => {
        return frisby.get(URL + '/.well-known/csaf/provider-metadata.json')
            .expect('status', 200);
    });
    it('GET serves a csaf index.txt', () => {
        return frisby.get(URL + '/.well-known/csaf/index.txt')
            .expect('status', 200);
    });
    it('GET serves a csaf changes.csv', () => {
        return frisby.get(URL + '/.well-known/csaf/changes.csv')
            .expect('status', 200);
    });
    it('GET serves a csaf juice-shop-sa-20200513-express-jwt.json', () => {
        return frisby.get(URL + '/.well-known/csaf/2017/juice-shop-sa-20200513-express-jwt.json')
            .expect('status', 200)
            .expect('bodyContains', 'juice-shop-sa-20200513-express-jwt')
            .expect('bodyContains', 'We will soon release a patch');
    });
});
describe('/public/images/padding', () => {
    it('GET tracking image for "Score Board" page access challenge', () => {
        return frisby.get(URL + '/assets/public/images/padding/1px.png')
            .expect('status', 200)
            .expect('header', 'content-type', 'image/png');
    });
    it('GET tracking image for "Administration" page access challenge', () => {
        return frisby.get(URL + '/assets/public/images/padding/19px.png')
            .expect('status', 200)
            .expect('header', 'content-type', 'image/png');
    });
    it('GET tracking image for "Token Sale" page access challenge', () => {
        return frisby.get(URL + '/assets/public/images/padding/56px.png')
            .expect('status', 200)
            .expect('header', 'content-type', 'image/png');
    });
    it('GET tracking image for "Privacy Policy" page access challenge', () => {
        return frisby.get(URL + '/assets/public/images/padding/81px.png')
            .expect('status', 200)
            .expect('header', 'content-type', 'image/png');
    });
});
describe('/encryptionkeys', () => {
    it('GET serves a directory listing', () => {
        return frisby.get(URL + '/encryptionkeys')
            .expect('status', 200)
            .expect('header', 'content-type', /text\/html/)
            .expect('bodyContains', '<title>listing directory /encryptionkeys</title>');
    });
    it('GET a non-existing file in will return a 404 error', () => {
        return frisby.get(URL + '/encryptionkeys/doesnotexist.md')
            .expect('status', 404);
    });
    it('GET the Premium Content AES key', () => {
        return frisby.get(URL + '/encryptionkeys/premium.key')
            .expect('status', 200);
    });
    it('GET a key file whose name contains a "/" fails with a 403 error', () => {
        return frisby.fetch(URL + '/encryptionkeys/%2fetc%2fos-release%2500.md', {}, { urlEncode: false })
            .expect('status', 403)
            .expect('bodyContains', 'Error: File names cannot contain forward slashes!');
    });
});
describe('Hidden URL', () => {
    it('GET the second easter egg by visiting the Base64>ROT13-decrypted URL', () => {
        return frisby.get(URL + '/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg')
            .expect('status', 200)
            .expect('header', 'content-type', /text\/html/)
            .expect('bodyContains', '<title>Welcome to Planet Orangeuze</title>');
    });
    it('GET the premium content by visiting the AES decrypted URL', () => {
        return frisby.get(URL + '/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us')
            .expect('status', 200)
            .expect('header', 'content-type', 'image/jpeg');
    });
    it('GET the missing "Thank you!" image for assembling the URL hidden in the Privacy Policy', () => {
        return frisby.get(URL + '/we/may/also/instruct/you/to/refuse/all/reasonably/necessary/responsibility')
            .expect('status', 404);
    });
    it('GET Klingon translation file for "Extra Language" challenge', () => {
        return frisby.get(URL + '/assets/i18n/tlh_AA.json')
            .expect('status', 200)
            .expect('header', 'content-type', /application\/json/);
    });
    it('GET blueprint file for "Retrieve Blueprint" challenge', () => {
        return frisby.get(URL + '/assets/public/images/products/' + blueprint)
            .expect('status', 200);
    });
    it('GET crazy cat photo for "Missing Encoding" challenge', () => {
        return frisby.get(URL + '/assets/public/images/uploads/%E1%93%9A%E1%98%8F%E1%97%A2-%23zatschi-%23whoneedsfourlegs-1572600969477.jpg')
            .expect('status', 200);
    });
    it('GET folder containing access log files for "Access Log" challenge', () => {
        return frisby.get(URL + '/support/logs/access.log.' + utils.toISO8601(new Date()))
            .expect('status', 200)
            .expect('header', 'content-type', /application\/octet-stream/);
    });
    xit('GET path traversal does not work in folder containing access log files', () => {
        return frisby.get(URL + '/support/logs/../../../../etc/passwd')
            .expect('status', 403);
    });
});
//# sourceMappingURL=fileServingSpec.js.map