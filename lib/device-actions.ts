import { archiveDevice, deleteDevice, unarchiveDevice } from "@/lib/api";

export type DeviceAction = "archive" | "unarchive" | "delete";

export async function performDeviceAction(action: DeviceAction, wwn: string) {
  if (action === "archive") {
    await archiveDevice(wwn);
    return;
  }
  if (action === "unarchive") {
    await unarchiveDevice(wwn);
    return;
  }
  if (action === "delete") {
    await deleteDevice(wwn);
  }
}
