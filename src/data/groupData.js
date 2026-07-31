import { createIdSequence } from "../utils/id";
import { GUESTS } from "./guestData";

const nextId = createIdSequence();

function idOf(name) {
  const g = GUESTS.find((guest) => guest.name === name);
  return g ? g.id : null;
}

function group(fields) {
  return { id: nextId("group"), note: "", ...fields };
}

// Quan hệ khách lẻ ↔ khách đoàn là nhiều-nhiều: một `Guest` không có field
// "loại khách" cố định — tư cách "khách đoàn" chỉ là việc guest.id có xuất
// hiện trong `memberGuestIds`/`leaderGuestId` của MỘT hay NHIỀU đoàn ở đây hay
// không (`getGuestGroups` bên dưới suy ra tại thời điểm đọc, không lưu trùng
// lặp trên guest). Một khách có thể vừa là người đại diện đặt phòng cho đoàn
// này, vừa là thành viên của đoàn khác, vừa từng lưu trú một mình.
export const GROUPS = [
  group({
    name: "Đoàn công tác ABC Corp",
    leaderGuestId: idOf("James Carter"),
    memberGuestIds: [idOf("James Carter"), idOf("Ngô Bảo Châu"), idOf("Lâm Gia Bảo"), idOf("Hoàng Minh Đức")],
    note: "Đoàn công tác định kỳ hàng quý, ưu tiên phòng Deluxe liền kề.",
    createdDate: new Date(2026, 5, 10),
  }),
  group({
    name: "Đoàn du lịch gia đình Vũ Thu Phương",
    leaderGuestId: idOf("Vũ Thu Phương"),
    memberGuestIds: [idOf("Vũ Thu Phương"), idOf("Trần Thị Bích Tuyền"), idOf("Trương Thị Mai Anh"), idOf("Võ Thị Thanh Nga")],
    note: "Nhóm bạn thân đi nghỉ dưỡng cuối tuần.",
    createdDate: new Date(2026, 6, 5),
  }),
  group({
    name: "Đoàn sự kiện Ngô Bảo Châu",
    leaderGuestId: idOf("Ngô Bảo Châu"),
    memberGuestIds: [idOf("Ngô Bảo Châu"), idOf("Bùi Quốc Tiến"), idOf("Nguyễn Lý Ngọc Phát")],
    note: "Sự kiện công ty, đặt phòng theo đoàn 3 người.",
    createdDate: new Date(2026, 6, 22),
  }),
];

// Tất cả nhóm mà một khách có liên quan (đại diện hoặc thành viên) — 1 khách
// có thể thuộc 0, 1 hay nhiều đoàn cùng lúc.
export function getGuestGroups(guestId, groups = GROUPS) {
  return groups.filter((g) => g.leaderGuestId === guestId || g.memberGuestIds.includes(guestId));
}

export function isGroupGuest(guestId, groups = GROUPS) {
  return getGuestGroups(guestId, groups).length > 0;
}
