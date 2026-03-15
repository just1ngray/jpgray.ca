import * as k8s from "@pulumi/kubernetes";

import { ns } from "./namespace";
import { name } from "./deployment";
import { service } from "./service";
import { cluster_issuer } from "../../cluster";


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
            host: "new.jpgray.ca",
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
            hosts: ["new.jpgray.ca"],
            secretName: `${name}-tls`,
        }]
    },
}, { dependsOn: service });
