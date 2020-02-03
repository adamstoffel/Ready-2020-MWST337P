const core = require('@actions/core');
import fs from 'fs';
import "isomorphic-fetch";
import { Client, GraphError } from "@microsoft/microsoft-graph-client";
import { GraphAuthProvider } from "../common/GraphAuthProvider"

async function main() {
    try {
        const file = core.getInput('file');
        const policy = core.getInput('policy')
        const tenant = core.getInput('tenant');
        const clientId = core.getInput('clientId');
        const clientSecret = core.getInput('clientSecret');

        let client = Client.initWithMiddleware({
            authProvider: new GraphAuthProvider(tenant, clientId, clientSecret),
            defaultVersion: "beta"
        });

        let fileStream = fs.createReadStream(file);
        try {
            let response = await client.api(`trustFramework/policies/${policy}/$value`).putStream(fileStream);
            core.info("Wrote policy using Microsoft Graph: " + response)
        } catch (error) {
            throw `${(error as GraphError).statusCode} : ${(error as GraphError).message} : ${(error as GraphError).body}`
        }
    } catch (error) {
        let errorText = typeof error === "string" ? error : error.constructor.name;
        core.error("Action failed: " + errorText);
        core.setFailed();
    }
}

main();