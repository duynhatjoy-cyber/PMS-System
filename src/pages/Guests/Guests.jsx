import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Columns3, ListFilter, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import GuestFormModal from "./components/GuestFormModal";
import TierBadge from "./components/TierBadge";
import FieldPickerPopover from "./components/FieldPickerPopover";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import Toast from "../FrontDesk/components/Toast";
import StatCard from "../FrontDesk/components/StatCard";
import DateRangePicker from "../Revenue/components/DateRangePicker";
import WarehousePagination from "../Warehouse/components/WarehousePagination";
import { paginate } from "../../utils/pagination";
import { createIdSequence } from "../../utils/id";
import { addMonths, formatDMY, startOfDay } from "../../utils/format";
import { GUESTS, GUEST_TIERS, NATIONALITIES } from "../../data/guestData";
import { getGuestGroups, isGroupGuest } from "../../data/groupData";
import styles from "./Guests.module.css";

const nextNewId = createIdSequence();

const TIER_VALUE_CLASS = {
  new: "tierValueNew",
  silver: "tierValueSilver",
  gold: "tierValueGold",
  platinum: "tierValuePlatinum",
  diamond: "tierValueDiamond",
};

const EMPTY_FILTERS = {
  name: "",
  phone: "",
  idQuery: "",
  nationality: "",
  tierId: "",
  guestKind: "",
  gender: "",
  email: "",
  address: "",
  note: "",
};

const Muted = ({ children = "—" }) => <span className={styles.mutedCell}>{children}</span>;

