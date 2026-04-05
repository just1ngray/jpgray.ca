import * as k8s from "@pulumi/kubernetes";


export const name = "listless";

export const ns = new k8s.core.v1.Namespace(name, {
    metadata: { name }
});
