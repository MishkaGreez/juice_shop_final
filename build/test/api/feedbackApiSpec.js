"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
const frisby = __importStar(require("frisby"));
const globals_1 = require("@jest/globals");
const datacache_1 = require("../../data/datacache");
const security = __importStar(require("../../lib/insecurity"));
const utils = __importStar(require("../../lib/utils"));
const Joi = frisby.Joi;
const API_URL = 'http://localhost:3000/api';
const REST_URL = 'http://localhost:3000/rest';
const authHeader = { Authorization: 'Bearer ' + security.authorize(), 'content-type': /application\/json/ };
const jsonHeader = { 'content-type': 'application/json' };
describe('/api/Feedbacks', () => {
    it('GET all feedback', () => {
        return frisby.get(API_URL + '/Feedbacks')
            .expect('status', 200);
    });
    it('POST sanitizes unsafe HTML from comment', () => {
        return frisby.get(REST_URL + '/captcha')
            .expect('status', 200)
            .expect('header', 'content-type', /application\/json/)
            .then(({ json }) => {
            return frisby.post(API_URL + '/Feedbacks', {
                headers: jsonHeader,
                body: {
                    comment: 'I am a harm<script>steal-cookie</script><img src="csrf-attack"/><iframe src="evil-content"></iframe>less comment.',
                    rating: 1,
                    captchaId: json.captchaId,
                    captcha: json.answer
                }
            })
                .expect('status', 201)
                .expect('json', 'data', {
                comment: 'I am a harmless comment.'
            });
        });
    });
    if (utils.isChallengeEnabled(datacache_1.challenges.persistedXssFeedbackChallenge)) {
        it('POST fails to sanitize masked XSS-attack by not applying sanitization recursively', () => {
            return frisby.get(REST_URL + '/captcha')
                .expect('status', 200)
                .expect('header', 'content-type', /application\/json/)
                .then(({ json }) => {
                return frisby.post(API_URL + '/Feedbacks', {
                    headers: jsonHeader,
                    body: {
                        comment: 'The sanitize-html module up to at least version 1.4.2 has this issue: <<script>Foo</script>iframe src="javascript:alert(`xss`)">',
                        rating: 1,
                        captchaId: json.captchaId,
                        captcha: json.answer
                    }
                })
                    .expect('status', 201)
                    .expect('json', 'data', {
                    comment: 'The sanitize-html module up to at least version 1.4.2 has this issue: <iframe src="javascript:alert(`xss`)">'
                });
            });
        });
    }
    it('POST feedback in another users name as anonymous user', () => {
        return frisby.get(REST_URL + '/captcha')
            .expect('status', 200)
            .expect('header', 'content-type', /application\/json/)
            .then(({ json }) => {
            return frisby.post(API_URL + '/Feedbacks', {
                headers: jsonHeader,
                body: {
                    comment: 'Lousy crap! You use sequelize 1.7.x? Welcome to SQL Injection-land, morons! As if that is not bad enough, you use z85/base85 and hashids for crypto? Even MD5 to hash passwords! Srsly?!?!',
                    rating: 1,
                    UserId: 3,
                    captchaId: json.captchaId,
                    captcha: json.answer
                }
            })
                .expect('status', 201)
                .expect('header', 'content-type', /application\/json/)
                .expect('json', 'data', {
                UserId: 3
            });
        });
    });
    it('POST feedback in a non-existing users name as anonymous user fails with constraint error', () => {
        return frisby.get(REST_URL + '/captcha')
            .expect('status', 200)
            .expect('header', 'content-type', /application\/json/)
            .then(({ json }) => {
            return frisby.post(API_URL + '/Feedbacks', {
                headers: jsonHeader,
                body: {
                    comment: 'Pickle Rick says your express-jwt 0.1.3 has Eurogium Edule and Hueteroneel in it!',
                    rating: 0,
                    UserId: 4711,
                    captchaId: json.captchaId,
                    captcha: json.answer
                }
            })
                .expect('status', 500)
                .expect('header', 'content-type', /application\/json/)
                .then(({ json }) => {
                (0, globals_1.expect)(json.errors).toContain('SQLITE_CONSTRAINT: FOREIGN KEY constraint failed');
            });
        });
    });
    it('POST feedback is associated with current user', () => {
        return frisby.post(REST_URL + '/user/login', {
            headers: jsonHeader,
            body: {
                email: 'bjoern.kimminich@gmail.com',
                password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
            }
        })
            .expect('status', 200)
            .then(({ json: jsonLogin }) => {
            return frisby.get(REST_URL + '/captcha')
                .expect('status', 200)
                .expect('header', 'content-type', /application\/json/)
                .then(({ json }) => {
                return frisby.post(API_URL + '/Feedbacks', {
                    headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
                    body: {
                        comment: 'Stupid JWT secret and being typosquatted by epilogue-js and ngy-cookie!',
                        rating: 5,
                        UserId: 4,
                        captchaId: json.captchaId,
                        captcha: json.answer
                    }
                })
                    .expect('status', 201)
                    .expect('header', 'content-type', /application\/json/)
                    .expect('json', 'data', {
                    UserId: 4
                });
            });
        });
    });
    it('POST feedback is associated with any passed user ID', () => {
        return frisby.post(REST_URL + '/user/login', {
            headers: jsonHeader,
            body: {
                email: 'bjoern.kimminich@gmail.com',
                password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
            }
        })
            .expect('status', 200)
            .then(({ json: jsonLogin }) => {
            return frisby.get(REST_URL + '/captcha')
                .expect('status', 200)
                .expect('header', 'content-type', /application\/json/)
                .then(({ json }) => {
                return frisby.post(API_URL + '/Feedbacks', {
                    headers: { Authorization: 'Bearer ' + jsonLogin.authentication.token, 'content-type': 'application/json' },
                    body: {
                        comment: 'Bender\'s choice award!',
                        rating: 5,
                        UserId: 3,
                        captchaId: json.captchaId,
                        captcha: json.answer
                    }
                })
                    .expect('status', 201)
                    .expect('header', 'content-type', /application\/json/)
                    .expect('json', 'data', {
                    UserId: 3
                });
            });
        });
    });
    it('POST feedback can be created without actually supplying comment', () => {
        return frisby.get(REST_URL + '/captcha')
            .expect('status', 200)
            .expect('header', 'content-type', /application\/json/)
            .then(({ json }) => {
            return frisby.post(API_URL + '/Feedbacks', {
                headers: jsonHeader,
                body: {
                    rating: 1,
                    captchaId: json.captchaId,
                    captcha: json.answer
                }
            })
                .expect('status', 201)
                .expect('header', 'content-type', /application\/json/)
                .expect('json', 'data', {
                comment: null,
                rating: 1
            });
        });
    });
    it('POST feedback cannot be created without actually supplying rating', () => {
        return frisby.get(REST_URL + '/captcha')
            .expect('status', 200)
            .expect('header', 'content-type', /application\/json/)
            .then(({ json }) => {
            return frisby.post(API_URL + '/Feedbacks', {
                headers: jsonHeader,
                body: {
                    captchaId: json.captchaId,
                    captcha: json.answer
                }
            })
                .expect('status', 400)
                .expect('header', 'content-type', /application\/json/)
                .expect('jsonTypes', {
                message: Joi.string()
            })
                .then(({ json }) => {
                (0, globals_1.expect)(json.message.match(/notNull Violation: (Feedback\.)?rating cannot be null/));
            });
        });
    });
    it('POST feedback cannot be created with wrong CAPTCHA answer', () => {
        return frisby.get(REST_URL + '/captcha')
            .expect('status', 200)
            .expect('header', 'content-type', /application\/json/)
            .then(({ json }) => {
            return frisby.post(API_URL + '/Feedbacks', {
                headers: jsonHeader,
                body: {
                    rating: 1,
                    captchaId: json.captchaId,
                    captcha: (json.answer + 1)
                }
            })
                .expect('status', 401);
        });
    });
    it('POST feedback cannot be created with invalid CAPTCHA id', () => {
        return frisby.get(REST_URL + '/captcha')
            .expect('status', 200)
            .expect('header', 'content-type', /application\/json/)
            .then(({ json }) => {
            return frisby.post(API_URL + '/Feedbacks', {
                headers: jsonHeader,
                body: {
                    rating: 1,
                    captchaId: 999999,
                    captcha: 42
                }
            })
                .expect('status', 401);
        });
    });
});
describe('/api/Feedbacks/:id', () => {
    it('GET existing feedback by id is forbidden via public API', () => {
        return frisby.get(API_URL + '/Feedbacks/1')
            .expect('status', 401);
    });
    it('GET existing feedback by id', () => {
        return frisby.get(API_URL + '/Feedbacks/1', { headers: authHeader })
            .expect('status', 200);
    });
    it('PUT update existing feedback is forbidden via public API', () => {
        return frisby.put(API_URL + '/Feedbacks/1', {
            headers: jsonHeader,
            body: {
                comment: 'This sucks like nothing has ever sucked before',
                rating: 1
            }
        })
            .expect('status', 401);
    });
    it('PUT update existing feedback', () => {
        return frisby.put(API_URL + '/Feedbacks/2', {
            headers: authHeader,
            body: {
                rating: 0
            }
        })
            .expect('status', 401);
    });
    it('DELETE existing feedback is forbidden via public API', () => {
        return frisby.del(API_URL + '/Feedbacks/1')
            .expect('status', 401);
    });
    it('DELETE existing feedback', () => {
        return frisby.get(REST_URL + '/captcha')
            .expect('status', 200)
            .expect('header', 'content-type', /application\/json/)
            .then(({ json }) => {
            return frisby.post(API_URL + '/Feedbacks', {
                headers: jsonHeader,
                body: {
                    comment: 'I will be gone soon!',
                    rating: 1,
                    captchaId: json.captchaId,
                    captcha: json.answer
                }
            })
                .expect('status', 201)
                .expect('jsonTypes', 'data', { id: Joi.number() })
                .then(({ json }) => {
                return frisby.del(API_URL + '/Feedbacks/' + json.data.id, { headers: authHeader })
                    .expect('status', 200);
            });
        });
    });
});
//# sourceMappingURL=feedbackApiSpec.js.map