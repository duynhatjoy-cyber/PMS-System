import { useState } from "react";
import ConfigListPanel from "./components/ConfigListPanel";
import ConfigEditorPanel from "./components/ConfigEditorPanel";
import Toast from "../FrontDesk/components/Toast";
import { EMAIL_CONFIGS, DEFAULT_HEADER_HTML, DEFAULT_FOOTER_HTML } from "../../data/emailConfigData";
import styles from "./EmailConfig.module.css";

function EmailConfig() {
  const [configs, setConfigs] = useState(EMAIL_CONFIGS);
  const [editingId, setEditingId] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  function handleCreate() {
    const id = `ec-${Date.now()}`;
    const draft = {
      id,
      name: "Cấu hình email mới",
      email: "",
      status: "inactive",
      type: "gmail",
      host: "",
      port: "587",
      accountName: "",
      password: "",
      headerHtml: DEFAULT_HEADER_HTML,
      footerHtml: DEFAULT_FOOTER_HTML,
    };
    setConfigs((prev) => [...prev, draft]);
    setEditingId(id);
  }

  function handleToggleStatus(id) {
    setConfigs((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c
      )
    );
  }

  function handleSaveConfig(id, patch) {
    setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    setEditingId(null);
    setToastMsg("Đã lưu cấu hình email");
  }

  const editingConfig = editingId ? configs.find((c) => c.id === editingId) : null;

  return (
    <div className={styles.page}>
      {editingConfig ? (
        <ConfigEditorPanel
          config={editingConfig}
          onBack={() => setEditingId(null)}
          onSave={(patch) => handleSaveConfig(editingConfig.id, patch)}
        />
      ) : (
        <ConfigListPanel
          configs={configs}
          onCreate={handleCreate}
          onSelect={(id) => setEditingId(id)}
          onToggleStatus={handleToggleStatus}
        />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default EmailConfig;
