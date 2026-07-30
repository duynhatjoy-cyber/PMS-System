import { useEffect, useState } from "react";
import { ROOM_STATUSES } from "../data/bookingConfigData";

const STORAGE_KEY = "pms.roomStatusColors";
const CHANGE_EVENT = "pms:room-status-colors";

export const STATUS_COLOR_KEYS = {
  vacant: "empty",
  booked_future: "booked",
  arriving_today: "notArrived",
  in_house: "occupied",
  overdue: "notDeparted",
  maintenance: "maintenance",
  dirty: "blocked",
};

export function defaultRoomStatusColors() {
  return Object.fromEntries(ROOM_STATUSES.map((status) => [status.id, status.defaultColor]));
}

export function readRoomStatusColors() {
  try {
    return { ...defaultRoomStatusColors(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return defaultRoomStatusColors();
  }
}

export function saveRoomStatusColors(colors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: colors }));
}

export function useRoomStatusColors() {
  const [colors, setColors] = useState(readRoomStatusColors);
  useEffect(() => {
    const sync = (event) => setColors(event.detail || readRoomStatusColors());
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, []);
  return colors;
}

export function colorForStatus(status, colors) {
  if (status === "checked_out") return "#d6478f";
  return colors[STATUS_COLOR_KEYS[status]] || "#64748b";
}
