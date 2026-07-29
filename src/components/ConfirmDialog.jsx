import ModalShell from "../pages/FrontDesk/modals/ModalShell";
import shared from "../pages/FrontDesk/modals/shared.module.css";

// Generic "are you sure" dialog — same shell/buttons as the app's other
// modals, for actions that shouldn't fire on a single unconfirmed click.
function ConfirmDialog({
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Đóng",
  danger = false,
  onConfirm,
  onClose,
}) {
  return (
    <ModalShell
      title={title}
      onClose={onClose}
      width={440}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`${shared.btn} ${danger ? shared.btnDanger : shared.btnPrimary}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className={shared.bodyText}>{message}</p>
    </ModalShell>
  );
}

export default ConfirmDialog;
