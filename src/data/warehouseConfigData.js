let idSeq = 0;
function nextId(prefix) {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}

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
