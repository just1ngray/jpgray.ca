import * as k8s from "@pulumi/kubernetes";

import { ns, name } from "./namespace";
import { pvc } from "./pvc";


export const labels = {
    app: name,
};

const volumeName = "database";

export const statefulset = new k8s.apps.v1.StatefulSet(name, {
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
                    image: "ghcr.io/just1ngray/listless:7e601c90ec7d9891422343187b0b88fdced54e25",
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
