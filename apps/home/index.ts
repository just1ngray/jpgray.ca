import { ns } from "./namespace";
import { name, labels, deployment } from "./deployment";
import { service } from "./service";
import { ingress } from "./ingress";

export const home = {
    name,
    ns,
    labels,
    deployment,
    service,
    ingress,
};
