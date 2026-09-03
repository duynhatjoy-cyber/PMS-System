import { useEffect, useMemo } from "react";
import { Clock, List, Hash, Building2, DollarSign, MessageSquare, Plus, Printer, Trash2 } from "lucide-react";
import FilterBar from "../../Warehouse/components/FilterBar";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import AddPurchaseReturnModal from "../modals/AddPurchaseReturnModal";
import PrintPreviewModal from "../../Warehouse/modals/PrintPreviewModal";
import useStockPanel from "../../Warehouse/hooks/useStockPanel";
import EmptyState from "../../../components/EmptyState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { formatDMY, formatCurrency } from "../../../utils/format";
import { paginate } from "../../../utils/pagination";
import styles from "../../Warehouse/Warehouse.module.css";

// Trả lại hàng mua xuất nguyên vật liệu theo dòng (nguyên vật liệu/kho/số
// lượng/đơn giá) như Nhập hàng/Đặt hàng nên có panel + modal riêng
// (AddPurchaseReturnModal) thay vì phiếu 1-ô-Tổng dùng chung như Báo hàng.
// rows/setRows nâng lên Purchasing.jsx (như receiptRows) để tab Trả nợ tính
// công nợ từ đúng dữ liệu trả hàng hiện tại, không phải bản chụp lúc mount.
function ReturnPanel({
  onToast,
  rows: returnRows,
  setRows: setReturnRows,
  receiptRows,
  seedReceiptId,
  onSeedConsumed,
}) {
  const {
    preset,
    setPreset,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    rows,
    page,
    setPage,
    pageSize,
    changePageSize,
    showAddModal,
    setShowAddModal,
    printTicket,
    setPrintTicket,
    detailRow,
    setDetailRow,
    deleteTarget,
    setDeleteTarget,
    handleSaveTicket,
    handleUpdateTicket,
    handleConfirmDelete,
  } = useStockPanel(returnRows, "Đã thêm phiếu trả lại hàng mua", onToast, [returnRows, setReturnRows]);

  useEffect(() => {
    if (seedReceiptId) setShowAddModal(true);
  }, [seedReceiptId, setShowAddModal]);

  function closeAddModal() {
    setShowAddModal(false);
    onSeedConsumed();
  }

  function saveReturnTicket(ticket) {
    handleSaveTicket(ticket);
    onSeedConsumed();
  }

  const pagedRows = useMemo(() => paginate(rows, page, pageSize), [rows, page, pageSize]);

  return (
    <div>
      <FilterBar
        preset={preset}
        onPresetChange={setPreset}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        onSubmit={() => onToast("Đã lấy dữ liệu trả lại hàng mua")}
      />

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <span className={styles.thLabel}>
                    <Clock size={14} /> Ngày
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <List size={14} /> Số phiếu
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <Hash size={14} /> Tham chiếu
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <Building2 size={14} /> Nhà cung cấp
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <DollarSign size={14} /> Tổng
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <MessageSquare size={14} /> Diễn giải
                  </span>
                </th>
                <th className={styles.thActionCell}>
                  <button
                    type="button"
                    className={styles.addBtn}
                    title="Thêm phiếu trả lại hàng mua"
                    aria-label="Thêm phiếu trả lại hàng mua"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus size={18} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={6}>
                    <EmptyState
                      message="Không tìm thấy phiếu"
                      hint="Nhấn nút + ở góc trên để tạo phiếu trả lại hàng mua mới."
                    />
                  </td>
                </tr>
              ) : (
                pagedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDMY(row.date)}</td>
                    <td>
                      <button type="button" className={styles.rowLink} onClick={() => setDetailRow(row)}>
                        {row.ticketNo}
                      </button>
                    </td>
                    <td>{row.reference}</td>
                    <td>{row.supplier}</td>
                    <td className={styles.numCell}>{formatCurrency(row.total)}</td>
                    <td>{row.note}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="In phiếu trả lại hàng mua"
                          aria-label="In phiếu trả lại hàng mua"
                          onClick={() => setPrintTicket(row)}
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          title="Xóa phiếu trả lại hàng mua"
                          aria-label="Xóa phiếu trả lại hàng mua"
                          onClick={() => setDeleteTarget(row)}
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
          onPageChange={setPage}
          onPageSizeChange={changePageSize}
        />
      </div>

      {showAddModal && (
        <AddPurchaseReturnModal
          receiptRows={receiptRows}
          initialReceiptId={seedReceiptId}
          onSave={saveReturnTicket}
          onClose={closeAddModal}
          onToast={onToast}
        />
      )}

      {detailRow && (
        <AddPurchaseReturnModal
          row={detailRow}
          receiptRows={receiptRows}
          onSave={handleUpdateTicket}
          onClose={() => setDetailRow(null)}
          onToast={onToast}
        />
      )}

      {printTicket && (
        <PrintPreviewModal
          title="Phiếu trả lại hàng mua"
          ticketNo={printTicket.ticketNo}
          date={formatDMY(printTicket.date)}
          fields={[
            { label: "Tham chiếu", value: printTicket.reference || "—" },
            { label: "Nhà cung cấp", value: printTicket.supplier || "—" },
            { label: "Người nhận", value: printTicket.receiver || "—" },
            { label: "Từ phiếu nhập hàng", value: printTicket.receiptRef || "—" },
            { label: "Phương thức thanh toán", value: printTicket.paymentMethod || "—" },
            { label: "Diễn giải", value: printTicket.note || "—" },
            { label: "Tổng", value: formatCurrency(printTicket.total) },
          ]}
          onClose={() => setPrintTicket(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa phiếu trả lại hàng mua"
          message={`Bạn có chắc chắn muốn xóa phiếu ${deleteTarget.ticketNo}?`}
          confirmLabel="Xóa"
          danger
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default ReturnPanel;
