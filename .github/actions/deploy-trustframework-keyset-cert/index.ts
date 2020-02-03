const core = require('@actions/core');
import fs from 'fs';
import "isomorphic-fetch";
import { Client, GraphError } from "@microsoft/microsoft-graph-client";
import { GraphAuthProvider } from "../common/GraphAuthProvider"

async function main() {
    try {
        const name = core.getInput('name')
        const file = core.getInput('file');
        const password = core.getInput('password');
        const tenant = core.getInput('tenant');
        const clientId = core.getInput('clientId');
        const clientSecret = core.getInput('clientSecret');

        const client = Client.initWithMiddleware({
            authProvider: new GraphAuthProvider(tenant, clientId, clientSecret),
            defaultVersion: "beta"
        });
    
        let buffer = new Buffer(fs.readFileSync(file));
        let fileBase64 = buffer.toString("base64");

        try {
            // Create in case it does not already exist
            await client.api("trustFramework/keySets").create({
                id: name
            });
        } catch { }

        try {
              // Then upload the certificate
              let response = await client.api(`trustFramework/keySets/${name}/uploadPkcs12`).post({
                key: fileBase64,
                password: password
            });
            core.info("Uploaded certificate using Microsoft Graph: " + response)
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