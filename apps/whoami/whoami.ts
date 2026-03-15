import * as k8s from "@pulumi/kubernetes";

import { whoami_namespace } from "./namespace";
import { cluster_issuer } from "../../cluster";


export const labels = { app: "whoami" };

export const deployment = new k8s.apps.v1.Deployment("whoami", {
    metadata: { name: "whoami", namespace: whoami_namespace.metadata.name },
    spec: {
        replicas: 1,
        selector: { matchLabels: labels },
        template: {
            metadata: { labels },
            spec: {
                containers: [{
                    name: "whoami",
                    image: "traefik/whoami",
                    ports: [{ containerPort: 80 }],
                }],
            },
        },
    },
}, { dependsOn: whoami_namespace });

export const service = new k8s.core.v1.Service("whoami", {
    metadata: { name: "whoami", namespace: whoami_namespace.metadata.name },
    spec: {
        selector: labels,
        ports: [{ port: 80, targetPort: 80 }],
    },
}, { dependsOn: deployment });

export const ingress = new k8s.networking.v1.Ingress("whoami", {
    metadata: {
        name: "whoami",
        namespace: whoami_namespace.metadata.name,
        annotations: {
            "kubernetes.io/ingress.class": "traefik",
            "cert-manager.io/cluster-issuer": cluster_issuer.metadata.name,
        },
    },
    spec: {
        rules: [{
            host: "whoami.new.jpgray.ca",
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
            hosts: ["whoami.new.jpgray.ca"],
            secretName: "whoami-tls",
        }]
    },
}, { dependsOn: service });
