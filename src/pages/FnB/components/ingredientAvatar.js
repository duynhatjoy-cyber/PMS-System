// Màu vòng tròn avatar theo vị trí của nguyên vật liệu trong danh sách — chỉ để
// dễ nhận diện dòng hơn (không mang ý nghĩa trạng thái), dùng chung giữa
// IngredientsPanel và RecipeModal để cùng 1 nguyên liệu luôn ra cùng 1 màu.
export const AVATAR_COLORS = [
  { bg: "var(--fd-primary-soft)", fg: "var(--fd-primary)" },
  { bg: "var(--fd-status-blue-soft)", fg: "var(--fd-status-blue)" },
  { bg: "var(--fd-violet-soft)", fg: "var(--fd-violet)" },
  { bg: "var(--fd-teal-soft)", fg: "var(--fd-teal)" },
  { bg: "var(--fd-warning-soft)", fg: "var(--fd-warning)" },
];

export function avatarColorAt(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}
