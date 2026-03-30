import * as k8s from "@pulumi/kubernetes";

import { ns } from "./namespace";


export const name = "home-static";
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
                    image: "ghcr.io/just1ngray/website:e3bc3de216e51e0bb07c30ee136a36d37d375c3c",
                }],
            }
        }
    },
});