function formatDobDMY(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function GuestKindBadge({ guestId }) {
  const groups = getGuestGroups(guestId);
  if (groups.length === 0) return <span className={styles.individualBadge}>Khách lẻ</span>;
  return (
    <span className={styles.groupBadge} title={groups.map((g) => g.name).join(", ")}>
      Khách đoàn{groups.length > 1 ? ` (${groups.length})` : ""}
    </span>
  );
}

// Cột cố định luôn hiện: Tên khách, Hạng. Danh sách dưới đây là các cột có
// thể bật/tắt qua "Cột hiển thị" — thứ tự ở đây quyết định thứ tự cột trên
// bảng, không phụ thuộc thứ tự người dùng tick trong popover.
const OPTIONAL_COLUMNS = [
  { key: "phone", label: "SĐT", defaultVisible: true, render: (g) => g.phone || <Muted /> },
  { key: "email", label: "Email", defaultVisible: true, render: (g) => g.email || <Muted /> },
  { key: "idNumber", label: "CMND/Hộ chiếu", defaultVisible: true, render: (g) => g.idNumber || g.passport || <Muted /> },
  { key: "nationality", label: "Quốc tịch", defaultVisible: true, render: (g) => g.nationality },
  { key: "guestKind", label: "Loại khách", defaultVisible: true, render: (g) => <GuestKindBadge guestId={g.id} /> },
  { key: "stayCount", label: "Số lần lưu trú", defaultVisible: true, numeric: true, render: (g) => g.stayCount },
  {
    key: "lastStayDate",
    label: "Lần gần nhất",
    defaultVisible: true,
    render: (g) => (g.lastStayDate ? formatDMY(g.lastStayDate) : <Muted />),
  },
  { key: "dob", label: "Ngày sinh", defaultVisible: false, render: (g) => formatDobDMY(g.dob) || <Muted /> },
  { key: "gender", label: "Giới tính", defaultVisible: false, render: (g) => (g.gender === "male" ? "Nam" : "Nữ") },
  { key: "address", label: "Địa chỉ", defaultVisible: false, render: (g) => g.address || <Muted /> },
  { key: "note", label: "Ghi chú", defaultVisible: false, render: (g) => g.note || <Muted /> },
  { key: "createdAt", label: "Ngày tạo", defaultVisible: false, render: (g) => formatDMY(g.createdAt) },
];

const DEFAULT_VISIBLE_KEYS = OPTIONAL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

// Ô lọc cố định luôn hiện: Tên khách. 6 ô đầu bật sẵn theo mặc định (giữ đúng
// giao diện hiện tại); 6 ô sau (theo đúng danh sách "Thông tin khách" tham
// khảo) ẩn theo mặc định, bật qua "Thêm bộ lọc" khi cần — đúng tinh thần
// "thêm" thay vì hiện sẵn hết rồi mới ẩn bớt.
const FILTER_FIELD_DEFS = [
  { key: "dateRange", label: "Lưu trú gần nhất" },
  { key: "phone", label: "SĐT" },
  { key: "idQuery", label: "CMND/Hộ chiếu" },
  { key: "nationality", label: "Quốc tịch" },
  { key: "tierId", label: "Hạng khách" },
  { key: "guestKind", label: "Loại khách" },
  { key: "dob", label: "Ngày sinh" },
  { key: "gender", label: "Giới tính" },
  { key: "email", label: "Email" },
  { key: "address", label: "Địa chỉ" },
  { key: "note", label: "Ghi chú" },
  { key: "createdAt", label: "Ngày tạo" },
];

const DEFAULT_VISIBLE_FILTER_KEYS = ["dateRange", "phone", "idQuery", "nationality", "tierId", "guestKind"];

// "Ngày sinh"/"Ngày tạo" lưu khác kiểu nhau (dob là chuỗi "yyyy-mm-dd" từ
// input date; createdAt là Date thật) nên cần 2 hàm so khoảng riêng — nhưng
// vì chuỗi ISO yyyy-mm-dd so sánh chuỗi cho kết quả đúng như so ngày, không
// cần parse Date rồi lại lo lệch múi giờ.
function toISODateStr(date) {
  const pad2 = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function matchesDateRange(value, start, end) {
  if (!value) return true;
  const d = startOfDay(value);
  return d >= startOfDay(start) && d <= startOfDay(end);
}

function matchesDobRange(dob, start, end) {
  if (!dob) return true;
  return dob >= toISODateStr(start) && dob <= toISODateStr(end);
}

function Guests() {
  const [guests, setGuests] = useState(GUESTS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const today = useMemo(() => new Date(), []);
  const [dateRange, setDateRange] = useState(() => ({ start: addMonths(today, -12), end: today }));
  const [dobRange, setDobRange] = useState(() => ({ start: addMonths(today, -1200), end: today }));
  const [createdAtRange, setCreatedAtRange] = useState(() => ({ start: addMonths(today, -120), end: today }));
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE_KEYS);
  const [visibleFilters, setVisibleFilters] = useState(DEFAULT_VISIBLE_FILTER_KEYS);
  const [formTarget, setFormTarget] = useState(null); // null closed, {} = new, guest object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const activeColumns = useMemo(() => OPTIONAL_COLUMNS.filter((c) => visibleCols.includes(c.key)), [visibleCols]);

  function patchFilter(fields) {
    setFilters((prev) => ({ ...prev, ...fields }));
    setPage(1);
  }

  const tierCounts = useMemo(() => {
    const counts = Object.fromEntries(GUEST_TIERS.map((t) => [t.id, 0]));
    guests.forEach((g) => {
      const tier = GUEST_TIERS.reduce((acc, t) => (g.stayCount >= t.minStays ? t : acc), GUEST_TIERS[0]);
      counts[tier.id] += 1;
    });
    return counts;
  }, [guests]);

  const filteredGuests = useMemo(() => {
    const name = filters.name.trim().toLowerCase();
    const phone = filters.phone.trim().toLowerCase();
    const idQuery = filters.idQuery.trim().toLowerCase();

    const rows = guests.filter((g) => {
      if (name && !g.name.toLowerCase().includes(name)) return false;
      if (phone && !g.phone.toLowerCase().includes(phone)) return false;
      if (idQuery) {
        const hitId = g.idNumber?.toLowerCase().includes(idQuery);
        const hitPassport = g.passport?.toLowerCase().includes(idQuery);
        if (!hitId && !hitPassport) return false;
      }
      if (filters.nationality && g.nationality !== filters.nationality) return false;
      if (filters.tierId) {
        const tier = GUEST_TIERS.reduce((acc, t) => (g.stayCount >= t.minStays ? t : acc), GUEST_TIERS[0]);
        if (tier.id !== filters.tierId) return false;
      }
      if (filters.guestKind) {
        const belongsToGroup = isGroupGuest(g.id);
        if (filters.guestKind === "group" && !belongsToGroup) return false;
        if (filters.guestKind === "individual" && belongsToGroup) return false;
      }
      if (filters.gender && g.gender !== filters.gender) return false;
      if (filters.email && !g.email.toLowerCase().includes(filters.email.toLowerCase())) return false;
      if (filters.address && !g.address.toLowerCase().includes(filters.address.toLowerCase())) return false;
      if (filters.note && !g.note.toLowerCase().includes(filters.note.toLowerCase())) return false;
      if (!matchesDateRange(g.lastStayDate, dateRange.start, dateRange.end)) return false;
      if (!matchesDobRange(g.dob, dobRange.start, dobRange.end)) return false;
      if (!matchesDateRange(g.createdAt, createdAtRange.start, createdAtRange.end)) return false;
      return true;
    });

    rows.sort((a, b) => a.name.localeCompare(b.name, "vi") * (sortDir === "asc" ? 1 : -1));
    return rows;
  }, [guests, filters, dateRange, dobRange, createdAtRange, sortDir]);

  const pagedGuests = useMemo(() => paginate(filteredGuests, page, pageSize), [filteredGuests, page, pageSize]);

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS);
    setDateRange({ start: addMonths(today, -12), end: today });
    setDobRange({ start: addMonths(today, -1200), end: today });
    setCreatedAtRange({ start: addMonths(today, -120), end: today });
    setPage(1);
  }

  // Các ô lọc dạng khoảng ngày (dateRange/dobRange/createdAtRange) không sống
  // trong `filters`, nên xoá riêng; còn lại đều là field phẳng trong `filters`
  // nên xoá chung bằng cách gán rỗng.
  const RANGE_FILTER_RESETTERS = {
    dateRange: () => setDateRange({ start: addMonths(today, -12), end: today }),
    dob: () => setDobRange({ start: addMonths(today, -1200), end: today }),
    createdAt: () => setCreatedAtRange({ start: addMonths(today, -120), end: today }),
  };

  // Ẩn một ô lọc thì giá trị đang lọc theo ô đó cũng phải reset — nếu không,
  // một bộ lọc không còn hiển thị vẫn âm thầm thu hẹp kết quả, người dùng
  // không biết vì sao danh sách bị thiếu.
  function handleApplyVisibleFilters(nextVisible) {
    const removed = visibleFilters.filter((key) => !nextVisible.includes(key));
    const clearedFields = removed.filter((key) => !RANGE_FILTER_RESETTERS[key]);
    removed.filter((key) => RANGE_FILTER_RESETTERS[key]).forEach((key) => RANGE_FILTER_RESETTERS[key]());
    if (clearedFields.length > 0) {
      setFilters((prev) => ({ ...prev, ...Object.fromEntries(clearedFields.map((key) => [key, ""])) }));
    }
    setVisibleFilters(nextVisible);
    setPage(1);
  }

  function handleSaveGuest(form) {
    if (form.id) {
      setGuests((prev) => prev.map((g) => (g.id === form.id ? { ...g, ...form } : g)));
      setToastMsg("Đã cập nhật thông tin khách");
    } else {
      setGuests((prev) => [...prev, { ...form, id: nextNewId("guest-new") }]);
      setToastMsg("Đã thêm khách mới");
    }
    setFormTarget(null);
  }

  function handleDeleteConfirmed() {
    setGuests((prev) => prev.filter((g) => g.id !== deleteTarget.id));
    setToastMsg(`Đã xoá khách "${deleteTarget.name}"`);
    setDeleteTarget(null);
  }

  return (
    <div className={styles.tabPanel}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Danh sách khách</h1>
          <p className={styles.subtitle}>
            Quản lý khách đã/sắp lưu trú tại khách sạn. Hạng khách được tính tự động theo số lần lưu trú.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.primaryBtn} onClick={() => setFormTarget({})}>
            <Plus size={16} /> Thêm khách
          </button>
        </div>
      </div>

      <div className={styles.statsRow}>
        {[...GUEST_TIERS].reverse().map((tier) => (
          <div key={tier.id} className={styles.statAccent} style={{ borderTopColor: tier.color }}>
            <StatCard
              label={tier.label}
              value={tierCounts[tier.id]}
              valueClassName={styles[TIER_VALUE_CLASS[tier.id]]}
              hint="khách"
            />
          </div>
        ))}
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterHeadRow}>
          <span className={styles.filterHeadLabel}>
            <SlidersHorizontal size={14} /> Bộ lọc
          </span>
          <div className={styles.filterActions}>
            <button type="button" className={styles.clearBtn} onClick={handleClearFilters}>
              Xoá lọc
            </button>
            <FieldPickerPopover
              triggerLabel="Thêm bộ lọc"
              triggerIcon={ListFilter}
              pinnedLabels={["Tên khách"]}
              options={FILTER_FIELD_DEFS}
              visible={visibleFilters}
              defaultVisible={DEFAULT_VISIBLE_FILTER_KEYS}
              onApply={handleApplyVisibleFilters}
            />
            <FieldPickerPopover
              triggerLabel="Cột hiển thị"
              triggerIcon={Columns3}
              pinnedLabels={["Tên khách", "Hạng"]}
              options={OPTIONAL_COLUMNS}
              visible={visibleCols}
              defaultVisible={DEFAULT_VISIBLE_KEYS}
              onApply={setVisibleCols}
            />
          </div>
        </div>

        <div className={styles.filterFieldsRow}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Tên khách</span>
          <input
            className={styles.textBox}
            placeholder="Tìm theo tên..."
            value={filters.name}
            onChange={(e) => patchFilter({ name: e.target.value })}
          />
        </div>
        {visibleFilters.includes("dateRange") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Lưu trú gần nhất</span>
            <DateRangePicker
              start={dateRange.start}
              end={dateRange.end}
              months={1}
              onChange={(start, end) => {
                setDateRange({ start, end });
                setPage(1);
              }}
            />
          </div>
        )}
        {visibleFilters.includes("phone") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>SĐT</span>
            <input
              className={styles.textBox}
              placeholder="Số điện thoại"
              value={filters.phone}
              onChange={(e) => patchFilter({ phone: e.target.value })}
            />
          </div>
        )}
        {visibleFilters.includes("idQuery") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>CMND/Hộ chiếu</span>
            <input
              className={styles.textBox}
              value={filters.idQuery}
              onChange={(e) => patchFilter({ idQuery: e.target.value })}
            />
          </div>
        )}
        {visibleFilters.includes("nationality") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Quốc tịch</span>
            <select
              className={styles.selectBox}
              value={filters.nationality}
              onChange={(e) => patchFilter({ nationality: e.target.value })}
            >
              <option value="">Tất cả</option>
              {NATIONALITIES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}
        {visibleFilters.includes("tierId") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Hạng khách</span>
            <select
              className={styles.selectBox}
              value={filters.tierId}
              onChange={(e) => patchFilter({ tierId: e.target.value })}
            >
              <option value="">Tất cả</option>
              {GUEST_TIERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}
        {visibleFilters.includes("guestKind") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Loại khách</span>
            <select
              className={styles.selectBox}
              value={filters.guestKind}
              onChange={(e) => patchFilter({ guestKind: e.target.value })}
            >
              <option value="">Tất cả</option>
              <option value="individual">Khách lẻ</option>
              <option value="group">Khách đoàn</option>
            </select>
          </div>
        )}
        {visibleFilters.includes("dob") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Ngày sinh</span>
            <DateRangePicker
              start={dobRange.start}
              end={dobRange.end}
              months={1}
              onChange={(start, end) => {
                setDobRange({ start, end });
                setPage(1);
              }}
            />
          </div>
        )}
        {visibleFilters.includes("gender") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Giới tính</span>
            <select
              className={styles.selectBox}
              value={filters.gender}
              onChange={(e) => patchFilter({ gender: e.target.value })}
            >
              <option value="">Tất cả</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>
        )}
        {visibleFilters.includes("email") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <input
              className={styles.textBox}
              value={filters.email}
              onChange={(e) => patchFilter({ email: e.target.value })}
            />
          </div>
        )}
        {visibleFilters.includes("address") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Địa chỉ</span>
            <input
              className={styles.textBox}
              value={filters.address}
              onChange={(e) => patchFilter({ address: e.target.value })}
            />
          </div>
        )}
        {visibleFilters.includes("note") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Ghi chú</span>
            <input
              className={styles.textBox}
              value={filters.note}
              onChange={(e) => patchFilter({ note: e.target.value })}
            />
          </div>
        )}
        {visibleFilters.includes("createdAt") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Ngày tạo</span>
            <DateRangePicker
              start={createdAtRange.start}
              end={createdAtRange.end}
              months={1}
              onChange={(start, end) => {
                setCreatedAtRange({ start, end });
                setPage(1);
              }}
            />
          </div>
        )}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th
                  className={styles.thSortable}
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                >
                  <span className={styles.thLabel}>
                    Tên khách {sortDir === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                  </span>
                </th>
                <th>Hạng</th>
                {activeColumns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th className={styles.thActionCell} />
              </tr>
            </thead>
            <tbody>
              {pagedGuests.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={activeColumns.length + 3}>
                    <EmptyState
                      message="Không tìm thấy khách phù hợp"
                      hint="Thử điều chỉnh bộ lọc hoặc nhấn Xoá lọc để xem toàn bộ danh sách."
                    />
                  </td>
                </tr>
              ) : (
                pagedGuests.map((g) => (
                  <tr key={g.id} onClick={() => setFormTarget(g)}>
                    <td className={styles.guestNameCell}>{g.name}</td>
                    <td>
                      <TierBadge stayCount={g.stayCount} />
                    </td>
                    {activeColumns.map((col) => (
                      <td key={col.key} className={col.numeric ? styles.numCell : undefined}>
                        {col.render(g)}
                      </td>
                    ))}
                    <td className={styles.thActionCell}>
                      <button
                        type="button"
                        className={styles.trashBtn}
                        title="Xoá khách"
                        aria-label="Xoá khách"
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
          total={filteredGuests.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {formTarget && (
        <GuestFormModal
          guest={formTarget.id ? formTarget : null}
          onClose={() => setFormTarget(null)}
          onSave={handleSaveGuest}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Xoá khách"
          message={`Xoá khách "${deleteTarget.name}" khỏi danh sách? Hành động này không thể hoàn tác.`}
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

export default Guests;
