import { useState } from "react";
import ModalShell from "./ModalShell";
import { formatCurrency } from "../../../utils/format";
import shared from "./shared.module.css";

const COPY = {
  cancel: {
    title: "Xác nhận hủy Đặt phòng",
    confirmLabel: "Hủy phòng",
    confirmVariant: shared.btnDanger,
  },
  unassign: {
    title: "Xác nhận bỏ gán phòng",
    confirmLabel: "Bỏ gán phòng",
    confirmVariant: shared.btnPrimary,
  },
  clean: {
    title: "Làm sạch phòng",
    confirmLabel: "Làm sạch phòng",
    confirmVariant: shared.btnPrimary,
  },
  checkout: {
    title: "Xác nhận trả phòng",
    confirmLabel: "Trả phòng",
    confirmVariant: shared.btnPrimary,
  },
};

function ConfirmActionModal({ variant, booking, remaining = 0, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [chargeFee, setChargeFee] = useState(true);
  const copy = COPY[variant];

  const needsReason = variant === "cancel";
  const canConfirm = !needsReason || reason.trim().length > 0;

  return (
    <ModalShell
      title={copy.title}
      onClose={onClose}
      width={460}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className={`${shared.btn} ${copy.confirmVariant}`}
            disabled={!canConfirm}
            onClick={() => onConfirm({ reason, sendEmail, chargeFee })}
          >
            {copy.confirmLabel}
          </button>
        </>
      }
    >
      {variant === "cancel" && (
        <div className={shared.stack}>
          <div className={shared.field}>
            <span className={shared.label}>Mô tả lý do (Bắt buộc)</span>
            <textarea
              className={shared.textarea}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Lý do hủy đặt phòng #${booking?.bookingCode ?? ""}`}
            />
          </div>
          <label className={shared.checkboxRow}>
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
            Gửi email cho khách hàng
          </label>
          <label className={shared.checkboxRow}>
            <input type="checkbox" checked={chargeFee} onChange={(e) => setChargeFee(e.target.checked)} />
            Thu phí hủy phòng
          </label>
        </div>
      )}

      {variant === "unassign" && (
        <p className={shared.bodyText}>
          Bạn có chắc muốn bỏ gán phòng <strong>{booking?.room}</strong> khỏi đặt phòng{" "}
          <strong>#{booking?.bookingCode}</strong>? Đặt phòng sẽ chuyển về trạng thái chưa gán phòng.
        </p>
      )}

      {variant === "clean" && (
        <p className={shared.bodyText}>
          Bạn có muốn chuyển phòng <strong>{booking?.room}</strong> sang trạng thái{" "}
          <strong>Sạch</strong> không?
        </p>
      )}

      {variant === "checkout" && (
        <p className={shared.bodyText}>
          Xác nhận trả phòng <strong>{booking?.room}</strong> cho khách{" "}
          <strong>{booking?.guest.name}</strong>?
          {remaining > 0 && (
            <>
              {" "}
              Khách vẫn còn <strong style={{ color: "var(--fd-danger)" }}>
                {formatCurrency(remaining)}
              </strong>{" "}
              chưa thanh toán.
            </>
          )}
        </p>
      )}
    </ModalShell>
  );
}

export default ConfirmActionModal;
