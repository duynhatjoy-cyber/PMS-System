import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import FilterBar from "../../Warehouse/components/FilterBar";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import { CASH_VOUCHER_ROWS, OPENING_CASH_BALANCE } from "../../../data/cashFundData";
import { formatDMY, startOfDay } from "../../../utils/format";
import warehouseStyles from "../../Warehouse/Warehouse.module.css";
import styles from "../CashFund.module.css";

const today = startOfDay(new Date());
const PAGINATION_LABELS = { page: "Trang", rowsPerPage: "Số lượng mỗi trang", of: "trên" };

function atTime(date, row) {
  const d = new Date(date);
  d.setHours(row.hh, row.mm, row.ss, 0);
  return d;
}

function CashLedgerPanel({ onToast }) {
  const [preset, setPreset] = useState("Hôm nay");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [rows] = useState(() =>
    CASH_VOUCHER_ROWS.map((r) => ({ ...r, dateTime: atTime(today, r) })).sort(
      (a, b) => b.dateTime - a.dateTime
    )
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const totalThu = rows.filter((r) => r.type === "thu").reduce((sum, r) => sum + r.amount, 0);
  const totalChi = rows.filter((r) => r.type === "chi").reduce((sum, r) => sum + r.amount, 0);
  const closingBalance = OPENING_CASH_BALANCE + totalThu - totalChi;

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
        onSubmit={() => onToast("Đã tìm kiếm sổ chi tiết tiền mặt")}
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
                <td colSpan={8}>Không tìm thấy dữ liệu</td>
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
                    {row.type === "thu" ? row.amount.toLocaleString("en-US") : 0}
                  </td>
                  <td className={warehouseStyles.numCell}>
                    {row.type === "chi" ? row.amount.toLocaleString("en-US") : 0}
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
          <span>VND {OPENING_CASH_BALANCE.toLocaleString("en-US")}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>II. Tổng tiền thu đối chiếu trong kỳ:</span>
          <span>VND {totalThu.toLocaleString("en-US")}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>III. Tổng tiền chi đối chiếu trong kỳ:</span>
          <span>VND {totalChi.toLocaleString("en-US")}</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
          <span>Cuối kỳ (I+II-III):</span>
          <span>VND {closingBalance.toLocaleString("en-US")}</span>
        </div>
      </div>
    </div>
  );
}

export default CashLedgerPanel;
