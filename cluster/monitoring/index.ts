import * as namespace from "./namespace";
import * as victoriaLogs from "./victoria-logs";
import * as victoriaMetrics from "./victoria-metrics";
import * as grafana from "./grafana";

export const monitoring = {
    ...namespace,
    ...victoriaLogs,
    ...victoriaMetrics,
    ...grafana,
};
