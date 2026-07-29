import { useState } from "react";
import ConfigListPanel from "./components/ConfigListPanel";
import ConfigEditorPanel from "./components/ConfigEditorPanel";
import Toast from "../FrontDesk/components/Toast";
import ConfirmDialog from "../../components/ConfirmDialog";
import { EMAIL_CONFIGS, DEFAULT_HEADER_HTML, DEFAULT_FOOTER_HTML } from "../../data/emailConfigData";
import styles from "./EmailConfig.module.css";

function EmailConfig() {
  const [configs, setConfigs] = useState(EMAIL_CONFIGS);
  const [editingId, setEditingId] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toggleTarget, setToggleTarget] = useState(null);

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

  function handleConfirmToggle() {
    const id = toggleTarget.id;
    setConfigs((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c
      )
    );
    setToggleTarget(null);
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
          onToast={setToastMsg}
        />
      ) : (
        <ConfigListPanel
          configs={configs}
          onCreate={handleCreate}
          onSelect={(id) => setEditingId(id)}
          onToggleStatus={(id) => setToggleTarget(configs.find((c) => c.id === id))}
        />
      )}

      {toggleTarget && (
        <ConfirmDialog
          title={toggleTarget.status === "active" ? "Tạm dừng cấu hình email" : "Kích hoạt cấu hình email"}
          message={
            toggleTarget.status === "active"
              ? `Tạm dừng cấu hình "${toggleTarget.name}"? Email sẽ ngừng được gửi qua cấu hình này cho đến khi bạn kích hoạt lại.`
              : `Kích hoạt cấu hình "${toggleTarget.name}"? Email của hệ thống sẽ bắt đầu được gửi qua tài khoản này.`
          }
          confirmLabel={toggleTarget.status === "active" ? "Tạm dừng" : "Kích hoạt"}
          onConfirm={handleConfirmToggle}
          onClose={() => setToggleTarget(null)}
        />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default EmailConfig;
