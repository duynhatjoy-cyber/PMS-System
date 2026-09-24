import { useState } from "react";
import { Plus, Users } from "lucide-react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import RowActionMenu from "../../FrontDesk/components/RowActionMenu";
import EmptyState from "../../../components/EmptyState";
import { nextDraftId, orderTotal, TABLE_STATUS, TABLE_STATUS_LEGEND, ZONES } from "../../../data/fnbData";
import { formatCurrency } from "../../../utils/format";
import styles from "../FnB.module.css";

function emptyForm(table) {
  return {
    number: table?.number ?? "",
    capacity: table ? String(table.capacity) : "4",
    zone: table?.zone ?? ZONES[0],
  };
}

function reservationForm(table) {
  return {
    guestName: table?.reservation?.guestName ?? "",
    guestCount: String(table?.reservation?.guestCount ?? table?.guestCount ?? 2),
    time: table?.reservation?.time ?? "",
    note: table?.reservation?.note ?? "",
  };
}

function TableMapPanel({ tables, setTables, orders, setOrders, onOpenOrder, onToast }) {
  const [formModal, setFormModal] = useState(null); // { editing: table|null, form }
  const [reservationModal, setReservationModal] = useState(null); // { table, form }
  const [guestModal, setGuestModal] = useState(null); // { table, guestCount }
  const [moveModal, setMoveModal] = useState(null); // { table, kind }
  const [printTarget, setPrintTarget] = useState(null);

  function openAddModal() {
    setFormModal({ editing: null, form: emptyForm(null) });
  }

  function openEditModal(table) {
    setFormModal({ editing: table, form: emptyForm(table) });
  }

  function patchForm(key, value) {
    setFormModal((prev) => ({ ...prev, form: { ...prev.form, [key]: value } }));
  }

  function handleSaveTable() {
    const { editing, form } = formModal;
    const number = form.number.trim();
    if (!number) return;
    const capacity = Number(form.capacity) || 1;

    if (editing) {
      setTables((prev) =>
        prev.map((t) => (t.id === editing.id ? { ...t, number, capacity, zone: form.zone } : t))
      );
      onToast(`Đã cập nhật bàn ${number}`);
    } else {
      setTables((prev) => [
        ...prev,
        { id: nextDraftId("tbl"), number, capacity, zone: form.zone, status: "vacant" },
      ]);
      onToast(`Đã thêm bàn ${number}`);
    }
    setFormModal(null);
  }

  function setStatus(table, status) {
    setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status } : t)));
  }

  function handleSeat(table) {
    const newOrder = {
      id: nextDraftId("ord"),
      tableId: table.id,
      openedAt: new Date(),
      items: [],
      kitchenStatus: "pending",
    };
    setOrders((prev) => [...prev, newOrder]);
    setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status: "occupied", guestCount: t.reservation?.guestCount ?? t.guestCount ?? 1, reservation: undefined } : t)));
    onOpenOrder(newOrder.id);
  }

  function handleReserve(table) {
    setReservationModal({ table, form: reservationForm(table) });
  }

  function patchReservation(key, value) {
    setReservationModal((prev) => ({ ...prev, form: { ...prev.form, [key]: value } }));
  }

  function saveReservation() {
    const { table, form } = reservationModal;
    const reservation = { ...form, guestCount: Math.max(1, Number(form.guestCount) || 1) };
    setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status: "reserved", reservation } : t)));
    setReservationModal(null);
    onToast(`Đã ${table.status === "reserved" ? "cập nhật" : "đặt"} bàn ${table.number}`);
  }

  function handleCancelReservation(table) {
    setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status: "vacant", reservation: undefined } : t)));
    onToast(`Đã hủy đặt trước bàn ${table.number}`);
  }

  function handleFinishCleaning(table) {
    setStatus(table, "vacant");
    onToast(`Bàn ${table.number} đã sẵn sàng đón khách`);
  }

  function handleNoShow(table) {
    setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, status: "vacant", reservation: undefined } : t)));
    onToast(`Đã ghi nhận khách không đến bàn ${table.number}`);
  }

  function saveGuestCount() {
    const count = Math.max(1, Number(guestModal.guestCount) || 1);
    setTables((prev) => prev.map((t) => (t.id === guestModal.table.id ? { ...t, guestCount: count } : t)));
    setGuestModal(null);
    onToast(`Đã cập nhật ${count} khách tại bàn ${guestModal.table.number}`);
  }

  function applyMove(targetId) {
    const { table, kind } = moveModal;
    const target = tables.find((t) => t.id === targetId);
    if (!target) return;
    if (kind === "reservation") {
      setTables((prev) => prev.map((t) => {
        if (t.id === table.id) return { ...t, status: "vacant", reservation: undefined };
        if (t.id === target.id) return { ...t, status: "reserved", reservation: table.reservation };
        return t;
      }));
      onToast(`Đã đổi bàn đặt từ ${table.number} sang ${target.number}`);
    } else if (kind === "merge") {
      const sourceOrder = orders.find((o) => o.tableId === table.id);
      const targetOrder = orders.find((o) => o.tableId === target.id);
      if (sourceOrder && targetOrder) {
        setOrders((prev) => prev.map((o) => o.id === targetOrder.id ? { ...o, items: [...o.items, ...sourceOrder.items] } : o).filter((o) => o.id !== sourceOrder.id));
      } else if (sourceOrder) {
        setOrders((prev) => prev.map((o) => o.id === sourceOrder.id ? { ...o, tableId: target.id } : o));
      }
      setTables((prev) => prev.map((t) => {
        if (t.id === table.id) return { ...t, status: "vacant", guestCount: undefined };
        if (t.id === target.id) return { ...t, status: "occupied", guestCount: (t.guestCount ?? 0) + (table.guestCount ?? 0) };
        return t;
      }));
      onToast(`Đã ghép bàn ${table.number} vào bàn ${target.number}`);
    } else {
      setOrders((prev) => prev.map((o) => o.tableId === table.id ? { ...o, tableId: target.id } : o));
      setTables((prev) => prev.map((t) => {
        if (t.id === table.id) return { ...t, status: "vacant", guestCount: undefined };
        if (t.id === target.id) return { ...t, status: "occupied", guestCount: table.guestCount };
        return t;
      }));
      onToast(`Đã đổi bàn ${table.number} sang bàn ${target.number}`);
    }
    setMoveModal(null);
  }

  function handleViewOrder(table) {
    const order = orders.find((o) => o.tableId === table.id);
    if (order) onOpenOrder(order.id);
  }

  function menuItemsFor(table) {
    if (table.status === "vacant") {
      return [
        { key: "seat", label: "Nhận khách", onClick: () => handleSeat(table) },
        { key: "reserve", label: "Đặt bàn", onClick: () => handleReserve(table) },
        { key: "edit", label: "Sửa thông tin bàn", divider: true, onClick: () => openEditModal(table) },
      ];
    }
    if (table.status === "reserved") {
      return [
        { key: "arrive", label: "Nhận khách / Check-in", onClick: () => handleSeat(table) },
        { key: "move", label: "Đổi bàn đặt", onClick: () => setMoveModal({ table, kind: "reservation" }) },
        { key: "editReservation", label: "Sửa đặt bàn", onClick: () => handleReserve(table) },
        { key: "noShow", label: "Khách không đến (No-show)", onClick: () => handleNoShow(table) },
        { key: "cancel", label: "Hủy đặt bàn", danger: true, onClick: () => handleCancelReservation(table) },
      ];
    }
    if (table.status === "occupied") {
      return [
        { key: "order", label: "Xem đơn hàng", onClick: () => handleViewOrder(table) },
        { key: "move", label: "Đổi bàn", onClick: () => setMoveModal({ table, kind: "move" }) },
        { key: "merge", label: "Ghép bàn", onClick: () => setMoveModal({ table, kind: "merge" }) },
        { key: "guests", label: "Thêm khách", onClick: () => setGuestModal({ table, guestCount: String((table.guestCount ?? table.capacity) + 1) }) },
        { key: "print", label: "In tạm tính", onClick: () => setPrintTarget(table) },
      ];
    }
    return [
      { key: "ready", label: "Đánh dấu đã dọn xong", onClick: () => handleFinishCleaning(table) },
    ];
  }

  const canSave = formModal && formModal.form.number.trim().length > 0;

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.legend}>
          {TABLE_STATUS_LEGEND.map((key) => {
            const meta = TABLE_STATUS[key];
            return (
              <span key={key} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: meta.color }} />
                {meta.label}
              </span>
            );
          })}
        </div>
        <button type="button" className={styles.addBtn} onClick={openAddModal}>
          <Plus size={16} /> Thêm bàn
        </button>
      </div>

      {tables.length === 0 ? (
        <EmptyState message="Chưa có bàn nào." hint='Nhấn "Thêm bàn" để tạo bàn đầu tiên.' />
      ) : (
        ZONES.map((zone) => {
          const zoneTables = tables.filter((t) => t.zone === zone);
          if (zoneTables.length === 0) return null;
          return (
            <div key={zone} className={styles.zoneSection}>
              <div className={styles.zoneSectionHead}>
                {zone} <span className={styles.zoneCount}>({zoneTables.length})</span>
              </div>
              <div className={styles.tableGrid}>
                {zoneTables.map((table) => {
                  const meta = TABLE_STATUS[table.status];
                  return (
                    <div key={table.id} className={styles.tableCard} style={{ borderLeftColor: meta.color }}>
                      <div className={styles.tableCardHead}>
                        <div>
                          <div className={styles.tableCardNumber}>Bàn {table.number}</div>
                          <div className={styles.tableCardZone}>{table.zone}</div>
                        </div>
                        <RowActionMenu items={menuItemsFor(table)} />
                      </div>
                      <div className={styles.tableCardMeta}>
                        <Users size={13} /> {table.reservation?.guestCount ?? table.guestCount ?? table.capacity} khách
                      </div>
                      <span className={styles.tableCardStatus} style={{ background: meta.soft, color: meta.color }}>
                        {meta.label}
                      </span>
                      {table.status === "occupied" && (
                        <button
                          type="button"
                          className={styles.tableCardOrderBtn}
                          onClick={() => handleViewOrder(table)}
                        >
                          Xem đơn hàng →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {formModal && (
        <SlidePanelShell
          title={formModal.editing ? "Sửa bàn" : "Thêm bàn"}
          onClose={() => setFormModal(null)}
          width={420}
          footer={
            <>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnSecondary}`}
                onClick={() => setFormModal(null)}
              >
                Huỷ
              </button>
              <button
                type="button"
                className={`${shared.btn} ${shared.btnPrimary}`}
                disabled={!canSave}
                onClick={handleSaveTable}
              >
                Lưu
              </button>
            </>
          }
        >
          <div className={shared.stack}>
            <label className={shared.field}>
              <span className={shared.label}>Số bàn *</span>
              <input
                autoFocus
                className={shared.input}
                value={formModal.form.number}
                onChange={(e) => patchForm("number", e.target.value)}
                placeholder="VD: 01"
              />
            </label>
            <div className={shared.row}>
              <label className={shared.field}>
                <span className={shared.label}>Sức chứa</span>
                <input
                  type="number"
                  min="1"
                  className={shared.input}
                  value={formModal.form.capacity}
                  onChange={(e) => patchForm("capacity", e.target.value)}
                />
              </label>
              <label className={shared.field}>
                <span className={shared.label}>Khu vực</span>
                <select
                  className={shared.select}
                  value={formModal.form.zone}
                  onChange={(e) => patchForm("zone", e.target.value)}
                >
                  {ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </SlidePanelShell>
      )}

      {reservationModal && (
        <SlidePanelShell title={reservationModal.table.status === "reserved" ? "Sửa đặt bàn" : "Đặt bàn"} onClose={() => setReservationModal(null)} width={420}
          footer={<><button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={() => setReservationModal(null)}>Huỷ</button><button type="button" className={`${shared.btn} ${shared.btnPrimary}`} disabled={!reservationModal.form.guestName.trim()} onClick={saveReservation}>Lưu đặt bàn</button></>}>
          <div className={shared.stack}>
            <label className={shared.field}><span className={shared.label}>Tên khách *</span><input autoFocus className={shared.input} value={reservationModal.form.guestName} onChange={(e) => patchReservation("guestName", e.target.value)} /></label>
            <div className={shared.row}><label className={shared.field}><span className={shared.label}>Số khách</span><input type="number" min="1" className={shared.input} value={reservationModal.form.guestCount} onChange={(e) => patchReservation("guestCount", e.target.value)} /></label><label className={shared.field}><span className={shared.label}>Giờ đến</span><input type="time" className={shared.input} value={reservationModal.form.time} onChange={(e) => patchReservation("time", e.target.value)} /></label></div>
            <label className={shared.field}><span className={shared.label}>Ghi chú</span><textarea className={shared.textarea} value={reservationModal.form.note} onChange={(e) => patchReservation("note", e.target.value)} /></label>
          </div>
        </SlidePanelShell>
      )}

      {guestModal && <SlidePanelShell title={`Thêm khách — Bàn ${guestModal.table.number}`} onClose={() => setGuestModal(null)} width={380} footer={<><button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={() => setGuestModal(null)}>Huỷ</button><button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={saveGuestCount}>Cập nhật</button></>}><label className={shared.field}><span className={shared.label}>Tổng số khách</span><input autoFocus type="number" min="1" className={shared.input} value={guestModal.guestCount} onChange={(e) => setGuestModal((prev) => ({ ...prev, guestCount: e.target.value }))} /></label></SlidePanelShell>}

      {moveModal && (() => {
        const targets = tables.filter((t) => t.id !== moveModal.table.id && (moveModal.kind === "merge" ? t.status === "occupied" : t.status === "vacant"));
        const label = moveModal.kind === "reservation" ? "Đổi bàn đặt" : moveModal.kind === "merge" ? "Ghép bàn" : "Đổi bàn";
        return <SlidePanelShell title={label} onClose={() => setMoveModal(null)} width={420}><div className={shared.stack}><p className={shared.bodyText}>Chọn bàn đích cho bàn {moveModal.table.number}.</p>{targets.length === 0 ? <p className={shared.hint}>Không có bàn phù hợp.</p> : targets.map((target) => <button key={target.id} type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={() => applyMove(target.id)}>Bàn {target.number} — {target.zone}</button>)}</div></SlidePanelShell>;
      })()}

      {printTarget && (() => {
        const order = orders.find((o) => o.tableId === printTarget.id);
        return <SlidePanelShell title={`Tạm tính — Bàn ${printTarget.number}`} onClose={() => setPrintTarget(null)} width={440} footer={<><button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={() => setPrintTarget(null)}>Đóng</button><button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={() => window.print()}>In tạm tính</button></>}><div className={shared.stack}>{order?.items.length ? <>{order.items.map((line) => <div key={line.itemId} className={styles.lineRow}><span className={styles.lineName}>{line.name} × {line.qty}</span><span className={styles.lineTotal}>{formatCurrency(line.price * line.qty)}</span></div>)}<div className={styles.orderFooter}><span className={styles.orderTotalLabel}>Tổng tạm tính</span><span className={styles.orderTotalValue}>{formatCurrency(orderTotal(order))}</span></div></> : <p className={shared.hint}>Chưa có món trong đơn.</p>}</div></SlidePanelShell>;
      })()}
    </>
  );
}

export default TableMapPanel;
