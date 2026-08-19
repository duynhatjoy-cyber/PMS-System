import { useMemo, useState } from "react";
import { Crown, X } from "lucide-react";
import shared from "../../FrontDesk/modals/shared.module.css";
import { GUESTS } from "../../../data/guestData";
import styles from "./GroupFormModal.module.css";

function emptyGroup() {
  return { name: "", leaderGuestId: "", memberGuestIds: [], note: "" };
}

function GroupFormModal({ group, onClose, onSave }) {
  const [form, setForm] = useState(() => ({ ...emptyGroup(), ...group }));
  const [searchText, setSearchText] = useState("");

  function patch(fields) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  const guestById = useMemo(() => Object.fromEntries(GUESTS.map((g) => [g.id, g])), []);

  const searchResults = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];
    return GUESTS.filter(
      (g) => !form.memberGuestIds.includes(g.id) && (g.name.toLowerCase().includes(q) || g.phone.includes(q))
    ).slice(0, 6);
  }, [searchText, form.memberGuestIds]);

  function addMember(guestId) {
    patch({ memberGuestIds: [...form.memberGuestIds, guestId] });
    setSearchText("");
  }

  function removeMember(guestId) {
    patch({
      memberGuestIds: form.memberGuestIds.filter((id) => id !== guestId),
      leaderGuestId: form.leaderGuestId === guestId ? "" : form.leaderGuestId,
    });
  }

  const canSave = form.name.trim().length > 0 && form.leaderGuestId && form.memberGuestIds.length > 0;

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={styles.panel} style={{ width: "min(640px, 100%)" }}>
        <div className={styles.head}>
          <h2 className={styles.title}>{group ? "Sửa đoàn" : "Thêm đoàn"}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} title="Đóng" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className={styles.panelBody}>
      <div className={styles.form}>
        <div className={shared.field}>
          <span className={shared.label}>Tên đoàn *</span>
          <input className={shared.input} value={form.name} onChange={(e) => patch({ name: e.target.value })} />
        </div>

        <div className={shared.field}>
          <span className={shared.label}>Thành viên</span>
          <div className={styles.searchWrap}>
            <input
              className={shared.input}
              placeholder="Tìm khách theo tên hoặc SĐT để thêm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText.trim() && (
              <div className={styles.searchResults}>
                {searchResults.length === 0 ? (
                  <div className={styles.searchEmpty}>Không tìm thấy khách phù hợp</div>
                ) : (
                  searchResults.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={styles.searchResultRow}
                      onClick={() => addMember(g.id)}
                    >
                      {g.name}
                      <span className={styles.searchResultPhone}>{g.phone}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {form.memberGuestIds.length === 0 ? (
            <div className={styles.emptyChipHint}>Chưa có thành viên nào — tìm và thêm khách ở trên.</div>
          ) : (
            <div className={styles.chipRow}>
              {form.memberGuestIds.map((id) => {
                const isLeader = form.leaderGuestId === id;
                return (
                  <span key={id} className={`${styles.chip} ${isLeader ? styles.chipLeader : ""}`}>
                    {isLeader && <Crown size={12} />}
                    {guestById[id]?.name || id}
                    <button type="button" className={styles.chipRemove} onClick={() => removeMember(id)}>
                      <X size={11} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className={shared.field}>
          <span className={shared.label}>Người đại diện *</span>
          <select
            className={shared.select}
            value={form.leaderGuestId}
            disabled={form.memberGuestIds.length === 0}
            onChange={(e) => patch({ leaderGuestId: e.target.value })}
          >
            <option value="">
              {form.memberGuestIds.length === 0 ? "Thêm thành viên trước" : "-- Chọn người đại diện --"}
            </option>
            {form.memberGuestIds.map((id) => (
              <option key={id} value={id}>
                {guestById[id]?.name || id}
              </option>
            ))}
          </select>
        </div>

        <div className={shared.field}>
          <span className={shared.label}>Ghi chú</span>
          <textarea className={shared.textarea} value={form.note} onChange={(e) => patch({ note: e.target.value })} />
        </div>
      </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            Huỷ
          </button>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            disabled={!canSave}
            onClick={() => onSave(form)}
          >
            Lưu
          </button>
        </div>
      </aside>
    </div>
  );
}

export default GroupFormModal;
