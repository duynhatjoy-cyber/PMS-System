import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import styles from "./WarehouseModal.module.css";

const HOTEL_NAME = "Nha Cua My Admin";

function buildPrintHtml({ title, ticketNo, date, fields }) {
  const rows = fields
    .map(
      (f) =>
        `<tr><td style="padding:7px 0;color:#6b7280;">${f.label}</td><td style="padding:7px 0;text-align:right;font-weight:600;">${f.value}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${title} ${ticketNo}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; padding: 32px; color: #1f2937; }
  h1 { font-size: 15px; text-align: center; margin: 0 0 2px; }
  h2 { font-size: 19px; text-align: center; margin: 0 0 4px; text-transform: uppercase; }
  p.meta { text-align: center; color: #6b7280; margin: 0 0 22px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; max-width: 460px; margin: 0 auto; }
  td { border-bottom: 1px dashed #d1d5db; font-size: 14px; }
  tr:last-child td { border-bottom: none; }
</style>
</head>
<body>
  <h1>${HOTEL_NAME}</h1>
  <h2>${title}</h2>
  <p class="meta">Số phiếu: ${ticketNo} — Ngày: ${date}</p>
  <table>${rows}</table>
</body>
</html>`;
}

function PrintPreviewModal({ title, ticketNo, date, fields, onClose }) {
  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=650,height=800");
    if (!printWindow) return;
    printWindow.document.write(buildPrintHtml({ title, ticketNo, date, fields }));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 200);
  }

  return (
    <ModalShell title={title} onClose={onClose} tone="brand" width={560}>
      <div className={styles.printSheet}>
        <div className={styles.printHotel}>{HOTEL_NAME}</div>
        <div className={styles.printTitle}>{title}</div>
        <div className={styles.printMeta}>
          Số phiếu: {ticketNo} — Ngày: {date}
        </div>

        {fields.map((f) => (
          <div key={f.label} className={styles.printRow}>
            <span className={styles.printLabel}>{f.label}</span>
            <span className={styles.printValue}>{f.value}</span>
          </div>
        ))}
      </div>

      <div className={styles.footerBtns}>
        <button type="button" className={`${shared.btn} ${shared.btnPrimary}`} onClick={handlePrint}>
          IN PHIẾU
        </button>
        <button type="button" className={`${shared.btn} ${styles.btnWarning}`} onClick={onClose}>
          ĐÓNG
        </button>
      </div>
    </ModalShell>
  );
}

export default PrintPreviewModal;
