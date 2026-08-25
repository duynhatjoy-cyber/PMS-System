import { useState } from "react";
import SlidePanelShell from "../../FrontDesk/modals/SlidePanelShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { formatDMY, formatCurrency, toLocalInputValue } from "../../../utils/format";
import tableStyles from "../Warehouse.module.css";
import styles from "./WarehouseModal.module.css";

function fieldViewValue(field, value) {
  if (field.type === "date") return value ? formatDMY(value) : "—";
  if (field.type === "currency") return formatCurrency(value || 0);
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

// Generic view/edit panel for a ticket row (any Kho or Mua hàng tab) — the
// caller describes which fields to show via `fields`/`lineColumns` instead of
// each panel needing its own bespoke detail modal.
function TicketDetailModal({ title, row, fields, lineColumns, onClose, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(row);

  function patch(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onSave(draft);
  }

  return (
    <SlidePanelShell
      title={`${title} — ${row.ticketNo}`}
      onClose={onClose}
      tone="brand"
      width={row.lines?.length ? 860 : 560}
    >
      <div className={styles.printSheet} style={{ maxWidth: "none" }}>
        {fields.map((field) => {
          const value = editing ? draft[field.key] : row[field.key];
          const canEdit = editing && field.editable !== false;
          return (
            <div key={field.key} className={styles.printRow}>
              <span className={styles.printLabel}>{field.label}</span>
              {!canEdit ? (
                <span className={styles.printValue}>{fieldViewValue(field, value)}</span>
              ) : field.type === "select" ? (
                <select
                  className={styles.underlineSelect}
                  value={value ?? ""}
                  onChange={(e) => patch(field.key, e.target.value)}
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "date" ? (
                <input
                  type="date"
                  className={styles.underlineInput}
                  value={value ? toLocalInputValue(value).slice(0, 10) : ""}
                  onChange={(e) => patch(field.key, e.target.value ? new Date(e.target.value) : null)}
                />
              ) : field.type === "currency" ? (
                <input
                  type="number"
                  min="0"
                  className={styles.underlineInput}
                  value={value ?? 0}
                  onChange={(e) => patch(field.key, Number(e.target.value) || 0)}
                />
              ) : (
                <input
                  type="text"
                  className={styles.underlineInput}
                  value={value ?? ""}
                  onChange={(e) => patch(field.key, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      {row.lines?.length > 0 && lineColumns && (
        <div className={styles.tableWrap} style={{ marginTop: 16 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                {lineColumns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {row.lines.map((line, i) => (
                <tr key={i}>
                  {lineColumns.map((col) => (
                    <td key={col.key} className={col.numeric ? tableStyles.numCell : undefined}>
                      {col.format ? col.format(line[col.key]) : line[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.footerBtns}>
        {editing ? (
          <>
            <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={handleSave}>
              LƯU
            </button>
            <button
              type="button"
              className={`${shared.btn} ${shared.btnSecondary}`}
              onClick={() => {
                setDraft(row);
                setEditing(false);
              }}
            >
              HỦY
            </button>
          </>
        ) : (
          <>
            <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={() => setEditing(true)}>
              CHỈNH SỬA
            </button>
            <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
              ĐÓNG
            </button>
          </>
        )}
      </div>
    </SlidePanelShell>
  );
}

export default TicketDetailModal;
