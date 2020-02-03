const core = require('@actions/core');
import "isomorphic-fetch";
import { Client, GraphError } from "@microsoft/microsoft-graph-client";
import { GraphAuthProvider } from "../common/GraphAuthProvider"

async function main() {
    try {
        const value = core.getInput('value');
        const name = core.getInput('name')
        const tenant = core.getInput('tenant');
        const clientId = core.getInput('clientId');
        const clientSecret = core.getInput('clientSecret');

        const client = Client.initWithMiddleware({
            authProvider: new GraphAuthProvider(tenant, clientId, clientSecret),
            defaultVersion: "beta"
        });
    
        try {
            // Create in case it does not already exist
            await client.api("trustFramework/keySets").create({
                id: name
            });
        } catch { }

        try {
            // Then upload the secret
            let response = await client.api(`trustFramework/keySets/${name}/uploadSecret`).post({
                use: "sig",
                k: value
            });
            core.info("Uploaded secret using Microsoft Graph: " + response)
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