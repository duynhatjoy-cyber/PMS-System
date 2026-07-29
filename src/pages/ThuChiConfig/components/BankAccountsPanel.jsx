import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { BANK_ACCOUNTS } from "../../../data/thuChiConfigData";

let draftSeq = 0;
function nextId() {
  draftSeq += 1;
  return `bank-draft-${draftSeq}`;
}

function emptyDraft() {
  return { accountNumber: "", bankName: "", branch: "" };
}

function BankAccountsPanel({ styles, onToast }) {
  const [accounts, setAccounts] = useState(BANK_ACCOUNTS);
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  function patchDraft(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  }

  function handleAdd() {
    const missing = {
      accountNumber: !draft.accountNumber.trim(),
      bankName: !draft.bankName.trim(),
      branch: !draft.branch.trim(),
    };
    if (missing.accountNumber || missing.bankName || missing.branch) {
      setErrors(missing);
      return;
    }
    setAccounts((prev) => [...prev, { id: nextId(), ...draft }]);
    setDraft(emptyDraft());
    setErrors({});
    onToast("Đã thêm tài khoản ngân hàng");
  }

  function handleConfirmDelete() {
    setAccounts((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    onToast(`Đã xoá tài khoản ${deleteTarget.accountNumber}`);
    setDeleteTarget(null);
  }

  return (
    <div className={styles.main}>
      <div className={styles.bankTableCard}>
        <table className={styles.bankTable}>
          <thead>
            <tr>
              <th>Số tài khoản</th>
              <th>Tên ngân hàng</th>
              <th>Chi nhánh</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    message="Chưa có tài khoản ngân hàng nào"
                    hint="Điền thông tin bên dưới và nhấn Lưu để thêm tài khoản đầu tiên."
                  />
                </td>
              </tr>
            ) : (
              accounts.map((a) => (
                <tr key={a.id}>
                  <td>{a.accountNumber}</td>
                  <td>{a.bankName}</td>
                  <td>{a.branch}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.rowDeleteBtn}
                      title="Xoá tài khoản"
                      onClick={() => setDeleteTarget(a)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}

            <tr className={styles.addRow}>
              <td>
                <input
                  className={`${styles.fieldInput} ${errors.accountNumber ? styles.fieldInputError : ""}`}
                  placeholder="Số tài khoản"
                  value={draft.accountNumber}
                  onChange={(e) => patchDraft("accountNumber", e.target.value)}
                />
              </td>
              <td>
                <input
                  className={`${styles.fieldInput} ${errors.bankName ? styles.fieldInputError : ""}`}
                  placeholder="Tên ngân hàng"
                  value={draft.bankName}
                  onChange={(e) => patchDraft("bankName", e.target.value)}
                />
              </td>
              <td>
                <input
                  className={`${styles.fieldInput} ${errors.branch ? styles.fieldInputError : ""}`}
                  placeholder="Chi nhánh"
                  value={draft.branch}
                  onChange={(e) => patchDraft("branch", e.target.value)}
                />
              </td>
              <td>
                <button type="button" className={styles.saveBtn} onClick={handleAdd}>
                  <Plus size={15} /> Lưu
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Xoá tài khoản ngân hàng"
          message={`Bạn có chắc chắn xoá tài khoản ${deleteTarget.accountNumber} (${deleteTarget.bankName})? Không thể hoàn tác.`}
          confirmLabel="Đồng ý"
          danger
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default BankAccountsPanel;
