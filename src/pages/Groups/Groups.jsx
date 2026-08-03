import { useMemo, useState } from "react";
import { Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import GroupFormModal from "./components/GroupFormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import Toast from "../FrontDesk/components/Toast";
import StatCard from "../FrontDesk/components/StatCard";
import WarehousePagination from "../Warehouse/components/WarehousePagination";
import { paginate } from "../../utils/pagination";
import { createIdSequence } from "../../utils/id";
import { formatDMY } from "../../utils/format";
import { GROUPS } from "../../data/groupData";
import { GUESTS } from "../../data/guestData";
import styles from "./Groups.module.css";

const nextNewId = createIdSequence();

function Groups() {
  const [groups, setGroups] = useState(GROUPS);
  const [nameQuery, setNameQuery] = useState("");
  const [leaderQuery, setLeaderQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formTarget, setFormTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const guestById = useMemo(() => Object.fromEntries(GUESTS.map((g) => [g.id, g])), []);

  const stats = useMemo(() => {
    const uniqueGuests = new Set(groups.flatMap((g) => g.memberGuestIds));
    const largest = groups.reduce((max, g) => Math.max(max, g.memberGuestIds.length), 0);
    return { groupCount: groups.length, guestCount: uniqueGuests.size, largest };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    const leaderQ = leaderQuery.trim().toLowerCase();
    return groups.filter((g) => {
      if (q && !g.name.toLowerCase().includes(q)) return false;
      if (leaderQ && !(guestById[g.leaderGuestId]?.name || "").toLowerCase().includes(leaderQ)) return false;
      return true;
    });
  }, [groups, nameQuery, leaderQuery, guestById]);

  function handleClearFilters() {
    setNameQuery("");
    setLeaderQuery("");
    setPage(1);
  }

  const pagedGroups = useMemo(() => paginate(filteredGroups, page, pageSize), [filteredGroups, page, pageSize]);

  function handleSaveGroup(form) {
    if (form.id) {
      setGroups((prev) => prev.map((g) => (g.id === form.id ? { ...g, ...form } : g)));
      setToastMsg("Đã cập nhật thông tin đoàn");
    } else {
      setGroups((prev) => [...prev, { ...form, id: nextNewId("group-new"), createdDate: new Date() }]);
      setToastMsg("Đã thêm đoàn mới");
    }
    setFormTarget(null);
  }

  function handleDeleteConfirmed() {
    setGroups((prev) => prev.filter((g) => g.id !== deleteTarget.id));
    setToastMsg(`Đã xoá đoàn "${deleteTarget.name}"`);
    setDeleteTarget(null);
  }

  return (
    <div className={styles.tabPanel}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Danh sách đoàn</h1>
          <p className={styles.subtitle}>
            Quản lý các đoàn khách (khách đoàn). Một khách có thể vừa là người đại diện của đoàn này, vừa là
            thành viên đoàn khác, và vẫn có thể lưu trú một mình như khách lẻ.
          </p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={() => setFormTarget({})}>
          <Plus size={16} /> Thêm đoàn
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statAccent}>
          <StatCard label="Tổng số đoàn" value={stats.groupCount} hint="đoàn" />
        </div>
        <div className={styles.statAccent}>
          <StatCard label="Khách thuộc đoàn" value={stats.guestCount} hint="khách" />
        </div>
        <div className={styles.statAccent}>
          <StatCard label="Đoàn đông nhất" value={stats.largest} hint="thành viên" />
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterHeadRow}>
          <span className={styles.filterHeadLabel}>
            <SlidersHorizontal size={14} /> Bộ lọc
          </span>
          <button type="button" className={styles.clearBtn} onClick={handleClearFilters}>
            Xoá lọc
          </button>
        </div>

        <div className={styles.filterFieldsRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Tên đoàn</span>
            <input
              className={styles.textBox}
              placeholder="Tìm theo tên đoàn..."
              value={nameQuery}
              onChange={(e) => {
                setNameQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Người đại diện</span>
            <input
              className={styles.textBox}
              placeholder="Tìm theo tên người đại diện..."
              value={leaderQuery}
              onChange={(e) => {
                setLeaderQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên đoàn</th>
                <th>Người đại diện</th>
                <th>Số thành viên</th>
                <th>Ngày tạo</th>
                <th>Ghi chú</th>
                <th className={styles.thActionCell} />
              </tr>
            </thead>
            <tbody>
              {pagedGroups.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={6}>
                    <EmptyState message="Chưa có đoàn nào" hint="Nhấn Thêm đoàn để tạo đoàn khách đầu tiên." />
                  </td>
                </tr>
              ) : (
                pagedGroups.map((g) => (
                  <tr key={g.id} onClick={() => setFormTarget(g)}>
                    <td className={styles.groupNameCell}>{g.name}</td>
                    <td>{guestById[g.leaderGuestId]?.name || <span className={styles.mutedCell}>—</span>}</td>
                    <td className={styles.numCell}>{g.memberGuestIds.length}</td>
                    <td>{g.createdDate ? formatDMY(g.createdDate) : <span className={styles.mutedCell}>—</span>}</td>
                    <td className={styles.noteCell} title={g.note}>
                      {g.note || <span className={styles.mutedCell}>—</span>}
                    </td>
                    <td className={styles.thActionCell}>
                      <button
                        type="button"
                        className={styles.trashBtn}
                        title="Xoá đoàn"
                        aria-label="Xoá đoàn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(g);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <WarehousePagination
          page={page}
          pageSize={pageSize}
          total={filteredGroups.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {formTarget && (
        <GroupFormModal
          group={formTarget.id ? formTarget : null}
          onClose={() => setFormTarget(null)}
          onSave={handleSaveGroup}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xoá đoàn"
          message={`Xoá đoàn "${deleteTarget.name}" khỏi danh sách? Các khách trong đoàn vẫn được giữ nguyên trong Danh sách khách.`}
          confirmLabel="Xoá"
          danger
          onConfirm={handleDeleteConfirmed}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default Groups;
