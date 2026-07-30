import { useState } from "react";
import { Save, X } from "lucide-react";
import shared from "../../FrontDesk/modals/shared.module.css";
import { INITIAL_AI_CONFIG } from "../../../data/settingsData";
import styles from "../Settings.module.css";

function AiConfigPanel({ onToast }) {
  const [threshold, setThreshold] = useState(INITIAL_AI_CONFIG.confidenceThreshold);
  const [keywords, setKeywords] = useState(INITIAL_AI_CONFIG.escalationKeywords);
  const [newKeyword, setNewKeyword] = useState("");

  function handleAddKeyword() {
    const value = newKeyword.trim();
    if (!value || keywords.includes(value)) return;
    setKeywords((prev) => [...prev, value]);
    setNewKeyword("");
  }

  function handleRemoveKeyword(word) {
    setKeywords((prev) => prev.filter((k) => k !== word));
  }

  function handleSave() {
    onToast("Đã lưu cấu hình AI");
  }

  return (
    <div className={styles.panelStack}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Cấu hình AI</div>

        <label className={shared.field}>
          <span className={shared.label}>Ngưỡng tin cậy ({threshold}%)</span>
          <input
            type="range"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className={styles.rangeInput}
          />
          <span className={shared.hint}>Câu trả lời dưới ngưỡng này sẽ được chuyển cho nhân viên.</span>
        </label>

        <label className={shared.field}>
          <span className={shared.label}>Từ khóa chuyển tiếp</span>
          <div className={styles.copyRow}>
            <input
              className={shared.input}
              placeholder="Thêm từ khóa..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
            />
            <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={handleAddKeyword}>
              Thêm
            </button>
          </div>
          <span className={shared.hint}>Khi khách nhắn chứa từ khóa, cuộc hội thoại sẽ được chuyển cho nhân viên.</span>
        </label>

        {keywords.length > 0 && (
          <div className={styles.chipRow}>
            {keywords.map((word) => (
              <span key={word} className={styles.keywordChip}>
                {word}
                <button type="button" onClick={() => handleRemoveKeyword(word)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div>
          <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={handleSave}>
            <Save size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiConfigPanel;
