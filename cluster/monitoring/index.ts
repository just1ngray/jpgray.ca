import * as namespace from "./namespace";
import * as victoriaLogs from "./victoria-logs";
import * as grafana from "./grafana";

export const monitoring = {
    ...namespace,
    ...victoriaLogs,
    ...grafana,
};
