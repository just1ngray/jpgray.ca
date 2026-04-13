import { ns, name } from "./namespace";
import { pvc } from "./pvc";
import { statefulset } from "./statefulset";
import { service } from "./service";
import { ingress } from "./ingress";


export const listless = {
    name,
    ns,
    pvc,
    statefulset,
    service,
    ingress,
};
