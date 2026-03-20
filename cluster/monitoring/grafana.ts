import * as k8s from "@pulumi/kubernetes";

import { ns } from "./namespace";
import { victoriaLogsChart } from "./victoria-logs";
import { victoriaMetricsChart } from "./victoria-metrics";
import { getDomain, cluster_issuer } from "../../cluster";


const VICTORIA_DATASOUCE_NAME_METRICS = "VictoriaMetrics";
const VICTORIA_DATASOUCE_NAME_LOGS = "VictoriaLogs";

/**
 * Deploy Grafana configured to use monitoring data sources.
 *
 * Grab the auto-generated login credentials through kubectl, k9s, or whatever by looking for a secret in the
 * `monitoring` namespace called `grafana-*`. It'll have `admin-user` and `admin-password` keys. Be sure to decode
 * the values from base64.
 */
export const grafanaChart = new k8s.helm.v3.Release("grafana", {
    chart: "grafana",
    version: "11.3.3",
    repositoryOpts: { repo: "https://grafana-community.github.io/helm-charts" },
    namespace: ns.metadata.name,
    values: {
        persistence: {
            type: "pvc",
            enabled: true,
        },
        ingress: {
            enabled: true,
            annotations: {
                "kubernetes.io/ingress.class": "traefik",
                "cert-manager.io/cluster-issuer": cluster_issuer.metadata.name,
            },
            hosts: [getDomain("grafana")],
            tls: [{
                hosts: [getDomain("grafana")],
                secretName: "grafana-tls",
            }],
        },
        plugins: ["victoriametrics-logs-datasource"],
        datasources: {
            "datasources.yaml": {
                apiVersion: 1,
                datasources: [
                    {
                        name: VICTORIA_DATASOUCE_NAME_LOGS,
                        type: "victoriametrics-logs-datasource",
                        url: victoriaLogsChart.name.apply(releaseName => `http://${releaseName}-victoria-logs-single-server:9428`),
                        isDefault: true,
                    },
                    {
                        name: VICTORIA_DATASOUCE_NAME_METRICS,
                        type: "prometheus",
                        url: victoriaMetricsChart.name.apply(releaseName => `http://${releaseName}-victoria-metrics-single-server:8428`),
                        isDefault: false,
                    },
                ],
            }
        },

        // import certain dashboards when provisioning grafana
        // 1. Make a dashboard provider. This is basically a folder where we will put pre-provisioned dashboards into
        dashboardProviders: {
            "dashboardproviders.yaml": {
                apiVersion: 1,
                providers: [{
                    name: "default",
                    orgId: 1,
                    folder: "",
                    type: "file",
                    disableDeletion: false,
                    options: { path: "/var/lib/grafana/dashboards/default" },
                }],
            },
        },
        // 2. Add dashboards to the folder we made in (1). Note, we could just import through the Grafana UI also!
        dashboards: {
            default: {
                "cert-manager": {
                    gnetId: 20340,
                    revision: 1,
                    datasource: [
                        {
                            name: "DS_PROMETHEUS",
                            value: VICTORIA_DATASOUCE_NAME_METRICS,
                        },
                    ],
                },
            },
        },

    },
});
