import * as crypto from "node:crypto";


import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

import { ns } from "./namespace";
import { configmaps } from "./configmaps";


export const name = "home-static";
export const labels = {
    app: name,
};

export const deployment = new k8s.apps.v1.Deployment(name, {
    metadata: {
        name: name,
        namespace: ns.metadata.name,
    },
    spec: {
        selector: { matchLabels: labels },
        template: {
            metadata: {
                labels,
                annotations: {
                    // this checksum ensures the pod is restarted if the static files are changed
                    "checksum/static-contents": pulumi.all(configmaps.map(cm => cm.data)).apply(allData => {
                        const hash = crypto.createHash("sha256");
                        hash.update(JSON.stringify(allData));
                        return hash.digest("hex");
                    }),
                }
            },
            spec: {
                containers: [{
                    name: "nginx",
                    image: "nginx:1.28.2-alpine",
                    volumeMounts: configmaps.map(configmap => ({
                        name: configmap.metadata.name,
                        mountPath: pulumi.interpolate`/usr/share/nginx/html/${configmap.data.filename}`,
                        subPath: "html",
                    })),
                }],
                volumes: configmaps.map(configmap => ({
                    name: configmap.metadata.name,
                    configMap: { name: configmap.metadata.name }
                })),
            }
        }
    },
});
