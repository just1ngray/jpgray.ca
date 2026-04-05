import * as k8s from "@pulumi/kubernetes";

import { name, ns } from "./namespace";


export const pvc = new k8s.core.v1.PersistentVolumeClaim(name, {
    metadata: { namespace: ns.metadata.name },
    spec: {
        accessModes: ["ReadWriteOncePod"],
        storageClassName: "local-path",
        resources: {
            requests: {
                storage: "2Gi",
            },
        },
    },
});
