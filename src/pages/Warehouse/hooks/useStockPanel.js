import { useState } from "react";
import { startOfDay } from "../../../utils/format";

const today = startOfDay(new Date());

// Shared filter/pagination/add-ticket state behind every Stock*Panel
// (In/Out/Transfer/Check) plus Purchasing's Report/Order/Receipt tabs.
// Row filtering (query, status, ...) differs per panel and stays with the
// caller. `externalRowsState` (a [rows, setRows] pair) lets a caller pass in
// state owned elsewhere — a parent (so a tab switch doesn't reset it) or a
// Context (so another page can push rows in, e.g. F&B's low-stock alerts
// into Báo hàng) — instead of this hook's own useState.
export default function useStockPanel(initialRows, savedMessage, onToast, externalRowsState) {
  const [preset, setPreset] = useState("Hôm nay");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const ownRowsState = useState(initialRows);
  const [rows, setRows] = externalRowsState || ownRowsState;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [printTicket, setPrintTicket] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function handleSaveTicket(ticket) {
    setRows((prev) => [ticket, ...prev]);
    setShowAddModal(false);
    onToast(savedMessage);
  }

  function handleUpdateTicket(updated) {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setDetailRow(null);
    onToast("Đã lưu thay đổi phiếu");
  }

  function handleConfirmDelete() {
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    onToast(`Đã xóa phiếu ${deleteTarget.ticketNo}`);
    setDeleteTarget(null);
  }

  function changePageSize(size) {
    setPageSize(size);
    setPage(1);
  }

  return {
    preset,
    setPreset,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    rows,
    setRows,
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
  };
}
