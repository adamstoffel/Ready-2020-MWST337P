"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const openid_client_1 = require("openid-client");
class GraphAuthProvider {
    constructor(tenant, clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.authClient = openid_client_1.Issuer.discover(`https://login.microsoftonline.com/${tenant}/v2.0/.well-known/openid-configuration`).then(issuer => {
            let client = new issuer.Client({
                client_id: clientId,
                client_secret: clientSecret
            });
            return client;
        });
    }
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.cachedToken || this.cachedToken.expired()) {
                yield this.acquireNewToken();
            }
            return this.cachedToken.access_token;
        });
    }
    acquireNewToken() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cachedToken = yield (yield this.authClient).grant({
                grant_type: "client_credentials",
                client_id: this.clientId,
                client_secret: this.clientSecret,
                scope: GraphAuthProvider.scope
            });
        });
    }
}
GraphAuthProvider.scope = "https://graph.microsoft.com/.default";
exports.GraphAuthProvider = GraphAuthProvider;
