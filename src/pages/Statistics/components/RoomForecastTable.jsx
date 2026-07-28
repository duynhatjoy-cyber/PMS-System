import styles from "./RoomForecastTable.module.css";

function RoomForecastTable({ dates, rows }) {
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.stickyCol}>Loại phòng</th>
            {dates.map((date) => (
              <th key={date}>{date}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.roomType}>
              <td className={styles.stickyCol}>{row.roomType}</td>
              {row.values.map((value, i) => (
                <td key={i} className={value < 0 ? styles.negative : undefined}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RoomForecastTable;
