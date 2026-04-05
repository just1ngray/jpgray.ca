import * as k8s from "@pulumi/kubernetes";

import { ns, name } from "./namespace";
import { pvc } from "./pvc";


export const labels = {
    app: name,
};

const volumeName = "database";

export const deployment = new k8s.apps.v1.Deployment(name, {
    metadata: {
        name: name,
        namespace: ns.metadata.name,
    },
    spec: {
        replicas: 1,
        selector: { matchLabels: labels },
        template: {
            metadata: { labels },
            spec: {
                volumes: [{
                    name: volumeName,
                    persistentVolumeClaim: {
                        claimName: pvc.metadata.name,
                    },
                }],
                containers: [{
                    name: "listless",
                    image: "ghcr.io/just1ngray/listless:0a0f36a60c9d0f134106bdaa621a2f421c0075e1",
                    volumeMounts: [{
                        name: volumeName,
                        mountPath: "/listless/db",
                    }],
                    env: [{
                        name: "LISTLESS_DB_FILENAME",
                        value: "/listless/db/sqlite.db",
                    }],
                }],
            },
        },
    },
});
