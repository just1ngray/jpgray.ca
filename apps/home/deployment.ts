import * as k8s from "@pulumi/kubernetes";

import { ns } from "./namespace";


export const name = "home";
export const labels = {
    app: name,
};

export const deployment = new k8s.apps.v1.Deployment(name, {
    metadata: {
        name: name,
        namespace: ns.metadata.name,
    },
    spec: {
        selector: { matchLabels: labels },
        template: {
            metadata: { labels },
            spec: {
                containers: [{
                    name: "website",
                    image: "ghcr.io/just1ngray/website:de10e3fa2d7e53954989bcd7b254debebafdeef1",
                }],
            }
        }
    },
});
