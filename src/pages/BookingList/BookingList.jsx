import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  CloudDownload,
  Printer,
  Search,
  X,
} from "lucide-react";
import styles from "./BookingList.module.css";
import { useBookings } from "../../context/BookingsContext";

const NAV_ITEMS = [
  "Khách sẽ đến",
  "Khách đã đến",
  "Khách đang ở",
  "Khách sẽ đi",
  "Khách đã đi",
  "Đặt phòng tạo bởi mình",
  "Phòng chiếm dụng",
  "Booking OTA",
  "Danh sách đặt phòng",
  "Export Rev Data",
];

const STATUS_OPTIONS = ["Tất cả", "Đã đặt", "Nhận phòng", "Trả phòng", "Đã hủy"];

const FILTER_GROUPS = [
  { title: "Thông tin khách", fields: ["Tên khách", "Ngày sinh", "SĐT", "Email", "CMND", "Địa chỉ", "Quốc tịch", "Hộ chiếu"] },
  { title: "Thông tin đặt phòng", fields: ["Mã đặt phòng", "Mã OTA", "Nguồn", "Công ty", "Thị trường", "Trạng thái", "Loại giá hoa hồng"] },
  { title: "Thông tin phòng", fields: ["Đêm chiếm dụng", "Phòng", "Ngày đến", "Ngày đi", "SL người lớn", "SL trẻ em", "Người tạo", "Ngày tạo", "Người hủy", "Ngày hủy"] },
];

const COLUMN_GROUPS = [
  { title: "Thông tin khách", fields: ["Tên khách", "Ngày sinh", "Giới tính", "SĐT", "Email", "CMND", "Địa chỉ", "Ghi chú", "Hộ chiếu"] },
  { title: "Thông tin đặt phòng", fields: ["Mã đặt phòng", "Mã OTA", "Nguồn", "Công ty", "Thị trường"] },
  { title: "Thông tin phòng", fields: ["Số đêm", "Phòng", "Ngày đến", "Ngày đi", "SL người lớn", "SL trẻ em", "Loại giá", "Giá phòng", "Ghi chú", "Người tạo", "Ngày tạo", "Người hủy", "Ngày hủy", "Lý do hủy", "Hoa hồng", "Giá chưa hoa hồng", "Giá bao gồm hoa hồng"] },
];

const DEFAULT_FILTERS = ["Tên khách", "Mã đặt phòng", "Ngày đến", "Trạng thái"];
const DEFAULT_COLUMNS = ["Mã đặt phòng", "Phòng", "Tên khách", "Ngày đến", "Ngày đi", "Loại giá", "SL người lớn", "SL trẻ em", "Công ty", "Ghi chú"];
const CURRENT_USER = "Nha Cua My Admin";
const OTA_FILTERS = ["Mã đặt phòng", "Mã OTA", "Ngày đến", "Loại giá hoa hồng", "Công ty"];
const OTA_COLUMNS = ["Mã đặt phòng", "Mã OTA", "Công ty", "Tên khách", "Ngày đến", "Ngày đi", "NL/TE", "Giá chưa hoa hồng", "Hoa hồng", "Giá bao gồm hoa hồng"];
const EXPORT_FILTERS = ["Tên khách", "SĐT", "Email", "CMND", "Hộ chiếu", "Địa chỉ", "Quốc tịch", "Mã đặt phòng", "Mã OTA", "Phòng", "SL người lớn", "SL trẻ em", "Ngày sinh", "Ngày đến", "Ngày đi", "Đêm chiếm dụng", "Ngày tạo", "Ngày hủy", "Trạng thái", "Loại giá hoa hồng", "Công ty", "Nguồn", "Thị trường", "Người tạo", "Người hủy"];
const EXPORT_COLUMNS = ["Mã đặt phòng", "Phòng", "Tên khách", "Ngày đến", "Ngày đi", "Loại giá", "NL/TE", "Công ty", "Ghi chú", "SĐT", "Email", "Mã OTA", "Nguồn", "Thị trường", "Số đêm", "Giá phòng", "Ngày sinh", "Giới tính", "CMND", "Địa chỉ"];
const SELECT_FILTERS = new Set(["Loại giá hoa hồng", "Công ty", "Nguồn", "Thị trường", "Người tạo", "Người hủy"]);
const COMPACT_DATE_FILTERS = new Set(["Ngày sinh", "Ngày đi", "Đêm chiếm dụng", "Ngày tạo", "Ngày hủy"]);

