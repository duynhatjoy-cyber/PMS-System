import { useState } from "react";
import { Plus, Users } from "lucide-react";
import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import ConfirmDialog from "../../../components/ConfirmDialog";
import RowActionMenu from "../../FrontDesk/components/RowActionMenu";
import EmptyState from "../../../components/EmptyState";
import { nextDraftId, TABLE_STATUS, TABLE_STATUS_LEGEND, ZONES } from "../../../data/fnbData";
import styles from "../FnB.module.css";

function emptyForm(table) {
  return {
    number: table?.number ?? "",
    capacity: table ? String(table.capacity) : "4",
    zone: table?.zone ?? ZONES[0],
  };
}

function TableMapPanel({ tables, setTables, orders, setOrders, onOpenOrder, onToast }) {
  const [formModal, setFormModal] = useState(null); // { editing: table|null, form }
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  function handleConfirmDelete() {
    setTables((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    onToast(`Đã xóa bàn ${deleteTarget.number}`);
    setDeleteTarget(null);
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
    setStatus(table, "occupied");
    onOpenOrder(newOrder.id);
  }

  function handleReserve(table) {
    setStatus(table, "reserved");
    onToast(`Đã đặt trước bàn ${table.number}`);
  }

  function handleCancelReservation(table) {
    setStatus(table, "vacant");
    onToast(`Đã hủy đặt trước bàn ${table.number}`);
  }

  function handleFinishCleaning(table) {
    setStatus(table, "vacant");
    onToast(`Bàn ${table.number} đã sẵn sàng đón khách`);
  }

  function handleViewOrder(table) {
    const order = orders.find((o) => o.tableId === table.id);
    if (order) onOpenOrder(order.id);
  }

  function menuItemsFor(table) {
    if (table.status === "vacant") {
      return [
        { key: "seat", label: "Nhận khách", onClick: () => handleSeat(table) },
        { key: "reserve", label: "Đặt bàn trước", onClick: () => handleReserve(table) },
        { key: "edit", label: "Sửa bàn", divider: true, onClick: () => openEditModal(table) },
        { key: "delete", label: "Xóa bàn", danger: true, onClick: () => setDeleteTarget(table) },
      ];
    }
    if (table.status === "reserved") {
      return [
        { key: "arrive", label: "Khách đã đến — nhận bàn", onClick: () => handleSeat(table) },
        { key: "cancel", label: "Hủy đặt trước", onClick: () => handleCancelReservation(table) },
        { key: "edit", label: "Sửa bàn", divider: true, onClick: () => openEditModal(table) },
      ];
    }
    if (table.status === "occupied") {
      return [
        { key: "order", label: "Xem đơn hàng", onClick: () => handleViewOrder(table) },
        { key: "edit", label: "Sửa bàn", divider: true, onClick: () => openEditModal(table) },
      ];
    }
    return [
      { key: "ready", label: "Bàn đã sẵn sàng", onClick: () => handleFinishCleaning(table) },
      { key: "edit", label: "Sửa bàn", divider: true, onClick: () => openEditModal(table) },
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
                        <Users size={13} /> {table.capacity} khách
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
        <ModalShell
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
        </ModalShell>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xóa bàn"
          message={`Bạn có chắc chắn xóa bàn ${deleteTarget.number}? Không thể hoàn tác.`}
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

export default TableMapPanel;
