import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ShieldCheck, Save } from "lucide-react";
import EmailToolbar from "../../../components/EmailToolbar";
import { SMTP_TYPES } from "../../../data/emailConfigData";
import styles from "../EmailConfig.module.css";

const TABS = [
  { key: "smtp", label: "SMTP" },
  { key: "signature", label: "Chữ ký" },
];

function ConfigEditorPanel({ config, onBack, onSave, onToast }) {
  const [tab, setTab] = useState("smtp");
  const [type, setType] = useState(config.type || "gmail");
  const [displayName, setDisplayName] = useState(config.name || "");
  const [host, setHost] = useState(config.host || "");
  const [port, setPort] = useState(config.port || "");
  const [accountName, setAccountName] = useState(config.accountName || "");
  const [password, setPassword] = useState(config.password || "");

  const headerRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) headerRef.current.innerHTML = config.headerHtml || "";
    if (footerRef.current) footerRef.current.innerHTML = config.footerHtml || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id]);

  function handleSave() {
    onSave({
      type,
      name: displayName,
      host,
      port,
      accountName,
      email: accountName,
      password,
      headerHtml: headerRef.current?.innerHTML ?? config.headerHtml,
      footerHtml: footerRef.current?.innerHTML ?? config.footerHtml,
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
            <ShieldCheck size={16} /> Kiểm Tra
          </button>
          <button type="button" className={styles.primaryBtn} onClick={handleSave}>
            <Save size={16} /> Lưu
          </button>
        </div>
      </div>

      <div className={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: tab === "smtp" ? "block" : "none" }}>
        <div className={styles.editorCard}>
          <div className={styles.smtpGrid}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Loại</span>
              <div className={styles.fieldInputRow}>
                <select
                  className={styles.fieldSelect}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {SMTP_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Máy chủ</span>
              <div className={styles.fieldInputRow}>
                <input
                  className={styles.fieldInput}
                  value={host}
                  maxLength={30}
                  onChange={(e) => setHost(e.target.value)}
                />
                <span className={styles.charCount}>{host.length}/30</span>
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Cổng</span>
              <div className={styles.fieldInputRow}>
                <input
                  className={styles.fieldInput}
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Tên email</span>
              <div className={styles.fieldInputRow}>
                <input
                  className={styles.fieldInput}
                  value={displayName}
                  maxLength={40}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <span className={styles.charCount}>{displayName.length}/40</span>
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Tên tài khoản</span>
              <div className={styles.fieldInputRow}>
                <input
                  className={styles.fieldInput}
                  value={accountName}
                  maxLength={50}
                  onChange={(e) => setAccountName(e.target.value)}
                />
                <span className={styles.charCount}>{accountName.length}/50</span>
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Mật khẩu</span>
              <div className={styles.fieldInputRow}>
                <input
                  type="password"
                  className={styles.fieldInput}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: tab === "signature" ? "block" : "none" }}>
        <div className={styles.signatureCard}>
          <div className={styles.signatureBlock}>
            <span className={styles.signatureLabel}>ĐẦU EMAIL</span>
            <div className={styles.composer}>
              <EmailToolbar onToast={onToast} />
              <div ref={headerRef} className={styles.contentArea} contentEditable suppressContentEditableWarning />
            </div>
          </div>

          <div className={styles.signatureBlock}>
            <span className={styles.signatureLabel}>CUỐI EMAIL</span>
            <div className={styles.composer}>
              <EmailToolbar onToast={onToast} />
              <div ref={footerRef} className={styles.contentArea} contentEditable suppressContentEditableWarning />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigEditorPanel;
