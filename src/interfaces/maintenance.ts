export interface PendingMaintenance {
  id: string;
  boatId: string;
  boatName: string;
  startTime: string;
  endTime: string;
  reason?: string;
  createdAt: string;
  portMaintenanceServiceId?: string;
  portMaintenanceServiceName?: string;
  status: string;
}
