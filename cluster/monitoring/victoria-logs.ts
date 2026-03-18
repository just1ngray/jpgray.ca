import * as k8s from "@pulumi/kubernetes";

import { ns } from "./namespace";


export const victoriaLogsChart = new k8s.helm.v3.Release("victoria-logs", {
    chart: "victoria-logs-single",
    repositoryOpts: { repo: "https://victoriametrics.github.io/helm-charts/" },
    namespace: ns.metadata.name,
    values: {
        server: {
            retentionPeriod: "60d",
            persistentVolume: {
                size: "5Gi",
            },
        },
    },
});

/**
 * Deploys a collector to each node in the cluster. Grabs both k8s and host logs!
 */
export const victoriaLogsCollectorChart = new k8s.helm.v3.Release("victoria-logs-collector", {
    chart: "victoria-logs-collector",
    repositoryOpts: { repo: "https://victoriametrics.github.io/helm-charts/" },
    namespace: ns.metadata.name,
    values: {
        remoteWrite: [
            {
                url: victoriaLogsChart.name.apply(releaseName => `http://${releaseName}-victoria-logs-single-server:9428`)
            },
        ],
    },
});
