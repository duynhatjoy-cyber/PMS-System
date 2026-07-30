import { computeRoomSnapshots, ROOMS } from "./roomMapData";

// 3 bước xử lý vệ sinh buồng, không phụ thuộc tình trạng khách ở/trả —
// một phòng có thể "Có khách" và vẫn "Sạch" hoặc "Bẩn" tại cùng thời điểm.
export const HK_STATUS = {
  dirty: { key: "dirty", label: "Bẩn", color: "var(--fd-danger)", soft: "var(--fd-danger-soft)" },
  in_progress: { key: "in_progress", label: "Đang dọn", color: "var(--fd-status-blue)", soft: "var(--fd-status-blue-soft)" },
  clean: { key: "clean", label: "Sạch", color: "var(--fd-success)", soft: "var(--fd-success-soft)" },
};

export const HK_STATUS_LEGEND = ["dirty", "in_progress", "clean"];

export const STAFF = ["Nguyễn Thị Lan", "Trần Văn Hùng", "Lê Thị Mai", "Phạm Văn Đức"];

// Phòng vừa trả luôn bắt đầu ở trạng thái Bẩn (đúng chu kỳ thực tế); các phòng
// còn lại xoay vòng bẩn/đang dọn/sạch mỗi 5 phòng để demo đủ cả 3 trạng thái,
// không dùng random để dữ liệu ổn định qua các lần tải trang.
function seedHkStatus(snapshot, index) {
  if (snapshot.status === "maintenance") return null;
  if (snapshot.status === "checked_out") return "dirty";
  const cycle = index % 5;
  if (cycle === 0) return "dirty";
  if (cycle === 1) return "in_progress";
  return "clean";
}

export function buildInitialRooms(bookings, today) {
  const snapshots = computeRoomSnapshots(ROOMS, bookings, today);
  return snapshots.map((snap, i) => ({
    number: snap.room.number,
    floor: snap.room.floor,
    typeKey: snap.room.typeKey,
    hkStatus: seedHkStatus(snap, i),
    assignedStaff: null,
    note: "",
  }));
}
