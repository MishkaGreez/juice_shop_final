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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductReviews = void 0;
const challengeUtils = __importStar(require("../lib/challengeUtils"));
const mongodb_1 = require("../data/mongodb");
const datacache_1 = require("../data/datacache");
const security = __importStar(require("../lib/insecurity"));
const utils = __importStar(require("../lib/utils"));
function createProductReviews() {
    return async (req, res) => {
        const user = security.authenticatedUsers.from(req);
        challengeUtils.solveIf(datacache_1.challenges.forgedReviewChallenge, () => user?.data?.email !== req.body.author);
        try {
            await mongodb_1.reviewsCollection.insert({
                product: req.params.id,
                message: req.body.message,
                author: req.body.author,
                likesCount: 0,
                likedBy: []
            });
            return res.status(201).json({ status: 'success' });
        }
        catch (err) {
            return res.status(500).json(utils.getErrorMessage(err));
        }
    };
}
exports.createProductReviews = createProductReviews;
//# sourceMappingURL=createProductReviews.js.map