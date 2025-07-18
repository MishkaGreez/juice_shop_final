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
const globals_1 = require("@jest/globals");
const config_1 = __importDefault(require("config"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const jsonHeader = { 'content-type': 'application/json' };
const REST_URL = 'http://localhost:3000/rest';
describe('/rest/user/data-export', () => {
    it('Export data without use of CAPTCHA', () => {
        return frisby.post(REST_URL + '/user/login', {
            headers: jsonHeader,
            body: {
                email: 'bjoern.kimminich@gmail.com',
                password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
            }
        })
            .expect('status', 200)
            .then(({ json: jsonLogin }) => {
            return frisby.post(REST_URL + '/user/data-export', {
                headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
                body: {
                    format: '1'
                }
            })
                .expect('status', 200)
                .expect('header', 'content-type', /application\/json/)
                .expect('json', 'confirmation', 'Your data export will open in a new Browser window.')
                .then(({ json }) => {
                const parsedData = JSON.parse(json.userData);
                (0, globals_1.expect)(parsedData.username).toBe('bkimminich');
                (0, globals_1.expect)(parsedData.email).toBe('bjoern.kimminich@gmail.com');
            });
        });
    });
    it('Export data when CAPTCHA requested need right answer', () => {
        return frisby.post(REST_URL + '/user/login', {
            headers: jsonHeader,
            body: {
                email: 'bjoern.kimminich@gmail.com',
                password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
            }
        })
            .expect('status', 200)
            .then(({ json: jsonLogin }) => {
            return frisby.get(REST_URL + '/image-captcha', {
                headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
            })
                .expect('status', 200)
                .expect('header', 'content-type', /application\/json/)
                .then(() => {
                return frisby.post(REST_URL + '/user/data-export', {
                    headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
                    body: {
                        answer: 'AAAAAA',
                        format: 1
                    }
                })
                    .expect('status', 401)
                    .expect('bodyContains', 'Wrong answer to CAPTCHA. Please try again.');
            });
        });
    });
    it('Export data using right answer to CAPTCHA', () => {
        return frisby.post(REST_URL + '/user/login', {
            headers: jsonHeader,
            body: {
                email: 'bjoern.kimminich@gmail.com',
                password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
            }
        })
            .expect('status', 200)
            .then(({ json: jsonLogin }) => {
            return frisby.get(REST_URL + '/image-captcha', {
                headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
            })
                .expect('status', 200)
                .expect('header', 'content-type', /application\/json/)
                .then(({ json: captchaAnswer }) => {
                return frisby.post(REST_URL + '/user/data-export', {
                    headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
                    body: {
                        answer: captchaAnswer.answer,
                        format: 1
                    }
                })
                    .expect('status', 200)
                    .expect('header', 'content-type', /application\/json/)
                    .expect('json', 'confirmation', 'Your data export will open in a new Browser window.')
                    .then(({ json }) => {
                    const parsedData = JSON.parse(json.userData);
                    (0, globals_1.expect)(parsedData.username).toBe('bkimminich');
                    (0, globals_1.expect)(parsedData.email).toBe('bjoern.kimminich@gmail.com');
                });
            });
        });
    });
    it('Export data including orders without use of CAPTCHA', () => {
        return frisby.post(REST_URL + '/user/login', {
            headers: jsonHeader,
            body: {
                email: 'amy@' + config_1.default.get('application.domain'),
                password: 'K1f.....................'
            }
        })
            .expect('status', 200)
            .then(({ json: jsonLogin }) => {
            return frisby.post(REST_URL + '/basket/4/checkout', {
                headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
            })
                .expect('status', 200)
                .then(() => {
                return frisby.post(REST_URL + '/user/data-export', {
                    headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
                    body: {
                        format: '1'
                    }
                })
                    .expect('status', 200)
                    .expect('header', 'content-type', /application\/json/)
                    .expect('json', 'confirmation', 'Your data export will open in a new Browser window.')
                    .then(({ json }) => {
                    const parsedData = JSON.parse(json.userData);
                    (0, globals_1.expect)(parsedData.username).toBe('');
                    (0, globals_1.expect)(parsedData.email).toBe('amy@' + config_1.default.get('application.domain'));
                    (0, globals_1.expect)(parsedData.orders[0].totalPrice).toBe(9.98);
                    (0, globals_1.expect)(parsedData.orders[0].bonus).toBe(0);
                    (0, globals_1.expect)(parsedData.orders[0].products[0].quantity).toBe(2);
                    (0, globals_1.expect)(parsedData.orders[0].products[0].name).toBe('Raspberry Juice (1000ml)');
                    (0, globals_1.expect)(parsedData.orders[0].products[0].price).toBe(4.99);
                    (0, globals_1.expect)(parsedData.orders[0].products[0].total).toBe(9.98);
                    (0, globals_1.expect)(parsedData.orders[0].products[0].bonus).toBe(0);
                });
            });
        });
    });
    it('Export data including reviews without use of CAPTCHA', () => {
        return frisby.post(REST_URL + '/user/login', {
            headers: jsonHeader,
            body: {
                email: 'jim@' + config_1.default.get('application.domain'),
                password: 'ncc-1701'
            }
        })
            .expect('status', 200)
            .then(({ json: jsonLogin }) => {
            return frisby.post(REST_URL + '/user/data-export', {
                headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
                body: {
                    format: '1'
                }
            })
                .expect('status', 200)
                .expect('header', 'content-type', /application\/json/)
                .expect('json', 'confirmation', 'Your data export will open in a new Browser window.')
                .then(({ json }) => {
                const parsedData = JSON.parse(json.userData);
                (0, globals_1.expect)(parsedData.username).toBe('');
                (0, globals_1.expect)(parsedData.email).toBe('jim@' + config_1.default.get('application.domain'));
                (0, globals_1.expect)(parsedData.reviews[0].message).toBe('Looks so much better on my uniform than the boring Starfleet symbol.');
                (0, globals_1.expect)(parsedData.reviews[0].author).toBe('jim@' + config_1.default.get('application.domain'));
                (0, globals_1.expect)(parsedData.reviews[0].productId).toBe(20);
                (0, globals_1.expect)(parsedData.reviews[0].likesCount).toBe(0);
                (0, globals_1.expect)(parsedData.reviews[0].likedBy[0]).toBe(undefined);
                (0, globals_1.expect)(parsedData.reviews[1].message).toBe('Fresh out of a replicator.');
                (0, globals_1.expect)(parsedData.reviews[1].author).toBe('jim@' + config_1.default.get('application.domain'));
                (0, globals_1.expect)(parsedData.reviews[1].productId).toBe(22);
                (0, globals_1.expect)(parsedData.reviews[1].likesCount).toBe(0);
                (0, globals_1.expect)(parsedData.reviews[1].likedBy[0]).toBe(undefined);
            });
        });
    });
    it('Export data including memories without use of CAPTCHA', () => {
        const file = node_path_1.default.resolve(__dirname, '../files/validProfileImage.jpg');
        const form = frisby.formData();
        form.append('image', node_fs_1.default.createReadStream(file), 'Valid Image'); // casting to blob as the frisby types are wrong and wont accept the fileStream type 'Valid Image')
        form.append('caption', 'Valid Image');
        return frisby.post(REST_URL + '/user/login', {
            headers: jsonHeader,
            body: {
                email: 'jim@' + config_1.default.get('application.domain'),
                password: 'ncc-1701'
            }
        })
            .expect('status', 200)
            .then(({ json: jsonLogin }) => {
            return frisby.post(REST_URL + '/memories', {
                headers: {
                    Authorization: 'Bearer ' + jsonLogin.authentication.token,
                    // @ts-expect-error FIXME form.getHeaders() is not found
                    'Content-Type': form.getHeaders()['content-type']
                },
                body: form
            })
                .expect('status', 200)
                .then(() => {
                return frisby.post(REST_URL + '/user/data-export', {
                    headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
                    body: {
                        format: '1'
                    }
                })
                    .expect('status', 200)
                    .expect('header', 'content-type', /application\/json/)
                    .expect('json', 'confirmation', 'Your data export will open in a new Browser window.')
                    .then(({ json }) => {
                    const parsedData = JSON.parse(json.userData);
                    (0, globals_1.expect)(parsedData.username).toBe('');
                    (0, globals_1.expect)(parsedData.email).toBe('jim@' + config_1.default.get('application.domain'));
                    (0, globals_1.expect)(parsedData.memories[0].caption).toBe('Valid Image');
                    (0, globals_1.expect)(parsedData.memories[0].imageUrl).toContain('assets/public/images/uploads/valid-image');
                });
            });
        });
    });
    it('Export data including orders with use of CAPTCHA', () => {
        return frisby.post(REST_URL + '/user/login', {
            headers: jsonHeader,
            body: {
                email: 'amy@' + config_1.default.get('application.domain'),
                password: 'K1f.....................'
            }
        })
            .expect('status', 200)
            .then(({ json: jsonLogin }) => {
            return frisby.post(REST_URL + '/basket/4/checkout', {
                headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
            })
                .expect('status', 200)
                .then(() => {
                return frisby.get(REST_URL + '/image-captcha', {
                    headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
                })
                    .expect('status', 200)
                    .expect('header', 'content-type', /application\/json/)
                    .then(({ json: captchaAnswer }) => {
                    return frisby.post(REST_URL + '/user/data-export', {
                        headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
                        body: {
                            answer: captchaAnswer.answer,
                            format: 1
                        }
                    })
                        .expect('status', 200)
                        .expect('header', 'content-type', /application\/json/)
                        .expect('json', 'confirmation', 'Your data export will open in a new Browser window.')
                        .then(({ json }) => {
                        const parsedData = JSON.parse(json.userData);
                        (0, globals_1.expect)(parsedData.username).toBe('');
                        (0, globals_1.expect)(parsedData.email).toBe('amy@' + config_1.default.get('application.domain'));
                        (0, globals_1.expect)(parsedData.orders[0].totalPrice).toBe(9.98);
                        (0, globals_1.expect)(parsedData.orders[0].bonus).toBe(0);
                        (0, globals_1.expect)(parsedData.orders[0].products[0].quantity).toBe(2);
                        (0, globals_1.expect)(parsedData.orders[0].products[0].name).toBe('Raspberry Juice (1000ml)');
                        (0, globals_1.expect)(parsedData.orders[0].products[0].price).toBe(4.99);
                        (0, globals_1.expect)(parsedData.orders[0].products[0].total).toBe(9.98);
                        (0, globals_1.expect)(parsedData.orders[0].products[0].bonus).toBe(0);
                    });
                });
            });
        });
    });
    it('Export data including reviews with use of CAPTCHA', () => {
        return frisby.post(REST_URL + '/user/login', {
            headers: jsonHeader,
            body: {
                email: 'jim@' + config_1.default.get('application.domain'),
                password: 'ncc-1701'
            }
        })
            .expect('status', 200)
            .then(({ json: jsonLogin }) => {
            return frisby.get(REST_URL + '/image-captcha', {
                headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
            })
                .expect('status', 200)
                .expect('header', 'content-type', /application\/json/)
                .then(({ json: captchaAnswer }) => {
                return frisby.post(REST_URL + '/user/data-export', {
                    headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
                    body: {
                        answer: captchaAnswer.answer,
                        format: 1
                    }
                })
                    .expect('status', 200)
                    .expect('header', 'content-type', /application\/json/)
                    .expect('json', 'confirmation', 'Your data export will open in a new Browser window.')
                    .then(({ json }) => {
                    const parsedData = JSON.parse(json.userData);
                    (0, globals_1.expect)(parsedData.username).toBe('');
                    (0, globals_1.expect)(parsedData.email).toBe('jim@' + config_1.default.get('application.domain'));
                    (0, globals_1.expect)(parsedData.reviews[0].message).toBe('Looks so much better on my uniform than the boring Starfleet symbol.');
                    (0, globals_1.expect)(parsedData.reviews[0].author).toBe('jim@' + config_1.default.get('application.domain'));
                    (0, globals_1.expect)(parsedData.reviews[0].productId).toBe(20);
                    (0, globals_1.expect)(parsedData.reviews[0].likesCount).toBe(0);
                    (0, globals_1.expect)(parsedData.reviews[0].likedBy[0]).toBe(undefined);
                    (0, globals_1.expect)(parsedData.reviews[1].message).toBe('Fresh out of a replicator.');
                    (0, globals_1.expect)(parsedData.reviews[1].author).toBe('jim@' + config_1.default.get('application.domain'));
                    (0, globals_1.expect)(parsedData.reviews[1].productId).toBe(22);
                    (0, globals_1.expect)(parsedData.reviews[1].likesCount).toBe(0);
                    (0, globals_1.expect)(parsedData.reviews[1].likedBy[0]).toBe(undefined);
                });
            });
        });
    });
    it('Export data including memories with use of CAPTCHA', () => {
        const file = node_path_1.default.resolve(__dirname, '../files/validProfileImage.jpg');
        const form = frisby.formData();
        form.append('image', node_fs_1.default.createReadStream(file), 'Valid Image'); // casting to blob as the frisby types are wrong and wont accept the fileStream type 'Valid Image')
        form.append('caption', 'Valid Image');
        return frisby.post(REST_URL + '/user/login', {
            headers: jsonHeader,
            body: {
                email: 'jim@' + config_1.default.get('application.domain'),
                password: 'ncc-1701'
            }
        })
            .expect('status', 200)
            .then(({ json: jsonLogin }) => {
            return frisby.post(REST_URL + '/memories', {
                headers: {
                    Authorization: 'Bearer ' + jsonLogin.authentication.token,
                    // @ts-expect-error FIXME form.getHeaders() is not found
                    'Content-Type': form.getHeaders()['content-type']
                },
                body: form
            })
                .expect('status', 200)
                .then(() => {
                return frisby.get(REST_URL + '/image-captcha', {
                    headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' }
                })
                    .expect('status', 200)
                    .expect('header', 'content-type', /application\/json/)
                    .then(({ json: captchaAnswer }) => {
                    return frisby.post(REST_URL + '/user/data-export', {
                        headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
                        body: {
                            answer: captchaAnswer.answer,
                            format: 1
                        }
                    })
                        .expect('status', 200)
                        .expect('header', 'content-type', /application\/json/)
                        .expect('json', 'confirmation', 'Your data export will open in a new Browser window.')
                        .then(({ json }) => {
                        const parsedData = JSON.parse(json.userData);
                        (0, globals_1.expect)(parsedData.username).toBe('');
                        (0, globals_1.expect)(parsedData.email).toBe('jim@' + config_1.default.get('application.domain'));
                        (0, globals_1.expect)(parsedData.memories[0].caption).toBe('Valid Image');
                        (0, globals_1.expect)(parsedData.memories[0].imageUrl).toContain('assets/public/images/uploads/valid-image');
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=dataExportApiSpec.js.map