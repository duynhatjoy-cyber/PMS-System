import { useState } from "react";
import { Plus } from "lucide-react";
import ConfirmDialog from "../../../components/ConfirmDialog";
import EmptyState from "../../../components/EmptyState";
import shared from "../../FrontDesk/modals/shared.module.css";
import { formatDateTimeDMY } from "../../../utils/format";
import { CMS_PROVIDERS, INITIAL_CMS_CONNECTIONS, nextDraftId } from "../../../data/settingsData";
import styles from "../Settings.module.css";

function ChannelConnectionsPanel({ onToast }) {
  const [connections, setConnections] = useState(INITIAL_CMS_CONNECTIONS);
  const [addForm, setAddForm] = useState(null); // { provider } | null
  const [deleteTarget, setDeleteTarget] = useState(null);

  function handleTest(conn) {
    onToast(`Kết nối ${conn.provider} ổn định`);
  }

  function handleMap(conn) {
    onToast(`Ánh xạ loại phòng/gói giá cho ${conn.provider} sẽ có ở bản cập nhật tiếp theo`);
  }

  function handleConfirmDelete() {
    setConnections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    onToast(`Đã xoá kết nối ${deleteTarget.provider}`);
    setDeleteTarget(null);
  }

  function handleCreateConnection() {
    const provider = addForm.provider;
    const id = nextDraftId("cms");
    setConnections((prev) => [...prev, { id, provider, connectionId: `${provider.toLowerCase()}-${id}`, lastSync: new Date() }]);
    onToast(`Đã tạo kết nối ${provider}`);
    setAddForm(null);
  }

  return (
    <div className={styles.panelStack} style={{ maxWidth: 1000 }}>
      <div className={styles.cardHeadRow}>
        <div>
          <div className={styles.cardTitle}>Kết nối kênh phân phối (CMS)</div>
          <div className={styles.cardSubtitle}>Quản lý kết nối với Channex và các CMS khác để đồng bộ ARI.</div>
        </div>
        <button
          type="button"
          className={`${shared.btn} ${shared.btnPrimary}`}
          onClick={() => setAddForm({ provider: CMS_PROVIDERS[0] })}
        >
          <Plus size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
          Thêm kết nối
        </button>
      </div>

      {addForm && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Thêm kết nối CMS mới</div>
          <label className={shared.field}>
            <span className={shared.label}>Nhà cung cấp</span>
            <select
              className={shared.select}
              value={addForm.provider}
              onChange={(e) => setAddForm({ provider: e.target.value })}
            >
              {CMS_PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <p className={shared.hint}>
            Hệ thống sẽ tự động tạo property trong CMS và liên kết với khách sạn của bạn. Sau khi tạo, hãy cấu hình
            ánh xạ loại phòng và gói giá.
          </p>
          <div className={styles.copyRow}>
            <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={handleCreateConnection}>
              Tạo kết nối
            </button>
            <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={() => setAddForm(null)}>
              Huỷ
            </button>
          </div>
        </div>
      )}

      {connections.length === 0 ? (
        <EmptyState message="Chưa có kết nối CMS nào." hint='Nhấn "Thêm kết nối" để liên kết với Channex hoặc CMS khác.' />
      ) : (
        <div className={styles.card}>
          {connections.map((conn) => (
            <div key={conn.id} className={styles.cmsRow}>
              <span className={styles.cmsStatusDot} />
              <span className={styles.cmsProvider}>{conn.provider}</span>
              <span className={styles.cmsId}>{conn.connectionId}</span>
              <span className={styles.cmsSync}>Sync: {formatDateTimeDMY(conn.lastSync)}</span>
              <div className={styles.cmsActions}>
                <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={() => handleTest(conn)}>
                  Kiểm tra
                </button>
                <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={() => handleMap(conn)}>
                  Ánh xạ
                </button>
                <button
                  type="button"
                  className={`${shared.btn} ${shared.btnDanger}`}
                  onClick={() => setDeleteTarget(conn)}
                >
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xoá kết nối"
          message={`Bạn có chắc chắn xoá kết nối "${deleteTarget.provider}"? Đồng bộ ARI với kênh này sẽ dừng lại.`}
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default ChannelConnectionsPanel;
