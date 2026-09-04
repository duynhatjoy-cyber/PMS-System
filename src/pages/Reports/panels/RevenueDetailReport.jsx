import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, CloudDownload, Printer, Search, SlidersHorizontal } from "lucide-react";
import DateRangePicker from "../../Revenue/components/DateRangePicker";
import FieldPickerPopover from "../../Guests/components/FieldPickerPopover";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import StatusBadge from "../../FrontDesk/components/StatusBadge";
import { useBookings } from "../../../context/BookingsContext";
import { paginate } from "../../../utils/pagination";
import { addDays, formatCurrency, formatDateTimeDMY } from "../../../utils/format";
import {
  GROUP_BY_OPTIONS,
  MARKET_OPTIONS,
  PHAN_HE,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  buildRevenueDetailRows,
  groupRows,
  sumRows,
} from "../data/revenueDetailData";
import styles from "./RevenueDetailReport.module.css";

const DATE_BASIS_OPTIONS = [
  { key: "checkout", label: "Ngày trả phòng" },
  { key: "daily", label: "Mỗi ngày" },
];

const COLUMN_DEFS = [
  { key: "Mã đặt phòng", width: 100, value: (r) => r.bookingCode },
  { key: "Loại phòng", width: 130, value: (r) => r.roomType },
  { key: "Tên phòng", width: 90, align: "center", value: (r) => r.room },
  { key: "Tên khách", width: 170, value: (r) => r.guestName },
  { key: "Ngày đến", width: 150, align: "center", value: (r) => formatDateTimeDMY(r.checkIn) },
  { key: "Ngày đi", width: 150, align: "center", value: (r) => formatDateTimeDMY(r.checkOut) },
  { key: "Tiền phòng", width: 120, align: "right", value: (r) => formatCurrency(r.roomAmount) },
  { key: "Dịch vụ", width: 100, align: "right", value: (r) => formatCurrency(r.serviceAmount) },
  { key: "Chiết khấu", width: 100, align: "right", value: (r) => formatCurrency(r.discount) },
  { key: "Tổng doanh thu", width: 140, align: "right", value: (r) => formatCurrency(r.totalRevenue), strong: true },
  { key: "Nợ trước", width: 100, align: "right", value: (r) => formatCurrency(r.priorDebt) },
  { key: "Tiền mặt", width: 110, align: "right", value: (r) => formatCurrency(r.cash) },
  { key: "Thẻ tín dụng", width: 110, align: "right", value: (r) => formatCurrency(r.card) },
  { key: "Chuyển khoản", width: 110, align: "right", value: (r) => formatCurrency(r.transfer) },
  { key: "Công nợ", width: 100, align: "right", value: (r) => formatCurrency(r.debt) },
  { key: "Còn thiếu", width: 100, align: "right", value: (r) => formatCurrency(r.outstanding) },
  { key: "Số đêm", width: 80, align: "center", value: (r) => r.nights },
  { key: "Giá trung bình", width: 120, align: "right", value: (r) => formatCurrency(r.avgRate) },
  { key: "Trạng thái", width: 120, align: "center", value: (r) => r.status.label },
  { key: "Nguồn", width: 100, value: (r) => r.source },
  { key: "Công ty", width: 160, value: (r) => r.company },
  { key: "Thị trường", width: 100, value: (r) => r.market },
  { key: "Người tạo", width: 150, value: (r) => r.createdBy },
  { key: "Mã OTA", width: 150, value: (r) => r.otaCode || "—" },
  { key: "Mã CMS", width: 190, value: (r) => r.cmsCode || "—" },
  { key: "Số hóa đơn", width: 100, value: (r) => r.invoiceNo },
  { key: "CMND", width: 130, value: (r) => r.idNumber || "—" },
  { key: "Email", width: 160, value: (r) => r.email || "—" },
  { key: "SĐT", width: 120, value: (r) => r.phone || "—" },
  { key: "Giá chưa hoa hồng", width: 150, align: "right", value: (r) => formatCurrency(r.netBeforeCommission) },
  { key: "Hoa hồng", width: 110, align: "right", value: (r) => formatCurrency(r.commission) },
  { key: "Giá bao gồm hoa hồng", width: 165, align: "right", value: (r) => formatCurrency(r.grossWithCommission) },
];

