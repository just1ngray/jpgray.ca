import * as k8s from "@pulumi/kubernetes";

import { ns } from "./namespace";


/**
 * Although I have significantly more experience with Mimir backend, VictoriaMetrics _should_ be compatible and
 * _should_ be way less resource hungry on my small personal cluster.
 *
 * To scrape metrics from a pod, the following annotations must be added.
 * ```
 * {
 *      // enable scraping
 *      "prometheus.io/scrape": "true",
 *
 *      // choose the port where the http metrics endpoint is available
 *      "prometheus.io/port": "8080",
 *
 *      // override the path where the metrics are available; defaults to "/metrics"
 *      "prometheus.io/path": "/metrics",
 * }
 * ```
 */
export const victoriaMetricsChart = new k8s.helm.v3.Release("victoria-metrics", {
    chart: "victoria-metrics-single",
    version: "0.33.0",
    repositoryOpts: { repo: "https://victoriametrics.github.io/helm-charts/" },
    // must explicitly set a short name because otherwise we go over the 63 character limit
    // - pulumi will set the name to `victoria-metrics` to match above, plus a random string to deduplicate
    // - then the helm chart adds `-victoria-metrics-single-server`
    // - then when creating a pod, kubernetes will add another random suffix
    name: "vm",
    namespace: ns.metadata.name,
    values: {
        server: {
            retentionPeriod: "60d",
            persistentVolume: {
                size: "5Gi",
            },
            scrape: {
                enabled: true,
            },
        },
    },
});
