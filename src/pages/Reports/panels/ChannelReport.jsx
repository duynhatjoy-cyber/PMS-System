import { useMemo, useState } from "react";
import { BedDouble, ChevronDown, ChevronRight, ClipboardList, Download, DollarSign, History, RefreshCw, Search, Tag, TriangleAlert } from "lucide-react";
import DateRangePicker from "../../Revenue/components/DateRangePicker";
import { formatCurrency } from "../../../utils/format";
import { CHANNELS, CHANNEL_ROOM_STATS, aggregateRows } from "../data/channelReportData";
import styles from "./ChannelReport.module.css";

const DATE_BASIS_OPTIONS = [
  { key: "booked", label: "Theo ngày đặt" },
  { key: "checkin", label: "Theo ngày nhận phòng" },
];

const CSV_HEADER = [
  "Kênh",
  "Hạng phòng",
  "Doanh thu",
  "Số đặt phòng",
  "Số đêm phòng",
  "Số đêm TB",
  "Đặt trước TB (ngày)",
  "Giá phòng TB",
  "Hủy phòng",
];

function statsToCsvRow(label, roomTypeLabel, stats) {
  return [
    label,
    roomTypeLabel,
    stats.revenue,
    stats.reservations,
    stats.roomNights,
    stats.avgLOS.toFixed(2),
    stats.avgLeadTime.toFixed(2),
    stats.adr,
    stats.cancellations,
  ];
}

function downloadCsv(rows) {
  const csv = [CSV_HEADER, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bao-cao-kenh.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className={styles.statItem}>
      <span className={styles.statIcon}>
        <Icon size={16} strokeWidth={1.8} />
      </span>
      <div>
        <div className={styles.statLabel}>{label}</div>
        <div className={styles.statValue}>{value}</div>
      </div>
    </div>
  );
}

function ChannelReport() {
  const [dateBasis, setDateBasis] = useState("checkin");
  const [range, setRange] = useState({ start: new Date(2026, 6, 1), end: new Date(2026, 8, 4) });
  const [expandedChannels, setExpandedChannels] = useState({});

  const channelStats = useMemo(
    () =>
      CHANNELS.map((channel) => {
        const rows = CHANNEL_ROOM_STATS[channel.key];
        return { channel, rows, totals: aggregateRows(rows) };
      }),
    []
  );

  const grandTotals = useMemo(
    () => aggregateRows(CHANNELS.flatMap((c) => CHANNEL_ROOM_STATS[c.key])),
    []
  );

  function toggleChannel(channelKey) {
    setExpandedChannels((prev) => ({ ...prev, [channelKey]: !prev[channelKey] }));
  }

  function handleDownload() {
    const rows = channelStats.flatMap(({ channel, rows: roomRows, totals }) => [
      statsToCsvRow(channel.label, "Tất cả hạng phòng", totals),
      ...roomRows.map((row) => statsToCsvRow(channel.label, row.roomTypeLabel, row)),
    ]);
    downloadCsv(rows);
  }

  return (
    <>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Báo cáo kênh</h2>
          <p className={styles.subtitle}>
            Doanh thu và đặt phòng theo từng kênh OTA — bấm mũi tên trước tên kênh để xem chi tiết theo
            từng hạng phòng kênh đó đang bán.
          </p>
        </div>
      </div>

      <section className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={styles.segmented}>
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

          <DateRangePicker start={range.start} end={range.end} onChange={(start, end) => setRange({ start, end })} />

          <button type="button" className={styles.searchIconBtn} aria-label="Tìm kiếm" onClick={() => setExpandedChannels({})}>
            <Search size={16} />
          </button>

          <button type="button" className={styles.refreshBtn} onClick={() => setExpandedChannels({})}>
            <RefreshCw size={14} />
            Làm mới
          </button>
        </div>
      </section>

      <section className={styles.statsCard}>
        <div className={styles.statsGrid}>
          <Stat icon={DollarSign} label="Doanh thu" value={formatCurrency(grandTotals.revenue)} />
          <Stat icon={ClipboardList} label="Số đặt phòng" value={grandTotals.reservations} />
          <Stat icon={BedDouble} label="Số đêm phòng" value={grandTotals.roomNights} />
          <Stat icon={TriangleAlert} label="Hủy phòng" value={grandTotals.cancellations} />
          <Stat icon={Tag} label="Giá phòng trung bình" value={formatCurrency(grandTotals.adr)} />
          <Stat icon={BedDouble} label="Số đêm TB / đặt phòng" value={grandTotals.avgLOS.toFixed(2)} />
          <Stat icon={History} label="Đặt trước trung bình (ngày)" value={grandTotals.avgLeadTime.toFixed(2)} />
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.toggleHeadCell}></th>
                <th>Kênh</th>
                <th>Doanh thu</th>
                <th>Số đặt phòng</th>
                <th>Số đêm phòng</th>
                <th>Số đêm TB</th>
                <th>Đặt trước TB (ngày)</th>
                <th>Giá phòng TB</th>
                <th>Hủy phòng</th>
              </tr>
            </thead>
            {channelStats.map(({ channel, rows, totals }) => {
              const isExpanded = !!expandedChannels[channel.key];
              return (
                <tbody key={channel.key}>
                  <tr className={styles.channelRow}>
                    <td className={styles.toggleCell}>
                      <button
                        type="button"
                        className={styles.toggleBtn}
                        aria-expanded={isExpanded}
                        aria-label={`Xem hạng phòng của ${channel.label}`}
                        onClick={() => toggleChannel(channel.key)}
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                    <td className={styles.channelCell}>{channel.label}</td>
                    <td>{formatCurrency(totals.revenue)}</td>
                    <td>{totals.reservations}</td>
                    <td>{totals.roomNights}</td>
                    <td>{totals.avgLOS.toFixed(2)}</td>
                    <td>{totals.avgLeadTime.toFixed(2)}</td>
                    <td>{formatCurrency(totals.adr)}</td>
                    <td>{totals.cancellations}</td>
                  </tr>

                  {isExpanded &&
                    rows.map((row) => (
                      <tr key={row.roomTypeKey} className={styles.roomTypeRow}>
                        <td></td>
                        <td className={styles.roomTypeCell}>{row.roomTypeLabel}</td>
                        <td>{formatCurrency(row.revenue)}</td>
                        <td>{row.reservations}</td>
                        <td>{row.roomNights}</td>
                        <td>{row.avgLOS.toFixed(2)}</td>
                        <td>{row.avgLeadTime.toFixed(2)}</td>
                        <td>{formatCurrency(row.adr)}</td>
                        <td>{row.cancellations}</td>
                      </tr>
                    ))}
                </tbody>
              );
            })}
          </table>
        </div>

        <button type="button" className={styles.downloadBtn} onClick={handleDownload}>
          <Download size={13} />
          Tải CSV
        </button>
      </section>
    </>
  );
}

export default ChannelReport;