const DEFAULT_COLUMNS = COLUMN_DEFS.map((c) => c.key);

const TOTAL_FIELD_BY_COLUMN = {
  "Tiền phòng": "roomAmount",
  "Dịch vụ": "serviceAmount",
  "Chiết khấu": "discount",
  "Tổng doanh thu": "totalRevenue",
  "Nợ trước": "priorDebt",
  "Tiền mặt": "cash",
  "Thẻ tín dụng": "card",
  "Chuyển khoản": "transfer",
  "Công nợ": "debt",
  "Còn thiếu": "outstanding",
  "Số đêm": "nights",
  "Giá chưa hoa hồng": "netBeforeCommission",
  "Hoa hồng": "commission",
  "Giá bao gồm hoa hồng": "grossWithCommission",
};

const FILTER_FIELD_OPTIONS = [
  { key: "Trạng thái", label: "Trạng thái" },
  { key: "Loại phòng", label: "Loại phòng" },
  { key: "Công ty", label: "Công ty" },
  { key: "Nguồn", label: "Nguồn" },
  { key: "Thị trường", label: "Thị trường" },
  { key: "Phân hệ", label: "Phân hệ" },
  { key: "Mã CMS", label: "Mã CMS" },
  { key: "Mã OTA", label: "Mã OTA" },
];

const DEFAULT_FILTER_FIELDS = FILTER_FIELD_OPTIONS.map((f) => f.key);

// Hàng 1 của thanh lọc: đúng 5 field theo yêu cầu bố cục. Phần còn lại
// (Phân hệ, Mã CMS, Mã OTA, "Thêm bộ lọc") luôn xuống hàng 2.
const PRIMARY_FILTER_FIELDS = ["Trạng thái", "Loại phòng", "Công ty", "Nguồn", "Thị trường"];
const SECONDARY_FILTER_FIELDS = ["Phân hệ", "Mã CMS", "Mã OTA"];

const DEFAULT_MULTI_FILTERS = { status: [], roomType: [], company: [], source: [], market: [], phanHe: [] };
const DEFAULT_TEXT_FILTERS = { cmsCode: "", otaCode: "" };

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

// Nhãn nút bấm của mỗi ô lọc nhiều-lựa-chọn: rỗng = chưa lọc (Tất cả), chọn
// đúng 1 giá trị thì hiện luôn tên giá trị đó cho dễ đọc, nhiều hơn thì đếm số.
function filterTriggerLabel(prefix, selected, options) {
  if (!selected.length) return `${prefix}: Tất cả`;
  if (selected.length === 1) {
    const opt = options.find((o) => o.key === selected[0]);
    return `${prefix}: ${opt ? opt.label : selected[0]}`;
  }
  return `${prefix} (${selected.length})`;
}

