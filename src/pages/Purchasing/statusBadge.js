// Maps the 3-state Mua hàng status to a Warehouse.module.css badge class —
// shared by ReportPanel and OrderPanel so both tabs read the same colors.
export default function statusBadgeClass(status, styles) {
  if (status === "Đã thực hiện") return styles.statusDone;
  if (status === "Đang thực hiện") return styles.statusActive;
  return styles.statusIdle;
}
