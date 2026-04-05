import { ns, name } from "./namespace";
import { pvc } from "./pvc";
import { deployment } from "./deployment";
import { service } from "./service";
import { ingress } from "./ingress";


export const listless = {
    name,
    ns,
    pvc,
    deployment,
    service,
    ingress,
};
