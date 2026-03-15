import * as k8s from "@pulumi/kubernetes";

import { cert_manager } from "./cert-manager";


export function getDomain(sub: string): string {
    if (sub.length === 0) {
        return "jpgray.ca";
    }
    else {
        return `${sub}.jpgray.ca`;
    }
}

/**
 * Ref. https://cert-manager.io/docs/configuration/acme/
 */
export const cluster_issuer = new k8s.apiextensions.CustomResource("cluster-issuer", {
    apiVersion: "cert-manager.io/v1",
    kind: "ClusterIssuer",
    metadata: {
        name: "letsencrypt-production", // staging: "letsencrypt-staging"
    },
    spec: {
        acme: {
            // You must replace this email address with your own.
            email: "just1ngray@outlook.com",
            // If the ACME server supports profiles, you can specify the profile name here.
            // See #acme-certificate-profiles below.
            // profile: "tlsserver", // Ref. https://letsencrypt.org/docs/profiles/
            server: "https://acme-v02.api.letsencrypt.org/directory", // staging: "https://acme-staging-v02.api.letsencrypt.org/directory"
            privateKeySecretRef: {
                // Secret resource that will be used to store the account's private key.
                // This is your identity with your ACME provider. Any secret name may be
                // chosen. It will be populated with data automatically, so generally
                // nothing further needs to be done with the secret. If you lose this
                // identity/secret, you will be able to generate a new one and generate
                // certificates for any/all domains managed using your previous account,
                // but you will be unable to revoke any certificates generated using that
                // previous account.
                name: "issuer-account-key",
            },
            // Add a single challenge solver, HTTP01 using nginx
            solvers: [
                {
                    http01: {
                        ingress: {
                            ingressClassName: "traefik",
                        }
                    }
                },
            ]
        }
    },
}, { dependsOn: cert_manager });
