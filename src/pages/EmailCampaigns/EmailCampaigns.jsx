import { useState } from "react";
import CampaignListPanel from "./components/CampaignListPanel";
import CampaignEditorPanel from "./components/CampaignEditorPanel";
import Toast from "../FrontDesk/components/Toast";
import { EMAIL_CAMPAIGNS } from "../../data/emailCampaignData";
import styles from "./EmailCampaigns.module.css";

function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState(EMAIL_CAMPAIGNS);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  function toast(message) {
    setToastMsg(message);
  }

  function handleCreate() {
    const id = `cf-${Date.now()}`;
    const draft = {
      id,
      title: "Chiến dịch email mới",
      subtitle: "Lưu lại gửi sau",
      trigger: "upcoming",
      status: "inactive",
      subject: "",
      isDraft: true,
    };
    setCampaigns((prev) => [...prev, draft]);
    setEditingId(id);
  }

  function handleToggleStatus(id) {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c
      )
    );
  }

  function handleSaveCampaign(id, patch) {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    setEditingId(null);
    toast("Đã lưu chiến dịch email");
  }

  const editingCampaign = editingId ? campaigns.find((c) => c.id === editingId) : null;

  return (
    <div className={styles.page}>
      {editingCampaign ? (
        <CampaignEditorPanel
          campaign={editingCampaign}
          onBack={() => setEditingId(null)}
          onSave={(patch) => handleSaveCampaign(editingCampaign.id, patch)}
        />
      ) : (
        <CampaignListPanel
          campaigns={campaigns}
          showDeleted={showDeleted}
          onToggleShowDeleted={() => setShowDeleted((v) => !v)}
          onCreate={handleCreate}
          onSelect={(id) => setEditingId(id)}
          onToggleStatus={handleToggleStatus}
        />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default EmailCampaigns;
