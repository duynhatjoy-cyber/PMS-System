import { Activity, Sparkles, Users, Warehouse } from "lucide-react";
import StatCard from "../components/StatCard";
import CompareBarChart from "../components/CompareBarChart";
import CapacityMeter from "../components/CapacityMeter";
import { ACTIVITY_STATS, GUEST_STATS, ROOM_STATS, ROOM_STATUS_STATS } from "../data/statisticsData";
import styles from "./ChartsTab.module.css";

function ChartsTab() {
  return (
    <div className={styles.grid}>
      <StatCard icon={Activity} title="Hoạt động trong ngày">
        <CompareBarChart
          categories={["Đã đến", "Dự kiến đến", "Đã đi", "Dự kiến đi", "Đến & đi trong ngày"]}
          series={[
            {
              name: "Số lượng",
              color: "var(--fd-primary)",
              values: [
                ACTIVITY_STATS.daDen,
                ACTIVITY_STATS.duKienDen,
                ACTIVITY_STATS.daDi,
                ACTIVITY_STATS.duKienDi,
                ACTIVITY_STATS.denDiTrongNgay,
              ],
            },
          ]}
        />
      </StatCard>

      <StatCard icon={Warehouse} title="Kho phòng">
        <CapacityMeter
          total={ROOM_STATS.tongSoPhong}
          segments={[
            { label: "Sẵn sàng", value: ROOM_STATS.tongSoPhongSanSang, color: "var(--fd-success)" },
            { label: "Phòng hỏng", value: ROOM_STATS.phongHong, color: "var(--fd-danger)" },
          ]}
        />
      </StatCard>

      <StatCard icon={Users} title="Khách trong khách sạn">
        <CompareBarChart
          categories={["Khách đang ở", "Khách dự kiến đi", "Khách ở qua ngày", "Dự kiến đến", "Tổng khách dự kiến"]}
          series={[
            {
              name: "Người lớn",
              color: "var(--fd-primary)",
              values: [
                GUEST_STATS.dangO.nguoiLon,
                GUEST_STATS.duKienDi.nguoiLon,
                GUEST_STATS.oQuaNgay.nguoiLon,
                GUEST_STATS.duKienDen.nguoiLon,
                GUEST_STATS.tongDuKien.nguoiLon,
              ],
            },
            {
              name: "Trẻ em",
              color: "var(--fd-chart-teal)",
              values: [
                GUEST_STATS.dangO.treEm,
                GUEST_STATS.duKienDi.treEm,
                GUEST_STATS.oQuaNgay.treEm,
                GUEST_STATS.duKienDen.treEm,
                GUEST_STATS.tongDuKien.treEm,
              ],
            },
          ]}
        />
      </StatCard>

      <StatCard icon={Sparkles} title="Buồng phòng">
        <CompareBarChart
          categories={["Bẩn do khách ở", "Phòng trống bẩn"]}
          series={[
            {
              name: "Số lượng",
              color: "var(--fd-primary)",
              values: [ROOM_STATUS_STATS.banDoKhachO, ROOM_STATUS_STATS.phongTrongBan],
            },
          ]}
        />
      </StatCard>
    </div>
  );
}

export default ChartsTab;
