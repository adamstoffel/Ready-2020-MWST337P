import { Issuer, Client, TokenSet } from "openid-client"
import { AuthenticationProvider } from "@microsoft/microsoft-graph-client";

export class GraphAuthProvider implements AuthenticationProvider {
    private static scope = "https://graph.microsoft.com/.default";

    constructor(tenant: string, private clientId: string, private clientSecret: string) {
        this.authClient = Issuer.discover(`https://login.microsoftonline.com/${tenant}/v2.0/.well-known/openid-configuration`).then(issuer => {
            let client = new issuer.Client({
                client_id: clientId,
                client_secret: clientSecret
            });
            return client;
        })
    }

    private authClient: Promise<Client>;
    private cachedToken: TokenSet;

    public async getAccessToken(): Promise<string> {
        if(!this.cachedToken || this.cachedToken.expired()) {
            await this.acquireNewToken();
        }
        return this.cachedToken.access_token;
    }

    private async acquireNewToken() {
        this.cachedToken = await (await this.authClient).grant({
            grant_type: "client_credentials",
            client_id: this.clientId,
            client_secret: this.clientSecret,
            scope: GraphAuthProvider.scope
        });
    }
}