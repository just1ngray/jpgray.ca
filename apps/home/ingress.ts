import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

import { ns } from "./namespace";
import { name } from "./deployment";
import { service } from "./service";
import { getDomain, cluster_issuer, middlewareWwwDrop } from "../../cluster";


const url = getDomain("");
const wwwUrl = `www.${url}`;

export const ingress = new k8s.networking.v1.Ingress(name, {
    metadata: {
        name: name,
        namespace: ns.metadata.name,
        annotations: {
            "kubernetes.io/ingress.class": "traefik",
            "cert-manager.io/cluster-issuer": cluster_issuer.metadata.name,
            "traefik.ingress.kubernetes.io/router.middlewares": pulumi.interpolate`${middlewareWwwDrop.metadata.namespace}-${middlewareWwwDrop.metadata.name}@kubernetescrd`,
        },
    },
    spec: {
        rules: [url, wwwUrl].map(host => ({
            host: host,
            http: {
                paths: [{
                    path: "/",
                    pathType: "Prefix",
                    backend: {
                        service: { name: name, port: { number: 80 } },
                    },
                }],
            },
        })),
        tls: [{
            hosts: [url, wwwUrl],
            secretName: `${name}-tls`,
        }]
    },
}, { dependsOn: service });
