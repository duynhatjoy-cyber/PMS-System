const AVATAR_PALETTE = [
  "#a8631f",
  "#3b5f7a",
  "#0f6e5c",
  "#b23a2e",
  "#c99a2e",
  "#1e7a4c",
  "#6b4fa0",
  "#1c2430",
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Avatar chữ + màu suy ra trực tiếp từ tên nguồn (không lưu mã riêng trong
// data) — đủ để phân biệt trực quan, không cần một bảng mã thủ công.
export function sourceAvatar(name) {
  const letters = (name.match(/[A-Za-z]/g) || []).slice(0, 3).join("").toUpperCase() || "?";
  const color = AVATAR_PALETTE[hashString(name) % AVATAR_PALETTE.length];
  return { letters, color };
}
