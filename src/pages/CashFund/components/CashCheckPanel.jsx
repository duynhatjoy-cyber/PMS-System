import { useMemo, useState } from "react";
import { CalendarDays, List, Clock, CalendarClock, MessageSquare, Plus, Eye, Trash2 } from "lucide-react";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import CashCheckForm from "./CashCheckForm";
import { CASH_CHECK_ROWS } from "../../../data/cashFundData";
import warehouseStyles from "../../Warehouse/Warehouse.module.css";
import styles from "../CashFund.module.css";

const PAGINATION_LABELS = { page: "Trang", rowsPerPage: "Số lượng mỗi trang", of: "trên" };

function CashCheckPanel({ onToast }) {
  const [rows, setRows] = useState(CASH_CHECK_ROWS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  function handleSaveCheck(check) {
    setRows((prev) => [check, ...prev]);
    setShowForm(false);
    onToast("Đã thêm phiếu kiểm kê");
  }

  function handleDelete(id) {
    if (!window.confirm("Xóa phiếu kiểm kê này?")) return;
    setRows((prev) => prev.filter((row) => row.id !== id));
    onToast("Đã xóa phiếu kiểm kê");
  }

  if (showForm) {
    return (
      <CashCheckForm
        existingCount={rows.length}
        onCancel={() => setShowForm(false)}
        onSave={handleSaveCheck}
      />
    );
  }

  return (
    <div>
      <div className={styles.topActionBar}>
        <button type="button" className={`${warehouseStyles.submitBtn}`} onClick={() => setShowForm(true)}>
          <Plus size={15} />
          PHIẾU KIỂM KÊ
        </button>
      </div>

      <div className={warehouseStyles.tableWrap}>
        <table className={warehouseStyles.table}>
          <thead>
            <tr>
              <th>
                <span className={warehouseStyles.thLabel}>
                  <List size={14} /> Số phiếu KK
                </span>
              </th>
              <th>
                <span className={warehouseStyles.thLabel}>
                  <CalendarDays size={14} /> Ngày kiểm kê
                </span>
              </th>
              <th>
                <span className={warehouseStyles.thLabel}>
                  <Clock size={14} /> Giờ kiểm kê
                </span>
              </th>
              <th>
                <span className={warehouseStyles.thLabel}>
                  <CalendarClock size={14} /> Kiểm kê đến ngày
                </span>
              </th>
              <th>
                <span className={warehouseStyles.thLabel}>
                  <MessageSquare size={14} /> Mục đích
                </span>
              </th>
              <th className={warehouseStyles.thActionCell} />
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr className={warehouseStyles.emptyRow}>
                <td colSpan={6}>Không tìm thấy phiếu</td>
              </tr>
            ) : (
              pagedRows.map((row) => (
                <tr key={row.id} className={row.voided ? styles.voidedRow : ""}>
                  <td>
                    <button type="button" className={warehouseStyles.rowLink}>
                      {row.ticketNo}
                    </button>
                  </td>
                  <td>{row.checkDate}</td>
                  <td>{row.checkTime}</td>
                  <td>{row.dueDate}</td>
                  <td>{row.purpose}</td>
                  <td>
                    <div className={styles.actionGroup}>
                      <button
                        type="button"
                        className={warehouseStyles.viewBtn}
                        title="Xem chi tiết"
                        onClick={() => onToast(`Xem chi tiết phiếu kiểm kê ${row.ticketNo}`)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className={warehouseStyles.viewBtn}
                        title="Xóa"
                        onClick={() => handleDelete(row.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
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
    </div>
  );
}

export default CashCheckPanel;
