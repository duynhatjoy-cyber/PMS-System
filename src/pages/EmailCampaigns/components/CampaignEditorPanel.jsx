import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Eye,
  Save,
  PlaneTakeoff,
  PlaneLanding,
  BedDouble,
  Cake,
  Copy,
  Clock,
  Download,
  User,
  Mail,
} from "lucide-react";
import { CAMPAIGN_TRIGGERS, MERGE_TAG_GROUPS, TEMPLATES_BY_TRIGGER } from "../../../data/emailCampaignData";
import EmailToolbar from "../../../components/EmailToolbar";
import styles from "../EmailCampaigns.module.css";

const TRIGGER_ICONS = {
  PlaneTakeoff,
  PlaneLanding,
  BedDouble,
  Cake,
};

function CampaignEditorPanel({ campaign, onBack, onSave, onToast }) {
  const [trigger, setTrigger] = useState(campaign.trigger || "upcoming");
  const [subject, setSubject] = useState(campaign.subject || "");
  const [sendMode, setSendMode] = useState(campaign.sendMode || "draft"); // "auto" | "draft"
  const [sendAnchor, setSendAnchor] = useState(campaign.sendAnchor || "before_arrival");
  const [sendDays, setSendDays] = useState(campaign.sendDays ?? 1);
  const [sendFrom, setSendFrom] = useState(campaign.sendFrom || "Khachsan.com");
  const [cc, setCc] = useState(campaign.cc || "");
  const [bcc, setBcc] = useState(campaign.bcc || "");
  const [applyToCms, setApplyToCms] = useState(Boolean(campaign.applyToCms));

  const bodyRef = useRef(null);
  const savedRangeRef = useRef(null);
  const bodyByTriggerRef = useRef({});

  useEffect(() => {
    bodyByTriggerRef.current = { ...(campaign.bodyByTrigger || {}) };
    if (bodyRef.current) {
      const initialTrigger = campaign.trigger || "upcoming";
      bodyRef.current.innerHTML =
        campaign.bodyHtml ||
        bodyByTriggerRef.current[initialTrigger] ||
        TEMPLATES_BY_TRIGGER[initialTrigger] ||
        TEMPLATES_BY_TRIGGER.upcoming;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign.id]);

  function handleTriggerChange(nextTrigger) {
    if (nextTrigger === trigger) return;
    if (bodyRef.current) {
      bodyByTriggerRef.current[trigger] = bodyRef.current.innerHTML;
    }
    setTrigger(nextTrigger);
    savedRangeRef.current = null;
    if (bodyRef.current) {
      bodyRef.current.innerHTML =
        bodyByTriggerRef.current[nextTrigger] || TEMPLATES_BY_TRIGGER[nextTrigger] || TEMPLATES_BY_TRIGGER.upcoming;
    }
  }

  const visibleTagGroups = useMemo(
    () => MERGE_TAG_GROUPS.filter((group) => !group.hideForTriggers?.includes(trigger)),
    [trigger]
  );

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (bodyRef.current && bodyRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  }

  function makeTagChip(tag) {
    const span = document.createElement("span");
    span.className = "cf-tag";
    span.contentEditable = "false";
    span.textContent = `[${tag}]`;
    return span;
  }

  function getInsertionRange() {
    const el = bodyRef.current;
    el.focus();

    const sel = window.getSelection();
    let range = savedRangeRef.current;
    if (!range || !el.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
    }
    sel.removeAllRanges();
    sel.addRange(range);
    range.deleteContents();
    return { sel, range };
  }

  function insertTag(tag) {
    if (!bodyRef.current) return;
    const { sel, range } = getInsertionRange();

    const span = makeTagChip(tag);
    range.insertNode(span);

    const spaceNode = document.createTextNode(" ");
    range.setStartAfter(span);
    range.collapse(true);
    range.insertNode(spaceNode);
    range.setStartAfter(spaceNode);
    range.collapse(true);

    sel.removeAllRanges();
    sel.addRange(range);
    savedRangeRef.current = range.cloneRange();
  }

  function insertBlockTag(openTag, closeTag) {
    if (!bodyRef.current) return;
    const { sel, range } = getInsertionRange();

    const openSpan = makeTagChip(openTag);
    range.insertNode(openSpan);
    range.setStartAfter(openSpan);
    range.collapse(true);

    const br1 = document.createElement("br");
    range.insertNode(br1);
    range.setStartAfter(br1);
    range.collapse(true);

    const br2 = document.createElement("br");
    range.insertNode(br2);
    range.setStartBefore(br2);
    range.collapse(true);

    const closeSpan = makeTagChip(closeTag);
    br2.parentNode.insertBefore(closeSpan, br2.nextSibling);

    sel.removeAllRanges();
    sel.addRange(range);
    savedRangeRef.current = range.cloneRange();
  }

  function handleSave() {
    if (bodyRef.current) {
      bodyByTriggerRef.current[trigger] = bodyRef.current.innerHTML;
    }
    onSave({
      trigger,
      subject,
      title: subject || campaign.title,
      bodyHtml: bodyByTriggerRef.current[trigger] || campaign.bodyHtml,
      bodyByTrigger: bodyByTriggerRef.current,
      sendMode,
      sendAnchor,
      sendDays,
      sendFrom,
      cc,
      bcc,
      applyToCms,
    });
  }

  return (
    <div className={styles.editor}>
      <div className={styles.editorTopBar}>
        <button type="button" className={styles.ghostBtn} onClick={onBack}>
          <ArrowLeft size={16} /> Trở Lại
        </button>

        <div className={styles.editorTopActions}>
          <button type="button" className={styles.ghostBtn}>
            <Eye size={16} /> Xem Trước
          </button>
          <button type="button" className={styles.primaryBtn} onClick={handleSave}>
            <Save size={16} /> Lưu
          </button>
        </div>
      </div>

      <div className={styles.triggerRow}>
        {CAMPAIGN_TRIGGERS.map((t) => {
          const Icon = TRIGGER_ICONS[t.icon];
          const active = trigger === t.key;
          return (
            <button
              key={t.key}
              type="button"
              className={`${styles.triggerTile} ${active ? styles.triggerTileActive : ""}`}
              onClick={() => handleTriggerChange(t.key)}
            >
              <span className={styles.triggerIcon}>
                <Icon size={20} strokeWidth={1.7} />
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div className={styles.editorCard}>
        <div className={styles.titleFieldRow}>
          <div className={styles.titleFieldTop}>
            <span className={styles.fieldLabel}>Tiêu đề</span>
            <button type="button" className={styles.copyLink}>
              <Copy size={14} /> Copy Mẫu Thư
            </button>
          </div>
          <div className={styles.titleInputRow}>
            <input
              className={styles.titleInput}
              value={subject}
              maxLength={120}
              onChange={(e) => setSubject(e.target.value)}
            />
            <span className={styles.charCount}>{subject.length}/120</span>
          </div>
        </div>

        <div className={styles.editorMain}>
          <div className={styles.composer}>
            <EmailToolbar onToast={onToast} />

            <div
              ref={bodyRef}
              className={styles.contentArea}
              contentEditable
              suppressContentEditableWarning
              onMouseUp={saveSelection}
              onKeyUp={saveSelection}
              onBlur={saveSelection}
            />
          </div>

          <div className={styles.tagSidebar}>
            <div className={styles.tagSidebarHint}>
              Bấm vào một thẻ bên dưới để chèn vào nội dung email — khi gửi thật, thẻ sẽ tự động
              đổi thành thông tin tương ứng của khách/đặt phòng.
            </div>
            {visibleTagGroups.map((group) => (
              <div className={styles.tagGroup} key={group.key}>
                <div className={styles.tagGroupTitle}>{group.title}</div>
                {group.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={styles.tagBtn}
                    onClick={() => insertTag(tag)}
                  >
                    [{tag}]
                  </button>
                ))}
                {group.blockTags?.map((block) => (
                  <button
                    key={block.open}
                    type="button"
                    className={styles.tagBtn}
                    onClick={() => insertBlockTag(block.open, block.close)}
                  >
                    [{block.open}] ... [{block.close}]
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.scheduleGroup}>
            <div className={styles.scheduleTilesRow}>
              <button
                type="button"
                className={`${styles.scheduleTile} ${sendMode === "auto" ? styles.scheduleTileActive : ""}`}
                onClick={() => setSendMode("auto")}
              >
                <span className={styles.scheduleIcon}>
                  <Clock size={20} strokeWidth={1.7} />
                </span>
                Tiến trình tự động gửi
              </button>
              <button
                type="button"
                className={`${styles.scheduleTile} ${sendMode === "draft" ? styles.scheduleTileActive : ""}`}
                onClick={() => setSendMode("draft")}
              >
                <span className={styles.scheduleIcon}>
                  <Download size={20} strokeWidth={1.7} />
                </span>
                Lưu lại gửi sau
              </button>
            </div>

            {sendMode === "auto" && (
              <div className={styles.scheduleDetailRow}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="sendAnchor"
                    checked={sendAnchor === "before_arrival"}
                    onChange={() => setSendAnchor("before_arrival")}
                  />
                  Trước ngày đến
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="sendAnchor"
                    checked={sendAnchor === "after_booking"}
                    onChange={() => setSendAnchor("after_booking")}
                  />
                  Sau ngày đặt
                </label>

                <div className={styles.dayField}>
                  <span className={styles.fieldLabel}>
                    Ngày <span className={styles.requiredMark}>*</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    className={styles.dayInput}
                    value={sendDays}
                    onChange={(e) => setSendDays(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={styles.sendConfigGrid}>
            <div className={styles.sendField}>
              <span className={styles.sendFieldLabel}>Gửi từ</span>
              <div className={styles.sendInputRow}>
                <User size={15} />
                <input value={sendFrom} onChange={(e) => setSendFrom(e.target.value)} />
              </div>
            </div>
            <div className={styles.sendField}>
              <span className={styles.sendFieldLabel}>Cấu hình CC</span>
              <div className={styles.sendInputRow}>
                <Mail size={15} />
                <input
                  value={cc}
                  placeholder="a@gmail.com;b@gmail.com"
                  onChange={(e) => setCc(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.sendField}>
              <span className={styles.sendFieldLabel}>Cấu hình BCC</span>
              <div className={styles.sendInputRow}>
                <Mail size={15} />
                <input
                  value={bcc}
                  placeholder="a@gmail.com;b@gmail.com"
                  onChange={(e) => setBcc(e.target.value)}
                />
              </div>
            </div>

            <label className={styles.cmsCheckboxRow}>
              <input
                type="checkbox"
                checked={applyToCms}
                onChange={(e) => setApplyToCms(e.target.checked)}
              />
              Áp dụng cho CMS
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignEditorPanel;
