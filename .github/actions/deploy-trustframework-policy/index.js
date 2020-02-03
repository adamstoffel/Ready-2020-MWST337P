"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = require('@actions/core');
const fs_1 = __importDefault(require("fs"));
require("isomorphic-fetch");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const GraphAuthProvider_1 = require("../common/GraphAuthProvider");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = core.getInput('file');
            const policy = core.getInput('policy');
            const tenant = core.getInput('tenant');
            const clientId = core.getInput('clientId');
            const clientSecret = core.getInput('clientSecret');
            let client = microsoft_graph_client_1.Client.initWithMiddleware({
                authProvider: new GraphAuthProvider_1.GraphAuthProvider(tenant, clientId, clientSecret),
                defaultVersion: "beta"
            });
            let fileStream = fs_1.default.createReadStream(file);
            try {
                let response = yield client.api(`trustFramework/policies/${policy}/$value`).putStream(fileStream);
                core.info("Wrote policy using Microsoft Graph: " + response);
            }
            catch (error) {
                throw `${error.statusCode} : ${error.message} : ${error.body}`;
            }
        }
        catch (error) {
            let errorText = typeof error === "string" ? error : error.constructor.name;
            core.error("Action failed: " + errorText);
            core.setFailed();
        }
    });
}
main();
