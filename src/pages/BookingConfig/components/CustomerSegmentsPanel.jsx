import { useState } from "react";
import { Plus, Save } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import { CUSTOMER_SEGMENTS } from "../../../data/bookingConfigData";
import { createIdSequence } from "../../../utils/id";

const nextId = createIdSequence();

function blankSegment() {
  return { id: nextId("seg-draft"), code: "", name: "", description: "" };
}

function CustomerSegmentsPanel({ styles, onToast }) {
  const [segments, setSegments] = useState(CUSTOMER_SEGMENTS);
  const [selectedId, setSelectedId] = useState(CUSTOMER_SEGMENTS[0]?.id ?? null);

  const selected = segments.find((s) => s.id === selectedId) || null;

  function handleAdd() {
    const draft = blankSegment();
    setSegments((prev) => [...prev, draft]);
    setSelectedId(draft.id);
  }

  function patchSelected(key, value) {
    setSegments((prev) => prev.map((s) => (s.id === selectedId ? { ...s, [key]: value } : s)));
  }

  function handleSave() {
    if (!selected.code.trim() || !selected.name.trim()) {
      onToast("Vui lòng nhập mã và tên phân khúc trước khi lưu");
      return;
    }
    onToast(`Đã lưu phân khúc "${selected.name}"`);
  }

  return (
    <div className={styles.main}>
      <div className={styles.panelHeaderRow}>
        <div>
          <div className={styles.panelTitle}>Phân khúc khách hàng</div>
          <p className={styles.panelSubtitle}>
            Quản lý các phân khúc dùng để gắn thẻ cho khách, giúp nhân viên nhận diện nhanh loại
            khách trên booking card.
          </p>
        </div>
      </div>

      <div className={styles.segmentLayout}>
        <div className={styles.segmentCol}>
          <div className={styles.listCard}>
            <div
              className={styles.listCardHead}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              Phân khúc khách hàng
              <button type="button" className={styles.addSourceBtn} onClick={handleAdd} title="Thêm phân khúc">
                <Plus size={14} />
              </button>
            </div>

            {segments.length === 0 ? (
              <EmptyState message="Chưa có phân khúc nào" hint='Nhấn "+" để thêm phân khúc đầu tiên.' />
            ) : (
              segments.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.segmentRow} ${s.id === selectedId ? styles.segmentRowActive : ""}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <div className={styles.segmentRowTitle}>{s.name || "Phân khúc mới"}</div>
                  <div className={styles.segmentRowSub}>Nhóm phân khúc khách hàng</div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className={styles.detailCol}>
          <div className={styles.detailCard}>
            {!selected ? (
              <EmptyState message="Chọn một phân khúc ở danh sách bên trái để xem chi tiết" />
            ) : (
              <>
                <div className={styles.detailTitle}>Chi tiết phân khúc khách hàng</div>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Mã phân khúc *</span>
                  <input
                    className={styles.fieldInput}
                    value={selected.code}
                    onChange={(e) => patchSelected("code", e.target.value)}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Tên phân khúc *</span>
                  <input
                    className={styles.fieldInput}
                    value={selected.name}
                    onChange={(e) => patchSelected("name", e.target.value)}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Mô tả</span>
                  <input
                    className={styles.fieldInput}
                    value={selected.description}
                    onChange={(e) => patchSelected("description", e.target.value)}
                  />
                </label>

                <div className={styles.actionsRow}>
                  <button type="button" className={styles.saveBtn} onClick={handleSave}>
                    <Save size={16} /> Lưu thay đổi
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerSegmentsPanel;
