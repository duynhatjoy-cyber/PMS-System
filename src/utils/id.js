// Bộ đếm "prefix-N" độc lập cho mỗi lần gọi — mỗi trang/module tự gọi 1 lần
// để có dãy id riêng, không lẫn với module khác, thay cho việc mỗi file tự
// khai báo lại cùng một bộ đếm.
export function createIdSequence() {
  let seq = 0;
  return function nextId(prefix) {
    seq += 1;
    return `${prefix}-${seq}`;
  };
}
