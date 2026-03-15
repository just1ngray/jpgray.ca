import { ns } from "./namespace";
import { configmaps } from "./configmaps";
import { name, labels, deployment } from "./deployment";
import { service } from "./service";
import { ingress } from "./ingress";

export const home = {
    name,
    ns,
    configmaps,
    labels,
    deployment,
    service,
    ingress,
};
