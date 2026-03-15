import fs from "node:fs";
import path from "node:path";

import * as k8s from "@pulumi/kubernetes";
import { globSync } from "glob";

import { ns } from "./namespace";


const staticDir = path.join(__dirname, "static");

export const configmaps = globSync(`${staticDir}/**`, { nodir: true, follow: false })
    .map(filepath => {
        const contents = fs.readFileSync(filepath, { encoding: "utf-8" });
        const filename = path.relative(staticDir, filepath);

        // name must be a "safe" kubernetes resource name
        const name = `home-static-${filename}`.replace(/[^a-z0-9-]/g, "--");

        return new k8s.core.v1.ConfigMap(name, {
            metadata: { name, namespace: ns.metadata.name },
            data: {
                filename: filename,
                html: contents
            }
        });
    });
