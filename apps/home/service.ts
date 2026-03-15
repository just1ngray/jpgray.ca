import * as k8s from "@pulumi/kubernetes";

import { ns } from "./namespace";
import { deployment, labels, name } from "./deployment";

export const service = new k8s.core.v1.Service(name, {
    metadata: {
        name,
        namespace: ns.metadata.name,
    },
    spec: {
        selector: labels,
        ports: [{ port: 80 }],
    },
}, { dependsOn: deployment });
