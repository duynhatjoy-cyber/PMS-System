import { createIdSequence } from "../utils/id";

const nextId = createIdSequence();

// Đúng danh sách + trạng thái trong mock: "Kho tổng" đã ngừng dùng, "Kho
// khách sạn" đang chọn sẵn và có dữ liệu liên quan nên không xoá được (minh
// hoạ popup "không thể xoá"), mô tả giữ nguyên văn bản trong mock.
export const WAREHOUSE_RECORDS = [
  {
    id: nextId("kho"),
    name: "Kho tổng",
    address: "",
    description: "",
    allowFrontDesk: false,
    allowSales: false,
    active: false,
    hasRelatedData: false,
  },
  {
    id: nextId("kho"),
    name: "Kho khách sạn",
    address: "",
    description: "Kho tổng\nNhập vào đây trước khi xuất cho tủ minibar hoặc buồng",
    allowFrontDesk: true,
    allowSales: true,
    active: true,
    hasRelatedData: true,
  },
  {
    id: nextId("kho"),
    name: "Tủ minibar",
    address: "",
    description: "",
    allowFrontDesk: false,
    allowSales: false,
    active: true,
    hasRelatedData: false,
  },
  {
    id: nextId("kho"),
    name: "Kho buồng",
    address: "",
    description: "",
    allowFrontDesk: false,
    allowSales: false,
    active: true,
    hasRelatedData: false,
  },
];

export const SUPPLIER_RECORDS = [
  {
    id: nextId("ncc"),
    code: "Cocacola",
    name: "Cocacola",
    description: "",
    phone: "",
    mobile: "0933016008",
    email: "",
    fax: "",
    representative: "",
    vatCode: "",
    contactPhone: "",
    contactEmail: "",
    active: true,
  },
];

// Danh mục nguyên vật liệu — mỗi item có ĐVT mặc định để phiếu nhập/xuất/
// chuyển/kiểm kê kho tự điền, tránh sai lệch tồn kho do nhập nhiều đơn vị
// khác nhau cho cùng một nguyên vật liệu.
export const MATERIAL_RECORDS = [
  { id: nextId("nvl"), name: "Coca/Pepsi", unit: "Lon", active: true },
  { id: nextId("nvl"), name: "Nước suối 550ml", unit: "Chai", active: true },
  { id: nextId("nvl"), name: "Mì ly", unit: "Ly", active: true },
  { id: nextId("nvl"), name: "Bánh khoai tây Poca", unit: "Bịch", active: true },
  { id: nextId("nvl"), name: "Bao cao su", unit: "Hộp 3 cái", active: true },
  { id: nextId("nvl"), name: "Bài Ma sói", unit: "1", active: true },
  { id: nextId("nvl"), name: "Bài Uno", unit: "1", active: true },
  { id: nextId("nvl"), name: "Ma sói, bài uno", unit: "", active: true },
  { id: nextId("nvl"), name: "Đậu phộng", unit: "Gói", active: true },
  { id: nextId("nvl"), name: "Nước suối nhỏ", unit: "", active: true },
  { id: nextId("nvl"), name: "Sprite/7Up", unit: "Lon", active: true },
  { id: nextId("nvl"), name: "Trà Ô Long", unit: "Chai", active: true },
  { id: nextId("nvl"), name: "Bao cao su Durex", unit: "Hộp 3 cái", active: true },
  { id: nextId("nvl"), name: "Bánh Cua", unit: "Gói", active: true },
  { id: nextId("nvl"), name: "Bánh Mix", unit: "Gói", active: true },
  { id: nextId("nvl"), name: "Trà Fuze", unit: "Chai", active: true },
  { id: nextId("nvl"), name: "Sting/Rockstar", unit: "Lon", active: true },
];
