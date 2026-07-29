import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import RoomCell from "./RoomCell";
import GuestCell from "./GuestCell";
import RowActionMenu from "./RowActionMenu";
import PrintMenu from "./PrintMenu";
import { formatDateTimeDMY, formatElapsed } from "../../../utils/format";
import EmptyState from "../../../components/EmptyState";
import styles from "./ReservationTable.module.css";

const TAB_META = {
  arrivals: { badgeTone: "arrival", label: "Sẽ đến" },
  departures: { badgeTone: "departure", label: "Sẽ đi" },
  inhouse: { badgeTone: "inhouse", label: "Đang ở" },
};

function ReservationTable({ tab, rows, onOpenGuest, getMenuItems, onPrintOption }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const meta = TAB_META[tab];
  const showCheckOutColumn = tab === "arrivals";

  if (rows.length === 0) {
    return (
      <EmptyState message="Không có dữ liệu" hint="Không tìm thấy đặt phòng phù hợp trong danh sách này." />
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Phòng</th>
            <th>Mã đặt phòng</th>
            <th>Tên khách</th>
            <th>Ngày đến</th>
            <th>{showCheckOutColumn ? "Ngày đi" : "Số lần lưu trú"}</th>
            <th>Thời gian ở</th>
            <th>NL / TE</th>
            <th>Trạng thái</th>
            <th className={styles.actionsHead}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((booking) => (
            <tr key={booking.id}>
              <td>
                <RoomCell room={booking.room} roomType={booking.roomType} tone={tab === "arrivals" && !booking.assigned ? "arrival" : "stay"} />
              </td>
              <td className={styles.muted}>{booking.bookingCode}</td>
              <td>
                <GuestCell guest={booking.guest} onOpen={() => onOpenGuest(booking)} />
              </td>
              <td className={styles.muted}>{formatDateTimeDMY(booking.checkIn)}</td>
              <td className={styles.muted}>
                {showCheckOutColumn ? formatDateTimeDMY(booking.checkOut) : booking.stayCount}
              </td>
              <td className={styles.mono}>{formatElapsed(booking.checkIn, now)}</td>
              <td className={styles.muted}>
                {booking.adults} / {booking.children}
              </td>
              <td>
                <StatusBadge tone={meta.badgeTone}>{meta.label}</StatusBadge>
              </td>
              <td>
                <div className={styles.actionsCell}>
                  <PrintMenu onSelect={(option) => onPrintOption(booking, option)} />
                  <RowActionMenu items={getMenuItems(booking)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationTable;
