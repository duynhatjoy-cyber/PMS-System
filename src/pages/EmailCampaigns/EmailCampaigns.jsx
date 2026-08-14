import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import CampaignListPanel from "./components/CampaignListPanel";
import CampaignEditorPanel from "./components/CampaignEditorPanel";
import PauseConfirmModal from "./components/PauseConfirmModal";
import DevicePreviewModal from "./components/DevicePreviewModal";
import Toast from "../FrontDesk/components/Toast";
import { EMAIL_CAMPAIGNS } from "../../data/emailCampaignData";
import styles from "./EmailCampaigns.module.css";

function EmailCampaigns() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState(EMAIL_CAMPAIGNS);
  const [showDeleted, setShowDeleted] = useState(false);
  const [pauseTarget, setPauseTarget] = useState(null);
  const [previewRequest, setPreviewRequest] = useState(null);
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
    setSearchParams({ campaign: id, filter: draft.trigger });
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
    setSearchParams({});
    toast("Đã lưu chiến dịch email");
  }

  function handleSelectCampaign(id) {
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) return;
    setSearchParams({ campaign: id, filter: campaign.trigger || "upcoming" });
  }

  function handleFilterChange(filter) {
    const campaignId = searchParams.get("campaign");
    if (!campaignId) return;
    setSearchParams({ campaign: campaignId, filter });
  }

  function handleConfirmPause() {
    handleToggleStatus(pauseTarget.id);
    setPauseTarget(null);
    toast("Đã tạm dừng chiến dịch email");
  }

  const editingId = searchParams.get("campaign");
  const editingCampaign = editingId ? campaigns.find((c) => c.id === editingId) : null;
  const requestedFilter = searchParams.get("filter");
  const activeFilter = ["upcoming", "departed", "inhouse", "birthday"].includes(requestedFilter)
    ? requestedFilter
    : editingCampaign?.trigger || "upcoming";

  return (
    <div className={styles.page}>
      {editingCampaign ? (
        <CampaignEditorPanel
          campaign={editingCampaign}
          activeTrigger={activeFilter}
          onTriggerChange={handleFilterChange}
          onBack={() => setSearchParams({})}
          onSave={(patch) => handleSaveCampaign(editingCampaign.id, patch)}
          onToast={toast}
        />
      ) : (
        <CampaignListPanel
          campaigns={campaigns}
          showDeleted={showDeleted}
          onToggleShowDeleted={() => setShowDeleted((v) => !v)}
          onCreate={handleCreate}
          onSelect={handleSelectCampaign}
          onRequestPause={setPauseTarget}
          onPreviewDevice={(campaign, device) => setPreviewRequest({ campaign, device })}
        />
      )}

      {pauseTarget && (
        <PauseConfirmModal
          campaign={pauseTarget}
          onClose={() => setPauseTarget(null)}
          onConfirm={handleConfirmPause}
        />
      )}

      {previewRequest && (
        <DevicePreviewModal
          campaign={previewRequest.campaign}
          device={previewRequest.device}
          onClose={() => setPreviewRequest(null)}
        />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default EmailCampaigns;
