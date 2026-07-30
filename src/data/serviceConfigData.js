import { createIdSequence } from "../utils/id";

const nextId = createIdSequence();

// 5 loại dịch vụ cố định (cột trái) — spec không có luồng thêm/xóa loại dịch vụ.
export const SERVICE_TYPES = [
  { key: "compensation", label: "Đền bù" },
  { key: "other", label: "Dịch vụ khác" },
  { key: "laundry", label: "Giặt là" },
  { key: "minibar", label: "Minibar" },
  { key: "room", label: "Dịch vụ phòng" },
];

function makeService(name, price, unit, code = "") {
  return {
    id: nextId("svc"),
    name,
    price,
    unit,
    code,
    active: true,
    editablePrice: true,
    stockManaged: false,
    minQty: 0,
    excludeFromInvoice: false,
  };
}

function makeGroup(typeKey, name, services = []) {
  return { id: nextId("grp"), typeKey, name, active: true, services };
}

export const INITIAL_GROUPS_BY_TYPE = {
  compensation: [
    makeGroup("compensation", "Đền bù", [
      makeService("Đền bù khăn tắm", 50000, "cái", "ĐB-KT"),
      makeService("Đền bù chìa khóa", 100000, "cái", "ĐB-CK"),
      makeService("Đền bù remote", 150000, "cái", "ĐB-RM"),
    ]),
  ],
  other: [
    makeGroup("other", "Dịch vụ phát sinh", [
      makeService("In tài liệu", 10000, "lần"),
      makeService("Gửi xe", 30000, "lượt"),
    ]),
  ],
  laundry: [],
  minibar: [
    makeGroup("minibar", "Đồ uống", [
      makeService("Coca / Pepsi (Lon)", 15000, "lon"),
      makeService("Nước suối 550ml (Chai)", 10000, "chai"),
      makeService("Nước suối nhỏ", 5000, "chai"),
    ]),
    makeGroup("minibar", "Đồ ăn"),
    makeGroup("minibar", "Bao cao su"),
  ],
  room: [
    makeGroup("room", "Dọn phòng theo yêu cầu", [makeService("Dọn phòng thêm (Lần)", 100000, "lần")]),
  ],
};

export const nextDraftId = nextId;
