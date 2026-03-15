import * as k8s from "@pulumi/kubernetes";

import { ns } from "./namespace";
import { name } from "./deployment";
import { service } from "./service";
import { getDomain, cluster_issuer } from "../../cluster";


const url = getDomain("");

export const ingress = new k8s.networking.v1.Ingress(name, {
    metadata: {
        name: name,
        namespace: ns.metadata.name,
        annotations: {
            "kubernetes.io/ingress.class": "traefik",
            "cert-manager.io/cluster-issuer": cluster_issuer.metadata.name,
        },
    },
    spec: {
        rules: [{
            host: url,
            http: {
                paths: [{
                    path: "/",
                    pathType: "Prefix",
                    backend: {
                        service: { name: name, port: { number: 80 } },
                    },
                }],
            },
        }],
        tls: [{
            hosts: [url],
            secretName: `${name}-tls`,
        }]
    },
}, { dependsOn: service });
