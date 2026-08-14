import { apiService } from "./api.service";
import type { DeviceAlert } from "./device.service";

export interface UsableDay {
  day: number;
  pct: number;
  kind: "ok" | "beard" | "offline" | "none";
}

class AlertService {
  private static instance: AlertService;

  private constructor() {}

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  public async listAlerts(workspaceId: string): Promise<DeviceAlert[]> {
    const response = await apiService.get<DeviceAlert[]>(
      `/workspaces/${workspaceId}/alerts`,
    );
    return response.data || [];
  }

  public async acknowledgeAlert(
    workspaceId: string,
    alertId: string,
  ): Promise<void> {
    await apiService.post(
      `/workspaces/${workspaceId}/alerts/${alertId}/acknowledge`,
    );
  }

  public async getUsableDays(
    workspaceId: string,
    year: number,
    month: number,
  ): Promise<UsableDay[]> {
    const response = await apiService.get<UsableDay[]>(
      `/workspaces/${workspaceId}/alerts/usable-days?year=${year}&month=${month}`,
    );
    return response.data || [];
  }
}

export const alertService = AlertService.getInstance();
