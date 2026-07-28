export const TAX_FEE_TYPES = [
  { value: "tax", label: "Tiền thuế" },
  { value: "fee", label: "Phí" },
];

export const SERVICE_REVENUE_SOURCES = [
  "Đền bù",
  "Dịch vụ khác",
  "Dịch vụ mở rộng",
  "Giặt là",
  "Minibar",
  "Dịch vụ phòng",
];

export const INITIAL_TAX_FEES = [
  {
    id: "vat",
    type: "tax",
    name: "VAT",
    description: "Thuế giá trị gia tăng",
    percent: 10,
    reductionPercent: 0,
  },
];

// Mỗi slot lưu danh sách id Thuế/Phí đã được kéo-thả áp dụng vào đó.
export const INITIAL_APPLIED_SLOTS = {
  room: ["vat"],
  service: [],
  total: [],
};
