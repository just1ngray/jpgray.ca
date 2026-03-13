import * as k8s from "@pulumi/kubernetes";


export const ns = new k8s.core.v1.Namespace("cert-manager", {
    metadata: { name: "cert-manager" },
});

export const cert_manager = new k8s.helm.v4.Chart("cert-manager", {
    chart: "oci://quay.io/jetstack/charts/cert-manager:v1.20.0",
    namespace: ns.metadata.name,
    values: {
        crds: { enabled: true },
    },
}, { dependsOn: ns });
