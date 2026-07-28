// Dữ liệu mẫu cho khu vực Thống kê (Thống kê / Biểu đồ thống kê).
// Dữ liệu doanh thu nằm riêng ở src/pages/Revenue/data/revenueData.js.

export const TODAY_STATS = {
  phongCoKhach: 16,
  phongDuKienDi: 1,
  phongOQuaNgay: 12,
  phongDuKienDen: 13,
  tongSoPhongSanSang: 44,
  duKienPhongChiemDung: 28,
  congSuatDuKien: 70.45,
};

// Mỗi mốc: { treEm, nguoiLon, tong }
export const GUEST_STATS = {
  dangO: { treEm: 9, nguoiLon: 49, tong: 58 },
  duKienDi: { treEm: 0, nguoiLon: 2, tong: 2 },
  oQuaNgay: { treEm: 9, nguoiLon: 37, tong: 46 },
  duKienDen: { treEm: 0, nguoiLon: 27, tong: 27 },
  tongDuKien: { treEm: 9, nguoiLon: 76, tong: 85 },
};

export const ACTIVITY_STATS = {
  daDen: 3,
  duKienDen: 13,
  daDi: 19,
  duKienDi: 1,
  denDiTrongNgay: 0,
};

export const ROOM_STATS = {
  tongSoPhong: 50,
  phongHong: 6,
  tongSoPhongSanSang: 44,
};

export const ROOM_STATUS_STATS = {
  banDoKhachO: 12,
  phongTrongBan: 3,
};

export const ROOM_FORECAST_DATES = ["28/07", "29/07", "30/07", "31/07", "01/08", "02/08", "03/08"];

export const ROOM_FORECAST_ROWS = [
  { roomType: "C_Std Dbl", values: [-1, 4, 5, 5, 5, 5, 6] },
  { roomType: "C_Sup Dbl", values: [1, 3, 2, 2, 3, 2, 2] },
  { roomType: "C_Dlx Dbl", values: [0, 1, 0, 0, 1, 1, 1] },
  { roomType: "C_Sup Fam", values: [1, 1, 5, 3, 3, 5, 5] },
  { roomType: "C_Dlx Fam", values: [1, 1, 1, 2, 2, 1, 2] },
  { roomType: "C_Fam View", values: [-1, 1, 1, 2, 2, 2, 2] },
  { roomType: "C_Fam Bal", values: [0, 1, 1, 1, 1, 1, 1] },
  { roomType: "C_VIP Fam", values: [1, 0, 1, 1, 1, 1, 1] },
  { roomType: "C_VIP", values: [1, 1, 1, 1, 1, 1, 1] },
  { roomType: "SIG TURE", values: [1, 1, 1, 1, 1, 1, 1] },
  { roomType: "C_SIG TURE", values: [2, 2, 2, 2, 2, 2, 2] },
  { roomType: "C_CON FAM", values: [0, 2, 2, 2, 2, 0, 0] },
  { roomType: "STD DBL", values: [0, 5, 5, 6, 6, 6, 6] },
  { roomType: "SUP DBL", values: [3, 3, 3, 3, 3, 3, 3] },
];
