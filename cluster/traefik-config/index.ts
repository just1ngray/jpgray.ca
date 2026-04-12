import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";


/**
 * Drops the 'www' before processing the request.
 * E.g., `https://www.jpgray.ca` will go to `https://jpgray.ca` instead.
 *
 * Usage on a specific ingress:
 * (example at /apps/home/ingress.ts)
 *
 * 1. Add annoation:
 *      k: "traefik.ingress.kubernetes.io/router.middlewares":
 *      v: pulumi.interpolate`${middlewareWwwDrop.metadata.namespace}-${middlewareWwwDrop.metadata.name}@kubernetescrd`
 * 2. Add an identical rule for the www version of the host
 * 3. Add a www url for the tls cert
 */
export const middlewareWwwDrop = new k8s.apiextensions.CustomResource("www-redirect", {
    apiVersion: "traefik.io/v1alpha1",
    kind: "Middleware",
    metadata: {
        name: "www-redirect",
        namespace: "kube-system",
    },
    spec: {
        redirectRegex: {
            regex: `^(https?://)www.(.*)$`,
            replacement: "${1}${2}"
        },
    },
});

export const traefikConfig = new k8s.apiextensions.CustomResource("traefik-config", {
    apiVersion: "helm.cattle.io/v1",
    kind: "HelmChartConfig",
    metadata: {
        name: "traefik",
        namespace: "kube-system",
    },
    spec: {
        valuesContent: pulumi.jsonStringify({
            ports: {
                web: {
                    // auto-upgrade http to https for all ingress
                    redirections: {
                        entryPoint: {
                            to: "websecure",
                            scheme: "https",
                            permanent: true,
                        },
                    },
                },
            },
            service: {
                spec: {
                    // preserve the real client IP address in headers
                    externalTrafficPolicy: "Local",
                },
            },
        }),
    },
});
