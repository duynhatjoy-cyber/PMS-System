import { createIdSequence } from "../utils/id";

const nextId = createIdSequence();

function makeCategory(groupId, name) {
  return { id: nextId("cat"), groupId, name, code: "", note: "", active: true };
}

function makeGroup(name, categoryNames = []) {
  const groupId = nextId("grp");
  return {
    id: groupId,
    name,
    active: true,
    categories: categoryNames.map((n) => makeCategory(groupId, n)),
  };
}

// Nhóm "Thu" seed đúng tên trong mockup; chỉ "Thu từ phòng" có sẵn danh mục
// minh hoạ, các nhóm còn lại để trống thật (không bịa cho đủ).
export const INCOME_GROUPS = [
  makeGroup("Thu từ phòng", ["Tiền phòng", "Phụ thu"]),
  makeGroup("Điểm bán hàng"),
  makeGroup("Dịch vụ"),
  makeGroup("Công nợ"),
];

// Nhóm "Chi" — bản tiếng Anh trong mockup (Utilities, Tools & Supplies...)
// được dịch sang tiếng Việt cho nhất quán với toàn app.
export const EXPENSE_GROUPS = [
  makeGroup("Mua hàng", ["Chi phí nước uống, trà, cà phê"]),
  makeGroup("Trả nợ nhà cung cấp"),
  makeGroup("Tiện ích"),
  makeGroup("Công cụ dụng cụ"),
  makeGroup("Quản lý chung"),
  makeGroup("Chi phí khác của doanh nghiệp"),
  makeGroup("Dịch vụ thuê ngoài"),
  makeGroup("Thuê mặt bằng"),
  makeGroup("Khấu hao tài sản"),
];

// Đúng 3 tài khoản trong mockup; chi nhánh dòng BIDV sửa từ "BIDV" (lặp tên
// ngân hàng, rõ ràng là lỗi đánh máy trong mock) thành "Vũng Tàu".
export const BANK_ACCOUNTS = [
  { id: nextId("bank"), accountNumber: "03887280701", bankName: "TPBank", branch: "Vũng Tàu" },
  { id: nextId("bank"), accountNumber: "0071001140716", bankName: "Vietcombank", branch: "Vũng Tàu" },
  { id: nextId("bank"), accountNumber: "8600088604", bankName: "BIDV", branch: "Vũng Tàu" },
];
