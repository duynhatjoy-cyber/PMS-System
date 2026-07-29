import { useState } from "react";
import { startOfDay } from "../../../utils/format";

const today = startOfDay(new Date());

// Shared filter/pagination/add-ticket state behind every Stock*Panel
// (In/Out/Transfer/Check). Row filtering (query, status, ...) differs per
// panel and stays with the caller.
export default function useStockPanel(initialRows, savedMessage, onToast) {
  const [preset, setPreset] = useState("Hôm nay");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [rows, setRows] = useState(initialRows);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [printTicket, setPrintTicket] = useState(null);

  function handleSaveTicket(ticket) {
    setRows((prev) => [ticket, ...prev]);
    setShowAddModal(false);
    onToast(savedMessage);
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
    handleSaveTicket,
  };
}