const COLUMN_DEFS = [
  { key: "Mã đặt phòng", label: "#", width: 105, render: (row) => row.bookingCode },
  { key: "Mã OTA", width: 120, render: (row) => row.source === "OTA" ? `OTA-${row.bookingCode}` : "—" },
  { key: "Phòng", width: 125, align: "center", render: (row) => <span className={styles.room}>{row.room || "N/A"}<small>({row.roomType})</small></span> },
  { key: "Tên khách", width: 210, render: (row) => <><span className={styles.flag}>★</span> {row.guest.name}</> },
  { key: "Ngày sinh", width: 120, render: () => "—" },
  { key: "Giới tính", width: 95, render: () => "—" },
  { key: "SĐT", width: 125, render: () => "—" },
  { key: "Email", width: 180, render: () => "—" },
  { key: "CMND", width: 130, render: () => "—" },
  { key: "Địa chỉ", width: 190, render: () => "—" },
  { key: "Hộ chiếu", width: 130, render: () => "—" },
  { key: "Ngày đến", width: 155, align: "center", render: (row) => formatDateTime(row.checkIn) },
  { key: "Ngày đi", width: 155, align: "center", render: (row) => formatDateTime(row.checkOut) },
  { key: "Loại giá", width: 190, render: () => "Giá mặc định" },
  { key: "SL người lớn", label: "NL", width: 75, align: "center", render: (row) => row.adults },
  { key: "SL trẻ em", label: "TE", width: 75, align: "center", render: (row) => row.children },
  { key: "NL/TE", width: 85, align: "center", render: (row) => `${row.adults}/${row.children}` },
  { key: "Công ty", width: 190, render: (row) => row.source || "—" },
  { key: "Ghi chú", width: 270, render: (row) => row.notes || "—" },
  { key: "Nguồn", width: 125, render: (row) => row.source || "—" },
  { key: "Thị trường", width: 125, render: () => "Trực tiếp" },
  { key: "Số đêm", width: 90, align: "center", render: (row) => Math.max(1, Math.round((row.checkOut - row.checkIn) / 86400000)) },
  { key: "Giá phòng", width: 130, align: "right", render: () => "700.000đ" },
  { key: "Người tạo", width: 150, render: (row) => row.createdBy || "—" },
  { key: "Ngày tạo", width: 155, render: (row) => formatDateTime(row.checkIn) },
  { key: "Người hủy", width: 125, render: () => "—" },
  { key: "Ngày hủy", width: 155, render: () => "—" },
  { key: "Lý do hủy", width: 180, render: () => "—" },
  { key: "Hoa hồng", width: 120, align: "right", render: () => "0đ" },
  { key: "Giá chưa hoa hồng", width: 155, align: "right", render: () => "700.000đ" },
  { key: "Giá bao gồm hoa hồng", width: 175, align: "right", render: () => "700.000đ" },
];

function formatDateTime(value) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(value);
}

function SelectionPanel({ title, groups, selected, onToggle, onDefault, onCancel, onApply }) {
  return (
    <div className={styles.selectionPanel}>
      <div className={styles.panelHeading}><strong>{title}</strong><button type="button" onClick={onDefault}>Mặc định</button></div>
      <div className={styles.panelGroups}>
        {groups.map((group) => <div className={styles.panelGroup} key={group.title}>
          <h3>{group.title}</h3>
          {group.fields.map((field) => <label key={field}><input type="checkbox" checked={selected.includes(field)} onChange={() => onToggle(field)} /><span>{field}</span></label>)}
        </div>)}
      </div>
      <div className={styles.panelFooter}><button type="button" onClick={onCancel}>Hủy</button><button type="button" onClick={onApply}>Áp dụng</button></div>
    </div>
  );
}

