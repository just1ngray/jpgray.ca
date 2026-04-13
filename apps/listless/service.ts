import * as k8s from "@pulumi/kubernetes";

import { ns, name } from "./namespace";
import { statefulset, labels } from "./statefulset";


export const service = new k8s.core.v1.Service(name, {
    metadata: {
        name,
        namespace: ns.metadata.name,
    },
    spec: {
        selector: labels,
        ports: [{ port: 80, targetPort: 3000 }],
    },
}, { dependsOn: statefulset });
