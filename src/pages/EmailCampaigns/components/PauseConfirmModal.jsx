import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";

function PauseConfirmModal({ campaign, onClose, onConfirm }) {
  return (
    <ModalShell
      title="Tạm dừng chiến dịch email"
      onClose={onClose}
      width={440}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            Đóng
          </button>
          <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={onConfirm}>
            Tạm dừng
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: "var(--fd-text)", lineHeight: 1.6 }}>
        Bạn có chắc muốn tạm dừng chiến dịch <strong>{campaign?.title}</strong>? Email sẽ ngừng
        được gửi tự động cho đến khi bạn kích hoạt lại.
      </p>
    </ModalShell>
  );
}

export default PauseConfirmModal;
