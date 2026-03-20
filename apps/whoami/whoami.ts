import * as k8s from "@pulumi/kubernetes";

import { ns } from "./namespace";
import { getDomain, cluster_issuer } from "../../cluster";


export const labels = { app: "whoami" };

export const deployment = new k8s.apps.v1.Deployment("whoami", {
    metadata: { name: "whoami", namespace: ns.metadata.name },
    spec: {
        replicas: 1,
        selector: { matchLabels: labels },
        template: {
            metadata: { labels },
            spec: {
                containers: [{
                    name: "whoami",
                    image: "traefik/whoami:v1.11.0",
                    ports: [{ containerPort: 80 }],
                }],
            },
        },
    },
}, { dependsOn: ns });

export const service = new k8s.core.v1.Service("whoami", {
    metadata: { name: "whoami", namespace: ns.metadata.name },
    spec: {
        selector: labels,
        ports: [{ port: 80, targetPort: 80 }],
    },
}, { dependsOn: deployment });

export const ingress = new k8s.networking.v1.Ingress("whoami", {
    metadata: {
        name: "whoami",
        namespace: ns.metadata.name,
        annotations: {
            "kubernetes.io/ingress.class": "traefik",
            "cert-manager.io/cluster-issuer": cluster_issuer.metadata.name,
        },
    },
    spec: {
        rules: [{
            host: getDomain("whoami"),
            http: {
                paths: [{
                    path: "/",
                    pathType: "Prefix",
                    backend: {
                        service: { name: "whoami", port: { number: 80 } },
                    },
                }],
            },
        }],
        tls: [{
            hosts: [getDomain("whoami")],
            secretName: "whoami-tls",
        }]
    },
}, { dependsOn: service });