function RevenueDetailReport() {
  const { bookings, today } = useBookings();
  const allRows = useMemo(() => buildRevenueDetailRows(bookings), [bookings]);
  const roomTypeFieldOptions = useMemo(
    () => [...new Set(allRows.map((r) => r.roomType))].map((rt) => ({ key: rt, label: rt })),
    [allRows]
  );
  const companyFieldOptions = useMemo(
    () => [...new Set(allRows.map((r) => r.company))].map((c) => ({ key: c, label: c })),
    [allRows]
  );
  const statusFieldOptions = STATUS_OPTIONS;
  const sourceFieldOptions = useMemo(() => SOURCE_OPTIONS.map((s) => ({ key: s, label: s })), []);
  const marketFieldOptions = useMemo(() => MARKET_OPTIONS.map((m) => ({ key: m, label: m })), []);
  const phanHeFieldOptions = useMemo(() => [{ key: PHAN_HE, label: PHAN_HE }], []);

  const [includeTax, setIncludeTax] = useState(true);
  const [dateBasis, setDateBasis] = useState("checkout");
  const [range, setRange] = useState(() => ({ start: addDays(today, -14), end: addDays(today, 14) }));
  const [groupBy, setGroupBy] = useState("phanHe");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [activeFilterFields, setActiveFilterFields] = useState(DEFAULT_FILTER_FIELDS);
  const [multiFilters, setMultiFilters] = useState(DEFAULT_MULTI_FILTERS);
  const [textFilterDraft, setTextFilterDraft] = useState(DEFAULT_TEXT_FILTERS);
  const [textFilters, setTextFilters] = useState(DEFAULT_TEXT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  function applyMultiFilter(field, values) {
    setMultiFilters((prev) => ({ ...prev, [field]: values }));
    setPage(1);
  }

  const filteredRows = useMemo(() => {
    const rangeEnd = endOfDay(range.end);
    return allRows.filter((row) => {
      const inRange = row.checkIn >= range.start && row.checkIn <= rangeEnd;
      const statusMatch = !multiFilters.status.length || multiFilters.status.includes(row.status.key);
      const roomTypeMatch = !multiFilters.roomType.length || multiFilters.roomType.includes(row.roomType);
      const companyMatch = !multiFilters.company.length || multiFilters.company.includes(row.company);
      const sourceMatch = !multiFilters.source.length || multiFilters.source.includes(row.source);
      const marketMatch = !multiFilters.market.length || multiFilters.market.includes(row.market);
      const phanHeMatch = !multiFilters.phanHe.length || multiFilters.phanHe.includes(row.phanHe);
      const cmsMatch = !textFilters.cmsCode || row.cmsCode.includes(textFilters.cmsCode.trim());
      const otaMatch = !textFilters.otaCode || row.otaCode.includes(textFilters.otaCode.trim());
      return (
        inRange && statusMatch && roomTypeMatch && companyMatch && sourceMatch && marketMatch && phanHeMatch && cmsMatch && otaMatch
      );
    });
  }, [allRows, range, multiFilters, textFilters]);

  const totals = useMemo(() => sumRows(filteredRows), [filteredRows]);
  const pagedRows = useMemo(() => paginate(filteredRows, page, pageSize), [filteredRows, page, pageSize]);
  const groups = useMemo(() => groupRows(pagedRows, groupBy), [pagedRows, groupBy]);
  const columns = useMemo(() => COLUMN_DEFS.filter((c) => visibleColumns.includes(c.key)), [visibleColumns]);
  const groupByLabel = GROUP_BY_OPTIONS.find((o) => o.key === groupBy)?.label;

  function toggleGroup(key) {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSearch() {
    setTextFilters(textFilterDraft);
    setPage(1);
  }

  function handleRangeChange(start, end) {
    setRange({ start, end });
    setPage(1);
  }

  function handleDownload() {
    const header = columns.map((c) => c.key);
    const lines = [header, ...filteredRows.map((row) => columns.map((c) => c.value(row)))];
    const csv = lines.map((line) => line.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bao-cao-doanh-thu-chi-tiet.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderFilterField(field) {
    if (field === "Trạng thái") {
      return (
        <FieldPickerPopover
          key={field}
          searchable
          triggerLabel={filterTriggerLabel("Trạng thái", multiFilters.status, statusFieldOptions)}
          triggerIcon={SlidersHorizontal}
          options={statusFieldOptions}
          visible={multiFilters.status}
          defaultVisible={[]}
          onApply={(vals) => applyMultiFilter("status", vals)}
        />
      );
    }
    if (field === "Loại phòng") {
      return (
        <FieldPickerPopover
          key={field}
          searchable
          triggerLabel={filterTriggerLabel("Loại phòng", multiFilters.roomType, roomTypeFieldOptions)}
          triggerIcon={SlidersHorizontal}
          options={roomTypeFieldOptions}
          visible={multiFilters.roomType}
          defaultVisible={[]}
          onApply={(vals) => applyMultiFilter("roomType", vals)}
        />
      );
    }
    if (field === "Công ty") {
      return (
        <FieldPickerPopover
          key={field}
          searchable
          triggerLabel={filterTriggerLabel("Công ty", multiFilters.company, companyFieldOptions)}
          triggerIcon={SlidersHorizontal}
          options={companyFieldOptions}
          visible={multiFilters.company}
          defaultVisible={[]}
          onApply={(vals) => applyMultiFilter("company", vals)}
        />
      );
    }
    if (field === "Nguồn") {
      return (
        <FieldPickerPopover
          key={field}
          searchable
          triggerLabel={filterTriggerLabel("Nguồn", multiFilters.source, sourceFieldOptions)}
          triggerIcon={SlidersHorizontal}
          options={sourceFieldOptions}
          visible={multiFilters.source}
          defaultVisible={[]}
          onApply={(vals) => applyMultiFilter("source", vals)}
        />
      );
    }
    if (field === "Thị trường") {
      return (
        <FieldPickerPopover
          key={field}
          searchable
          triggerLabel={filterTriggerLabel("Thị trường", multiFilters.market, marketFieldOptions)}
          triggerIcon={SlidersHorizontal}
          options={marketFieldOptions}
          visible={multiFilters.market}
          defaultVisible={[]}
          onApply={(vals) => applyMultiFilter("market", vals)}
        />
      );
    }
    if (field === "Phân hệ") {
      return (
        <FieldPickerPopover
          key={field}
          triggerLabel={filterTriggerLabel("Phân hệ", multiFilters.phanHe, phanHeFieldOptions)}
          triggerIcon={SlidersHorizontal}
          options={phanHeFieldOptions}
          visible={multiFilters.phanHe}
          defaultVisible={[]}
          onApply={(vals) => applyMultiFilter("phanHe", vals)}
        />
      );
    }
    if (field === "Mã CMS") {
      return (
        <input
          key={field}
          className={styles.textInput}
          placeholder="Mã CMS"
          value={textFilterDraft.cmsCode}
          onChange={(e) => setTextFilterDraft((v) => ({ ...v, cmsCode: e.target.value }))}
        />
      );
    }
    if (field === "Mã OTA") {
      return (
        <input
          key={field}
          className={styles.textInput}
          placeholder="Mã OTA"
          value={textFilterDraft.otaCode}
          onChange={(e) => setTextFilterDraft((v) => ({ ...v, otaCode: e.target.value }))}
        />
      );
    }
    return null;
  }

  return (
    <>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Báo cáo doanh thu chi tiết</h2>
          <p className={styles.subtitle}>Từng đặt phòng trong khoảng thời gian đã chọn, nhóm theo Phân hệ/Trạng thái/Nguồn.</p>
        </div>
        <div className={styles.topActions}>
          <button type="button" className={styles.iconBtn} aria-label="Tải CSV" onClick={handleDownload}>
            <CloudDownload size={18} />
          </button>
          <button type="button" className={styles.iconBtn} aria-label="In" onClick={() => window.print()}>
            <Printer size={18} />
          </button>
        </div>
      </div>

      <section className={styles.filterCard}>
        <div className={styles.topRow}>
          <div className={styles.segmented} title="Doanh thu ghi nhận vào">
            {DATE_BASIS_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.key}
                className={dateBasis === opt.key ? styles.segmentActive : styles.segment}
                onClick={() => setDateBasis(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={includeTax} onChange={(e) => setIncludeTax(e.target.checked)} />
            Bao gồm thuế phí
          </label>

          <DateRangePicker start={range.start} end={range.end} onChange={handleRangeChange} />

          <button type="button" className={styles.searchIconBtn} aria-label="Tìm kiếm" onClick={handleSearch}>
            <Search size={16} />
          </button>
        </div>

        <div className={styles.filterRow}>
          {PRIMARY_FILTER_FIELDS.filter((f) => activeFilterFields.includes(f)).map(renderFilterField)}
        </div>

        <div className={styles.filterRow}>
          {SECONDARY_FILTER_FIELDS.filter((f) => activeFilterFields.includes(f)).map(renderFilterField)}

          <FieldPickerPopover
            triggerLabel="Thêm bộ lọc"
            triggerIcon={SlidersHorizontal}
            options={FILTER_FIELD_OPTIONS}
            visible={activeFilterFields}
            defaultVisible={DEFAULT_FILTER_FIELDS}
            onApply={setActiveFilterFields}
          />
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableTools}>
          <FieldPickerPopover
            mode="single"
            align="left"
            triggerLabel={`Nhóm theo: ${groupByLabel}`}
            triggerIcon={SlidersHorizontal}
            options={GROUP_BY_OPTIONS}
            visible={[groupBy]}
            defaultVisible={["phanHe"]}
            onApply={(vals) => setGroupBy(vals[0])}
          />

          <FieldPickerPopover
            triggerLabel="Cột hiển thị"
            triggerIcon={SlidersHorizontal}
            options={COLUMN_DEFS.map((c) => ({ key: c.key, label: c.key }))}
            visible={visibleColumns}
            defaultVisible={DEFAULT_COLUMNS}
            onApply={setVisibleColumns}
          />
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table} style={{ width: `${Math.max(columns.reduce((w, c) => w + c.width, 0), 700)}px` }}>
            <colgroup>
              {columns.map((c) => (
                <col key={c.key} style={{ width: `${c.width}px` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} style={{ textAlign: c.align || "left" }}>{c.key}</th>
                ))}
              </tr>
            </thead>

            {groups.map((group) => {
              const isCollapsed = !!collapsedGroups[group.key];
              const groupTotals = sumRows(group.rows);
              return (
                <tbody key={group.key}>
                  <tr className={styles.groupRow}>
                    <td colSpan={columns.length}>
                      <button type="button" className={styles.groupToggle} onClick={() => toggleGroup(group.key)}>
                        {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                        <span className={styles.groupLabel}>
                          {groupByLabel}: {group.key}
                        </span>
                        <span className={styles.groupMeta}>
                          {group.rows.length} đặt phòng · {formatCurrency(groupTotals.totalRevenue)}
                        </span>
                      </button>
                    </td>
                  </tr>

                  {!isCollapsed &&
                    group.rows.map((row) => (
                      <tr key={row.id}>
                        {columns.map((c) => (
                          <td key={c.key} style={{ textAlign: c.align || "left" }} className={c.strong ? styles.strongCell : undefined}>
                            {c.key === "Trạng thái" ? <StatusBadge tone={row.status.tone}>{row.status.label}</StatusBadge> : c.value(row)}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              );
            })}

            {!filteredRows.length && (
              <tbody>
                <tr>
                  <td className={styles.empty} colSpan={Math.max(columns.length, 1)}>
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              </tbody>
            )}

            {!!filteredRows.length && (
              <tfoot>
                <tr className={styles.totalsRow}>
                  {columns.map((c, i) => {
                    if (i === 0) return <td key={c.key}>Tổng cộng ({filteredRows.length})</td>;
                    const sumKey = TOTAL_FIELD_BY_COLUMN[c.key];
                    if (!sumKey) return <td key={c.key}></td>;
                    return (
                      <td key={c.key} style={{ textAlign: c.align || "left" }}>
                        {c.key === "Số đêm" ? totals[sumKey] : formatCurrency(totals[sumKey])}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <WarehousePagination page={page} pageSize={pageSize} total={filteredRows.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      </section>
    </>
  );
}

export default RevenueDetailReport;
