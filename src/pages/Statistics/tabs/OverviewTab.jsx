import { Activity, Bed, Building2, Calendar, ClipboardList, Sparkles, Users } from "lucide-react";
import StatCard, { StatRow, StatTripleRow } from "../components/StatCard";
import RoomForecastTable from "../components/RoomForecastTable";
import {
  ACTIVITY_STATS,
  GUEST_STATS,
  ROOM_FORECAST_DATES,
  ROOM_FORECAST_ROWS,
  ROOM_STATS,
  ROOM_STATUS_STATS,
  TODAY_STATS,
} from "../data/statisticsData";
import styles from "./OverviewTab.module.css";

function OverviewTab() {
  return (
    <div className={styles.grid}>
      <StatCard icon={Building2} title="Thống kê hôm nay">
        <StatRow label="Phòng có khách" value={TODAY_STATS.phongCoKhach} />
        <StatRow label="Phòng dự kiến đi" value={TODAY_STATS.phongDuKienDi} />
        <StatRow label="Phòng ở qua ngày" value={TODAY_STATS.phongOQuaNgay} />
        <StatRow label="Phòng dự kiến đến" value={TODAY_STATS.phongDuKienDen} />
        <StatRow label="Tổng số phòng sẵn sàng" value={TODAY_STATS.tongSoPhongSanSang} />
        <StatRow label="Dự kiến phòng chiếm dụng" value={TODAY_STATS.duKienPhongChiemDung} />
        <StatRow label="Công suất dự kiến" value={`${TODAY_STATS.congSuatDuKien}%`} />
      </StatCard>

      <StatCard
        icon={Users}
        title="Tổng số khách"
        extra={<span className={styles.tripleHint}>Trẻ em / Người lớn / Tổng</span>}
      >
        <StatTripleRow label="Khách đang ở" {...GUEST_STATS.dangO} />
        <StatTripleRow label="Khách dự kiến đi" {...GUEST_STATS.duKienDi} />
        <StatTripleRow label="Khách ở qua ngày" {...GUEST_STATS.oQuaNgay} />
        <StatTripleRow label="Dự kiến đến" {...GUEST_STATS.duKienDen} />
        <StatTripleRow label="Tổng khách dự kiến" {...GUEST_STATS.tongDuKien} />
      </StatCard>

      <StatCard icon={Activity} title="Hoạt động trong ngày">
        <StatRow label="Đã đến" value={ACTIVITY_STATS.daDen} />
        <StatRow label="Dự kiến đến" value={ACTIVITY_STATS.duKienDen} />
        <StatRow label="Đã đi" value={ACTIVITY_STATS.daDi} />
        <StatRow label="Dự kiến đi" value={ACTIVITY_STATS.duKienDi} />
        <StatRow label="Đến & đi trong ngày" value={ACTIVITY_STATS.denDiTrongNgay} />
      </StatCard>

      <StatCard icon={Bed} title="Thống kê phòng">
        <StatRow label="Tổng số phòng" value={ROOM_STATS.tongSoPhong} />
        <StatRow label="Phòng hỏng" value={ROOM_STATS.phongHong} />
        <StatRow label="Tổng số phòng sẵn sàng" value={ROOM_STATS.tongSoPhongSanSang} />
      </StatCard>

      <StatCard
        icon={ClipboardList}
        title="Thống kê phòng trống"
        extra={
          <span className={styles.dateChip}>
            <Calendar size={13} />
            28/07/2026
          </span>
        }
      >
        <div className={styles.tableWrap}>
          <RoomForecastTable dates={ROOM_FORECAST_DATES} rows={ROOM_FORECAST_ROWS} />
        </div>
      </StatCard>

      <StatCard icon={Sparkles} title="Trạng thái buồng phòng">
        <StatRow label="Bẩn do khách ở" value={ROOM_STATUS_STATS.banDoKhachO} />
        <StatRow label="Phòng trống bẩn" value={ROOM_STATUS_STATS.phongTrongBan} />
      </StatCard>
    </div>
  );
}

export default OverviewTab;
