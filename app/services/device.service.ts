import { apiService } from "./api.service";
import { ApiException } from "./api-config";

export type AlertType =
  | "SSD_MISSING"
  | "UNDERVOLTAGE"
  | "DISK_FULL"
  | "UNPULLED_DELETED"
  | "SHARPNESS"
  | "BEARD"
  | "TIME_NOT_SYNCED";

export type AlertState = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
export type AlertSeverity = "INFO" | "WARNING" | "ERROR";

export interface DeviceAlert {
  id: string;
  deviceId: string;
  deviceName: string | null;
  type: AlertType;
  state: AlertState;
  severity: AlertSeverity;
  context: Record<string, unknown> | null;
  openedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}

export interface Device {
  id: string;
  name: string | null;
  deviceId: string;
  online: boolean;
  lastHeartbeatAt: string | null;
  activeAlerts: DeviceAlert[];
}

export interface Heartbeat {
  receivedAt: string;
  sentAt: string;
  ssdMounted: boolean;
  diskFreeBytes: string | null;
  diskUsedRatio: number | null;
  throttled: string | null;
  cpuTempC: number | null;
  wifiRssi: number | null;
  timeSynced: boolean;
  lastRecordingAt: string | null;
  lastRecordingUsable: boolean | null;
  sharpness: number | null;
  brightness: number | null;
  beardDensity: number | null;
  oldestDay: string | null;
  unpulledDeleted: number;
  queueDepth: number;
  clipsRecorded: number | null;
  fwVersion: string | null;
}

export interface TrendPoint {
  at: string;
  value: number;
}

export interface DailyHeartbeatPoint {
  receivedAt: string;
  ssdMounted: boolean;
  beardDensity: number | null;
  lastRecordingUsable: boolean | null;
}

export interface DeviceDetail extends Device {
  fwVersion: string | null;
  lat: number | null;
  lon: number | null;
  recordingMode: "sparse" | "continuous";
  createdAt: string;
  latestHeartbeat: Heartbeat | null;
  sharpnessMedian7d: number | null;
  sharpnessTrend: TrendPoint[];
  cpuTempTrend: TrendPoint[];
  diskUsedTrend: TrendPoint[];
  todaysHeartbeats: DailyHeartbeatPoint[];
}

export interface UpdateDeviceInput {
  name?: string;
  lat?: number;
  lon?: number;
  recordingMode?: "SPARSE" | "CONTINUOUS";
}

export interface PairDeviceInput {
  pairingCode: string;
  workspaceId: string;
  name?: string;
  lat?: number;
  lon?: number;
}

/**
 * Workspace-Sicht auf Geräte für die Webapp. Getrennt vom Device-Wire-Format
 * (snake_case, docs/device-api.md) — das spricht nur der Pi, nie der Browser.
 */
class DeviceService {
  private static instance: DeviceService;

  private constructor() {}

  public static getInstance(): DeviceService {
    if (!DeviceService.instance) {
      DeviceService.instance = new DeviceService();
    }
    return DeviceService.instance;
  }

  public async listDevices(workspaceId: string): Promise<Device[]> {
    const response = await apiService.get<Device[]>(
      `/workspaces/${workspaceId}/devices`,
    );
    return response.data || [];
  }

  public async getDevice(
    workspaceId: string,
    deviceId: string,
  ): Promise<DeviceDetail> {
    const response = await apiService.get<DeviceDetail>(
      `/workspaces/${workspaceId}/devices/${deviceId}`,
    );

    if (!response.data) {
      throw new ApiException({
        message: "Gerät nicht gefunden",
        status: 404,
      });
    }

    return response.data;
  }

  public async updateDevice(
    workspaceId: string,
    deviceId: string,
    input: UpdateDeviceInput,
  ): Promise<DeviceDetail> {
    const response = await apiService.patch<DeviceDetail>(
      `/workspaces/${workspaceId}/devices/${deviceId}`,
      input,
    );

    if (!response.data) {
      throw new ApiException({
        message: "Gerät konnte nicht aktualisiert werden",
        status: 500,
      });
    }

    return response.data;
  }

  public async unpairDevice(
    workspaceId: string,
    deviceId: string,
  ): Promise<void> {
    await apiService.delete(`/workspaces/${workspaceId}/devices/${deviceId}`);
  }

  public async rotateToken(
    workspaceId: string,
    deviceId: string,
  ): Promise<void> {
    await apiService.post(
      `/workspaces/${workspaceId}/devices/${deviceId}/rotate-token`,
    );
  }

  /**
   * Redeemt einen Pairing-Code. Läuft über /devices/pair (nicht workspace-
   * genestet) — das ist der bestehende, in docs/device-api.md dokumentierte
   * Endpunkt, den auch das Setup-Portal-Onboarding referenziert.
   */
  public async pairDevice(
    input: PairDeviceInput,
  ): Promise<{ id: string; deviceId: string; status: string }> {
    const response = await apiService.post<{
      id: string;
      device_id: string;
      status: string;
    }>("/devices/pair", {
      pairing_code: input.pairingCode,
      workspace_id: input.workspaceId,
      name: input.name,
      lat: input.lat,
      lon: input.lon,
    });

    if (!response.data) {
      throw new ApiException({
        message: "Gerät konnte nicht gekoppelt werden",
        status: 500,
      });
    }

    // `id` ist die interne DB-ID (für /workspaces/:id/devices/:id-Aufrufe),
    // `deviceId` der vom Pi selbst vergebene String — nicht verwechseln,
    // das war schon einmal ein 404-Bug.
    return {
      id: response.data.id,
      deviceId: response.data.device_id,
      status: response.data.status,
    };
  }
}

export const deviceService = DeviceService.getInstance();
