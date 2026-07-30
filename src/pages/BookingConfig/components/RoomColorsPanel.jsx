import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import BookingCardPreview from "./BookingCardPreview";
import { DEFAULT_CARD_FIELDS, ROOM_STATUSES } from "../../../data/bookingConfigData";
import {
  defaultRoomStatusColors,
  readRoomStatusColors,
  saveRoomStatusColors,
} from "../../../utils/roomColorConfig";

const SAMPLE_ROOMS = ["101", "102", "103", "104", "105", "106", "107"];

function RoomColorsPanel({ styles, onToast }) {
  const [colors, setColors] = useState(readRoomStatusColors);

  function handleChange(id, value) {
    setColors((prev) => ({ ...prev, [id]: value }));
  }

  function handleReset() {
    const defaults = defaultRoomStatusColors();
    setColors(defaults);
    saveRoomStatusColors(defaults);
    onToast("Đã khôi phục màu mặc định");
  }

  function handleSave() {
    saveRoomStatusColors(colors);
    onToast("Đã lưu màu trạng thái phòng");
  }

  return (
    <div className={styles.main}>
      <div className={styles.panelHeaderRow}>
        <div>
          <div className={styles.panelTitle}>Màu trạng thái phòng</div>
          <p className={styles.panelSubtitle}>
            Thay vì mở color picker quá lớn, quản lý màu theo từng trạng thái để nhân viên dễ hiểu.
          </p>
        </div>
      </div>

      <BookingCardPreview styles={styles} fields={DEFAULT_CARD_FIELDS} />

      <div className={styles.colorLayout}>
        <div className={styles.colorTableCard}>
          <table className={styles.colorTable}>
            <colgroup>
              <col style={{ width: "42%" }} />
              <col style={{ width: "32%" }} />
              <col style={{ width: "26%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Trạng thái</th>
                <th>Màu hiện tại</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {ROOM_STATUSES.map((status) => (
                <tr key={status.id}>
                  <td>
                    <div className={styles.statusLabelCell}>
                      <span className={styles.statusDot} style={{ background: colors[status.id] }} />
                      {status.label}
                    </div>
                  </td>
                  <td>
                    <div className={styles.swatchGroup}>
                      <label
                        htmlFor={`color-${status.id}`}
                        className={styles.swatchLabel}
                        style={{ background: colors[status.id] }}
                        title="Đổi màu"
                      />
                      <span className={styles.swatchHex}>{colors[status.id]}</span>
                    </div>
                  </td>
                  <td>
                    <label htmlFor={`color-${status.id}`} className={styles.changeColorLabel}>
                      Đổi màu
                    </label>
                    <input
                      type="color"
                      id={`color-${status.id}`}
                      className={styles.hiddenColorInput}
                      value={colors[status.id]}
                      onChange={(e) => handleChange(status.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.colorPreviewCol}>
          <div className={styles.miniGridCard}>
            <div className={styles.previewLabel}>Preview sơ đồ phòng</div>
            <div className={styles.miniGridHint}>
              Màu nền dùng để phân biệt trạng thái, không nên chỉ dùng để trang trí.
            </div>
            <div className={styles.miniGrid}>
              {ROOM_STATUSES.map((status, i) => (
                <div
                  key={status.id}
                  className={styles.miniTile}
                  style={{ background: colors[status.id] }}
                >
                  <span className={styles.miniTileRoom}>{SAMPLE_ROOMS[i]}</span>
                  <span className={styles.miniTileLabel}>{status.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <button type="button" className={styles.cancelBtn} onClick={handleReset}>
          <RotateCcw size={15} style={{ marginRight: 6 }} /> Màu mặc định
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          <Save size={16} /> Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

export default RoomColorsPanel;
