import ModalShell from "../../FrontDesk/modals/ModalShell";
import shared from "../../FrontDesk/modals/shared.module.css";
import { formatDMY, formatCurrency } from "../../../utils/format";
import tableStyles from "../Warehouse.module.css";
import styles from "./WarehouseModal.module.css";

function StockDetailModal({ kho, material, fromDate, toDate, onClose, onToast }) {
  return (
    <ModalShell title="Chi tiết nhập - xuất - tồn kho" onClose={onClose} tone="brand" width={1400}>
      <p className={styles.contextLine}>
        Kho: {kho}, NVL: {material.material}, Từ ngày {formatDMY(fromDate)} Đến ngày {formatDMY(toDate)}
      </p>

      <div className={tableStyles.tableWrap}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Loại chứng từ</th>
              <th>Ngày chứng từ</th>
              <th>Số chứng từ</th>
              <th>Diễn giải</th>
              <th>Đơn vị</th>
              <th className={tableStyles.numCell}>Số lượng nhập</th>
              <th className={tableStyles.numCell}>Giá trị nhập</th>
              <th className={tableStyles.numCell}>Số lượng xuất</th>
              <th className={tableStyles.numCell}>Giá trị xuất</th>
              <th className={tableStyles.numCell}>Số lượng tồn</th>
              <th className={tableStyles.numCell}>Giá trị tồn</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Số dư đầu kỳ</strong>
              </td>
              <td />
              <td />
              <td />
              <td>{material.unit}</td>
              <td />
              <td />
              <td />
              <td />
              <td className={tableStyles.numCell}>{material.opening}</td>
              <td className={tableStyles.numCell}>{formatCurrency(0)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className={tableStyles.totalRow}>
              <td colSpan={5}>Tổng</td>
              <td className={tableStyles.numCell}>{material.imported}</td>
              <td className={tableStyles.numCell}>{formatCurrency(0)}</td>
              <td className={tableStyles.numCell}>{material.exported}</td>
              <td className={tableStyles.numCell}>{formatCurrency(0)}</td>
              <td className={tableStyles.numCell}>{material.closing}</td>
              <td className={tableStyles.numCell}>{formatCurrency(0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={styles.footerBtns}>
        <button
          type="button"
          className={`${shared.btn} ${shared.btnPrimary}`}
          onClick={() => onToast("Chức năng đang được phát triển")}
        >
          XUẤT EXCEL
        </button>
        <button type="button" className={`${shared.btn} ${styles.btnWarning}`} onClick={onClose}>
          BỎ QUA
        </button>
      </div>
    </ModalShell>
  );
}

export default StockDetailModal;