function BookingList() {
  const { bookings, today } = useBookings();
  const [activeNav, setActiveNav] = useState("Danh sách đặt phòng");
  const [guest, setGuest] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [dateValues, setDateValues] = useState({});
  const [statuses, setStatuses] = useState(["Đã đặt"]);
  const [statusOpen, setStatusOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState(null);
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [draftColumns, setDraftColumns] = useState(DEFAULT_COLUMNS);
  const [applied, setApplied] = useState({ guest: "", bookingId: "", statuses: ["Đã đặt"], values: {}, dates: {} });

  const rows = useMemo(() => bookings.filter((booking) => {
    const now = new Date();
    const isToday = (date) => date >= today && date < new Date(today.getTime() + 86400000);
    const matchesSection = (() => {
      if (activeNav === "Khách sẽ đến") return booking.stage === "arrival" && booking.checkIn >= today;
      if (activeNav === "Khách đã đến") return booking.stage === "inhouse";
      if (activeNav === "Khách đang ở") return booking.stage === "inhouse" && booking.checkIn <= now && booking.checkOut >= now;
      if (activeNav === "Khách sẽ đi") return booking.stage === "inhouse" && isToday(booking.checkOut);
      if (activeNav === "Khách đã đi") return booking.stage === "checkedout" || booking.checkOut < today;
      if (activeNav === "Đặt phòng tạo bởi mình") return booking.createdBy === CURRENT_USER;
      if (activeNav === "Phòng chiếm dụng") return booking.stage === "inhouse" && Boolean(booking.room);
      if (activeNav === "Booking OTA") return booking.source === "OTA" || booking.source === "Traveloka" || booking.source === "Booking.com";
      return true;
    })();
    const guestMatch = !applied.guest || booking.guest.name.toLowerCase().includes(applied.guest.toLowerCase());
    const idMatch = !applied.bookingId || String(booking.bookingCode).includes(applied.bookingId);
    const bookingStatus = booking.stage === "inhouse" ? "Nhận phòng" : "Đã đặt";
    const statusMatch = activeNav !== "Danh sách đặt phòng" || applied.statuses.includes("Tất cả") || applied.statuses.includes(bookingStatus);
    const roomMatch = !applied.values.Phòng || (booking.room || "N/A").toLowerCase().includes(applied.values.Phòng.toLowerCase());
    const sourceMatch = !applied.values.Nguồn || (booking.source || "").toLowerCase().includes(applied.values.Nguồn.toLowerCase());
    const companyMatch = !applied.values["Công ty"] || (booking.source || "").toLowerCase().includes(applied.values["Công ty"].toLowerCase());
    const dateMatch = Object.entries(applied.dates || {}).every(([field, range]) => {
      if (!range?.from && !range?.to) return true;
      const bookingDate = field === "Ngày đi" || field === "Ngày hủy" ? booking.checkOut : booking.checkIn;
      const from = range.from ? new Date(range.from) : null;
      const to = range.to ? new Date(range.to) : null;
      return (!from || bookingDate >= from) && (!to || bookingDate <= to);
    });
    return matchesSection && guestMatch && idMatch && statusMatch && roomMatch && sourceMatch && companyMatch && dateMatch;
  }), [activeNav, applied, bookings, today]);

  const columns = visibleColumns.map((key) => {
    const definition = COLUMN_DEFS.find((column) => column.key === key);
    return definition ? { ...definition, label: definition.label || definition.key } : {
      key,
      label: key,
      width: 140,
      render: () => "—",
    };
  });
  const tableWidth = columns.reduce((total, column) => total + (column.width || 140), 0);

  function toggleItem(setter, item) {
    setter((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }

  function renderFilter(field) {
    if (field === "Tên khách") return <input key={field} value={guest} onChange={(event) => setGuest(event.target.value)} placeholder={field} />;
    if (field === "Mã đặt phòng") return <input key={field} value={bookingId} onChange={(event) => setBookingId(event.target.value)} placeholder={field} />;
    if (field === "Ngày đến") return (
      <div className={styles.dateRange} key={field}>
        <CalendarDays size={16} />
        <input aria-label={`${field} từ`} type="datetime-local" value={dateValues[field]?.from || ""} onChange={(event) => setDateValues((current) => ({ ...current, [field]: { ...current[field], from: event.target.value } }))} />
        {dateValues[field]?.from && <button type="button" aria-label="Xóa ngày bắt đầu" onClick={() => setDateValues((current) => ({ ...current, [field]: { ...current[field], from: "" } }))}><X size={14} /></button>}
        <span className={styles.arrow}>→</span>
        <CalendarDays size={16} />
        <input aria-label={`${field} đến`} type="datetime-local" value={dateValues[field]?.to || ""} onChange={(event) => setDateValues((current) => ({ ...current, [field]: { ...current[field], to: event.target.value } }))} />
        {dateValues[field]?.to && <button type="button" aria-label="Xóa ngày kết thúc" onClick={() => setDateValues((current) => ({ ...current, [field]: { ...current[field], to: "" } }))}><X size={14} /></button>}
      </div>
    );
    if (COMPACT_DATE_FILTERS.has(field)) return (
      <label className={styles.compactDate} key={field}><span>{field}</span><input type="date" value={dateValues[field]?.from || ""} onChange={(event) => setDateValues((current) => ({ ...current, [field]: { from: event.target.value, to: event.target.value ? `${event.target.value}T23:59` : "" } }))} /></label>
    );
    if (field === "Trạng thái") return (
      <div className={styles.statusWrap} key={field}>
        <button className={`${styles.statusButton} ${statusOpen ? styles.statusButtonOpen : ""}`} type="button" onClick={() => setStatusOpen((open) => !open)}>
          {statusLabel}<ChevronDown size={15} />
        </button>
        {statusOpen && (
          <div className={styles.statusMenu}>
            {STATUS_OPTIONS.map((status) => (
              <label key={status}><input type="checkbox" checked={statuses.includes(status)} onChange={() => toggleStatus(status)} /><span>{status}</span></label>
            ))}
          </div>
        )}
      </div>
    );
    if (SELECT_FILTERS.has(field)) return <button className={styles.selectFilter} type="button" key={field}>{field}: Tất cả <ChevronDown size={14} /></button>;
    return <input key={field} value={filterValues[field] || ""} onChange={(event) => setFilterValues((current) => ({ ...current, [field]: event.target.value }))} placeholder={field} />;
  }

  function selectNavigation(item) {
    setActiveNav(item);
    setOpenPanel(null);
    if (item === "Booking OTA") {
      setActiveFilters([...OTA_FILTERS]);
      setVisibleColumns([...OTA_COLUMNS]);
      setStatuses(["Tất cả"]);
    } else if (item === "Export Rev Data") {
      setActiveFilters([...EXPORT_FILTERS]);
      setVisibleColumns([...EXPORT_COLUMNS]);
      setStatuses(["Tất cả"]);
    } else {
      setActiveFilters([...DEFAULT_FILTERS]);
      setVisibleColumns([...DEFAULT_COLUMNS]);
    }
  }

  const subtitle = activeNav === "Booking OTA" ? "Danh sách booking OTA : OTA Booking List" : activeNav === "Export Rev Data" ? "" : "Danh sách đón khách hôm nay";
  const viewDefaultFilters = activeNav === "Booking OTA" ? OTA_FILTERS : activeNav === "Export Rev Data" ? EXPORT_FILTERS : DEFAULT_FILTERS;
  const viewDefaultColumns = activeNav === "Booking OTA" ? OTA_COLUMNS : activeNav === "Export Rev Data" ? EXPORT_COLUMNS : DEFAULT_COLUMNS;

  function toggleStatus(status) {
    if (status === "Tất cả") {
      setStatuses(["Tất cả"]);
      return;
    }
    setStatuses((current) => {
      const next = current.filter((item) => item !== "Tất cả");
      return next.includes(status) ? next.filter((item) => item !== status) : [...next, status];
    });
  }

  const statusLabel = statuses.includes("Tất cả")
    ? "Tất cả trạng thái"
    : statuses.length === 1
      ? `Trạng thái: ${statuses[0]}`
      : `Trạng thái (${statuses.length})`;

  return (
    <div className={styles.page}>
      <aside className={styles.localNav}>
        <button className={styles.backButton} type="button"><ArrowLeft size={17} /> Quay lại</button>
        <div className={styles.navTitle}>Mặc định</div>
        {NAV_ITEMS.map((item, index) => (
          <button
            type="button"
            key={item}
            className={`${styles.navItem} ${activeNav === item ? styles.navActive : ""} ${index === 8 ? styles.navDivider : ""}`}
            onClick={() => selectNavigation(item)}
          >
            {item}
          </button>
        ))}
      </aside>

      <section className={styles.workspace}>
        <div className={styles.headingRow}>
          <div className={styles.heading}><h1>{activeNav}</h1><ChevronDown size={16} />{subtitle && <span>{subtitle}</span>}</div>
          <div className={styles.topActions}>
            {activeNav === "Export Rev Data" && <button type="button">Cập nhật</button>}
            <button type="button">Lưu mẫu mới</button>
            <button type="button" aria-label="Tải xuống"><CloudDownload size={19} /></button>
            <button type="button" aria-label="In"><Printer size={19} /></button>
          </div>
        </div>

        <div className={styles.filters}>
          {activeFilters.map(renderFilter)}
          <button className={styles.moreFilter} type="button" onClick={() => { setDraftFilters(activeFilters); setOpenPanel("filters"); }}>Thêm bộ lọc <ChevronDown size={14} /></button>
          <button className={styles.searchButton} type="button" onClick={() => setApplied({ guest, bookingId, statuses: statuses.length ? statuses : ["Tất cả"], values: filterValues, dates: dateValues })}><Search size={16} /> Tìm kiếm</button>
        </div>

        {openPanel === "filters" && <SelectionPanel title="Danh sách bộ lọc" groups={FILTER_GROUPS} selected={draftFilters} onToggle={(field) => toggleItem(setDraftFilters, field)} onDefault={() => setDraftFilters([...viewDefaultFilters])} onCancel={() => setOpenPanel(null)} onApply={() => { setActiveFilters([...draftFilters]); setOpenPanel(null); }} />}
        {openPanel === "columns" && <SelectionPanel title="Danh sách cột hiển thị" groups={COLUMN_GROUPS} selected={draftColumns} onToggle={(field) => toggleItem(setDraftColumns, field)} onDefault={() => setDraftColumns([...viewDefaultColumns])} onCancel={() => setOpenPanel(null)} onApply={() => { setVisibleColumns([...draftColumns]); setOpenPanel(null); }} />}
        <div className={styles.tableTools}><button type="button" onClick={() => { setDraftColumns(visibleColumns); setOpenPanel("columns"); }}>Cột hiển thị <ChevronDown size={14} /></button></div>
        <div className={styles.tableScroll}>
          <table style={{ width: `${Math.max(tableWidth, 700)}px` }}>
            <colgroup>{columns.map((column) => <col key={column.key} style={{ width: `${column.width || 140}px` }} />)}</colgroup>
            <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}{column.key === "Mã đặt phòng" && <span> ↓</span>}</th>)}</tr></thead>
            <tbody>
              {rows.map((booking) => (
                <tr key={booking.id}>{columns.map((column) => <td key={column.key} className={column.key === "Ghi chú" ? styles.note : ""} style={{ textAlign: column.align || "left" }}>{column.render(booking)}</td>)}</tr>
              ))}
              {!rows.length && <tr><td className={styles.empty} colSpan={Math.max(columns.length, 1)}>Không tìm thấy đặt phòng phù hợp</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default BookingList;
