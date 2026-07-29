import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import FilterBar from "../../Warehouse/components/FilterBar";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import { formatDMY, formatCurrency, startOfDay } from "../../../utils/format";
import EmptyState from "../../../components/EmptyState";
import warehouseStyles from "../../Warehouse/Warehouse.module.css";
import styles from "../../CashFund/CashFund.module.css";

const today = startOfDay(new Date());
const PAGINATION_LABELS = { page: "Trang", rowsPerPage: "Số lượng mỗi trang", of: "trên" };

// Shared "sổ chi tiết" ledger view used by both BankFund and CashFund — the
// two pages are identical here apart from the data source, the opening
// balance, and the search toast wording ("tiền gửi" vs "tiền mặt").
function FundLedgerPanel({ onToast, rows, openingBalance, searchToastMessage }) {
  const [preset, setPreset] = useState("Hôm nay");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const totalThu = rows.filter((r) => r.type === "thu").reduce((sum, r) => sum + r.amount, 0);
  const totalChi = rows.filter((r) => r.type === "chi").reduce((sum, r) => sum + r.amount, 0);
  const closingBalance = openingBalance + totalThu - totalChi;

  return (
    <div>
      <FilterBar
        preset={preset}
        onPresetChange={setPreset}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        submitLabel="TÌM KIẾM"
        onSubmit={() => onToast(searchToastMessage)}
        extraActions={
          <button
            type="button"
            className={warehouseStyles.submitBtn}
            onClick={() => onToast("Chức năng đang được phát triển")}
          >
            <ArrowUpDown size={15} />
            XUẤT FILE EXCEL
          </button>
        }
      />

      <div className={warehouseStyles.tableWrap}>
        <table className={warehouseStyles.table}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Ngày</th>
              <th>Số phiếu thu</th>
              <th>Số phiếu chi</th>
              <th>Thu chi</th>
              <th className={warehouseStyles.numCell}>Mục thu</th>
              <th className={warehouseStyles.numCell}>Mục chi</th>
              <th>Người tạo</th>
            </tr>
            <tr className={styles.subHeadRow}>
              <th />
              <th />
              <th />
              <th />
              <th />
              <th className={`${warehouseStyles.numCell} ${styles.subHeadThu}`}>VNĐ</th>
              <th className={`${warehouseStyles.numCell} ${styles.subHeadChi}`}>VNĐ</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr className={warehouseStyles.emptyRow}>
                <td colSpan={8}>
                  <EmptyState message="Không tìm thấy dữ liệu" hint="Thử đổi khoảng ngày rồi tìm kiếm lại." />
                </td>
              </tr>
            ) : (
              pagedRows.map((row, index) => (
                <tr key={row.id}>
                  <td>{(page - 1) * pageSize + index + 1}</td>
                  <td>
                    {formatDMY(row.dateTime)} {row.dateTime.toTimeString().slice(0, 8)}
                  </td>
                  <td>
                    {row.type === "thu" && (
                      <button type="button" className={styles.rowLinkGreen}>
                        {row.ticketNo}
                      </button>
                    )}
                  </td>
                  <td>
                    {row.type === "chi" && (
                      <button type="button" className={styles.rowLinkGreen}>
                        {row.ticketNo}
                      </button>
                    )}
                  </td>
                  <td>{row.reason}</td>
                  <td className={warehouseStyles.numCell}>
                    {row.type === "thu" ? formatCurrency(row.amount) : 0}
                  </td>
                  <td className={warehouseStyles.numCell}>
                    {row.type === "chi" ? formatCurrency(row.amount) : 0}
                  </td>
                  <td>{row.creator}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <WarehousePagination
        page={page}
        pageSize={pageSize}
        total={rows.length}
        labels={PAGINATION_LABELS}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <div className={styles.summaryBox}>
        <div className={styles.summaryRow}>
          <span>I. Số dư đầu kỳ ngày:</span>
          <span>{formatCurrency(openingBalance)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>II. Tổng tiền thu đối chiếu trong kỳ:</span>
          <span>{formatCurrency(totalThu)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>III. Tổng tiền chi đối chiếu trong kỳ:</span>
          <span>{formatCurrency(totalChi)}</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
          <span>Cuối kỳ (I+II-III):</span>
          <span>{formatCurrency(closingBalance)}</span>
        </div>
      </div>
    </div>
  );
}

export default FundLedgerPanel;
