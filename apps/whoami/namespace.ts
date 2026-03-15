import * as k8s from "@pulumi/kubernetes";

export const ns = new k8s.core.v1.Namespace("whoami", {
    metadata: { name: "whoami" },
});
