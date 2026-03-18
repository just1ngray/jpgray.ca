import * as k8s from "@pulumi/kubernetes";


export const ns = new k8s.core.v1.Namespace("monitoring", {
    metadata: { name: "monitoring" },
});
