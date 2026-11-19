import { useMemo, useState } from "react";
import { ChevronRight, Plus, RefreshCw, Users } from "lucide-react";
import GroupFormModal from "./components/GroupFormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import Toast from "../FrontDesk/components/Toast";
import WarehousePagination from "../Warehouse/components/WarehousePagination";
import { paginate } from "../../utils/pagination";
import { createIdSequence } from "../../utils/id";
import { GROUPS } from "../../data/groupData";
import { useBookings } from "../../context/BookingsContext";
import LodgingGroupDetail from "../FrontDesk/modals/LodgingGroupDetail";
import { toRoomMapDetailBooking } from "../../utils/roomMapBookingAdapter";
import styles from "./Groups.module.css";

const nextNewId = createIdSequence();

function Groups() {
  const { bookings, roomMapBookings, lodgingGroups } = useBookings();
  const allLodgingBookings = useMemo(
    () => [...bookings, ...roomMapBookings.map(toRoomMapDetailBooking)],
    [bookings, roomMapBookings]
  );
  const [openLodgingGroupId, setOpenLodgingGroupId] = useState(null);
  const [groups, setGroups] = useState(GROUPS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [formTarget, setFormTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  // Hợp nhất lodgingGroups vào danh sách groups
  const allGroups = useMemo(() => {
    const extraLodging = lodgingGroups.map((lg) => {
      const gBookings = allLodgingBookings.filter((b) => b.groupId === lg.id);
      const firstCheckIn = gBookings[0]?.checkIn
        ? new Date(gBookings[0].checkIn).toISOString().slice(0, 10)
        : "2026-11-18";
      const lastCheckOut = gBookings[0]?.checkOut
        ? new Date(gBookings[0].checkOut).toISOString().slice(0, 10)
        : "2026-11-20";
      return {
        id: lg.id,
        name: lg.name,
        company: lg.company || "",
        checkIn: firstCheckIn,
        checkOut: lastCheckOut,
        rooms: gBookings.length || 1,
        status: lg.status || "confirmed",
        isLodging: true,
      };
    });
    return [...groups, ...extraLodging];
  }, [groups, lodgingGroups, allLodgingBookings]);

  const filteredGroups = useMemo(() => {
    if (statusFilter === "all") return allGroups;
    return allGroups.filter((g) => g.status === statusFilter);
  }, [allGroups, statusFilter]);

  const pagedGroups = useMemo(
    () => paginate(filteredGroups, page, pageSize),
    [filteredGroups, page, pageSize]
  );

  function handleRefresh() {
    setStatusFilter("all");
    setPage(1);
    setToastMsg("Đã làm mới danh sách nhóm");
  }

  function handleSaveGroup(form) {
    if (form.id) {
      setGroups((prev) => prev.map((g) => (g.id === form.id ? { ...g, ...form } : g)));
      setToastMsg("Đã cập nhật thông tin nhóm");
    } else {
      setGroups((prev) => [
        {
          ...form,
          id: nextNewId("group-new"),
          checkIn: form.checkIn || new Date().toISOString().slice(0, 10),
          checkOut: form.checkOut || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          rooms: form.rooms || 1,
          status: form.status || "confirmed",
          createdDate: new Date(),
        },
        ...prev,
      ]);
      setToastMsg("Đã tạo nhóm mới thành công");
    }
    setFormTarget(null);
  }

  function handleDeleteConfirmed() {
    setGroups((prev) => prev.filter((g) => g.id !== deleteTarget.id));
    setToastMsg(`Đã xoá nhóm "${deleteTarget.name}"`);
    setDeleteTarget(null);
  }

  function handleRowClick(g) {
    if (g.isLodging) {
      setOpenLodgingGroupId(g.id);
    } else {
      setFormTarget(g);
    }
  }

  function renderStatusBadge(status) {
    if (status === "hold") {
      return <span className={`${styles.statusBadge} ${styles.statusHold}`}>Tạm giữ</span>;
    }
    if (status === "in_house") {
      return <span className={`${styles.statusBadge} ${styles.statusInHouse}`}>Đã nhận phòng</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.statusConfirmed}`}>Xác nhận</span>;
  }

  return (
    <div className={styles.tabPanel}>
      {/* Header đúng theo mẫu ảnh Nhóm & Allotment */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Nhóm & Allotment</h1>
          <p className={styles.subtitle}>Quản lý đặt phòng theo nhóm, tour, hội nghị.</p>
        </div>

        <div className={styles.headerActions}>
          <select
            className={styles.statusSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="confirmed">Xác nhận</option>
            <option value="hold">Tạm giữ</option>
            <option value="in_house">Đã nhận phòng</option>
          </select>

          <button
            type="button"
            className={styles.iconBtn}
            title="Làm mới"
            onClick={handleRefresh}
          >
            <RefreshCw size={15} />
          </button>

          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setFormTarget({ rooms: 2, status: "confirmed" })}
          >
            <Users size={15} /> Tạo phòng đoàn
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => setFormTarget({})}
          >
            <Plus size={16} /> Tạo nhóm
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu với đường viền rõ nét (các đường viền cần nhìn rõ hơn) */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên nhóm</th>
                <th>Công ty</th>
                <th>Ngày đến</th>
                <th>Ngày đi</th>
                <th>Phòng</th>
                <th>Trạng thái</th>
                <th className={styles.arrowCell} />
              </tr>
            </thead>
            <tbody>
              {pagedGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>
                    Không có nhóm nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                pagedGroups.map((g) => (
                  <tr key={g.id} onClick={() => handleRowClick(g)}>
                    <td className={styles.groupNameCell}>{g.name}</td>
                    <td className={styles.companyCell}>{g.company || "—"}</td>
                    <td className={styles.dateCell}>{g.checkIn || "—"}</td>
                    <td className={styles.dateCell}>{g.checkOut || "—"}</td>
                    <td className={styles.roomCountCell}>{g.rooms || 1}</td>
                    <td>{renderStatusBadge(g.status)}</td>
                    <td className={styles.arrowCell}>
                      <ChevronRight size={16} className={styles.chevronIcon} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredGroups.length > pageSize && (
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
        )}
      </div>

      {/* Modals & Dialogs */}
      {formTarget && (
        <GroupFormModal
          group={formTarget.id ? formTarget : null}
          onClose={() => setFormTarget(null)}
          onSave={handleSaveGroup}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xoá nhóm"
          message={`Xoá nhóm "${deleteTarget.name}" khỏi danh sách?`}
          confirmLabel="Xoá"
          danger
          onConfirm={handleDeleteConfirmed}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {openLodgingGroupId && (
        <LodgingGroupDetail
          group={lodgingGroups.find((group) => group.id === openLodgingGroupId)}
          bookings={allLodgingBookings}
          onClose={() => setOpenLodgingGroupId(null)}
        />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default Groups;
