import * as k8s from "@pulumi/kubernetes";
import * as fs from "fs";
import * as path from "path";

export const traefikConfig = new k8s.apiextensions.CustomResource("traefik-config", {
    apiVersion: "helm.cattle.io/v1",
    kind: "HelmChartConfig",
    metadata: {
        name: "traefik",
        namespace: "kube-system",
    },
    spec: {
        valuesContent: fs.readFileSync(path.join(__dirname, "spec_valuesContent.yaml"), "utf-8"),
    },
});
