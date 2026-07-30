import { useState } from "react";
import { ArrowRight } from "lucide-react";
import styles from "./TimeConfig.module.css";

function TimeRange({ label, start, end, onStart, onEnd }) {
  return <label className={styles.field}><span>{label}</span><div className={styles.timeRange}><input type="time" value={start} onChange={(event) => onStart(event.target.value)} /><ArrowRight size={17} /><input type="time" value={end} onChange={(event) => onEnd(event.target.value)} /></div></label>;
}

function TimeConfig() {
  const [settings, setSettings] = useState({
    checkIn: "14:00", checkOut: "12:00", applyToNewBooking: true, roundingEnabled: true, roundingMinutes: "15",
    overnightIn: "14:00", overnightOut: "12:00", timezone: "UTC+07:00", noShowHoldOff: false,
  });
  const [saved, setSaved] = useState(false);
  const update = (field, value) => setSettings((current) => ({ ...current, [field]: value }));

  function save() { setSaved(true); window.setTimeout(() => setSaved(false), 1800); }

  return <main className={styles.page}>
    <header className={styles.heading}><h1>Cấu hình giờ</h1><p>Thiết lập thời gian vận hành và quy tắc tính giờ cho khách sạn.</p></header>
    <section className={styles.panel}>
      <div className={styles.column}>
        <TimeRange label="Thời gian nhận / trả phòng trong ngày" start={settings.checkIn} end={settings.checkOut} onStart={(value) => update("checkIn", value)} onEnd={(value) => update("checkOut", value)} />
        <label className={styles.checkLabel}><input type="checkbox" checked={settings.applyToNewBooking} onChange={(event) => update("applyToNewBooking", event.target.checked)} /> Thời gian khi tạo mới đặt phòng</label>
        {settings.applyToNewBooking && <div className={styles.previewRange}>{settings.checkIn}<ArrowRight size={16} />{settings.checkOut}</div>}
        <label className={styles.checkLabel}><input type="checkbox" checked={settings.roundingEnabled} onChange={(event) => update("roundingEnabled", event.target.checked)} /> Số phút làm tròn 1 giờ</label>
        {settings.roundingEnabled && <label className={styles.field}><input className={styles.singleInput} type="number" min="0" value={settings.roundingMinutes} onChange={(event) => update("roundingMinutes", event.target.value)} /><small>phút</small></label>}
      </div>
      <div className={styles.column}>
        <TimeRange label="Cấu hình giờ qua đêm" start={settings.overnightIn} end={settings.overnightOut} onStart={(value) => update("overnightIn", value)} onEnd={(value) => update("overnightOut", value)} />
        <label className={styles.field}><span>Múi giờ</span><select value={settings.timezone} onChange={(event) => update("timezone", event.target.value)}><option value="UTC+07:00">(UTC+07:00) Bangkok, Hanoi, Jakarta</option><option value="UTC+08:00">(UTC+08:00) Beijing, Singapore</option><option value="UTC+00:00">(UTC+00:00) London</option></select></label>
        <label className={styles.checkLabel}><input type="checkbox" checked={settings.noShowHoldOff} onChange={(event) => update("noShowHoldOff", event.target.checked)} /> Tắt giữ tiền phòng noshow</label>
        <button className={styles.saveButton} onClick={save}>{saved ? "Đã lưu" : "Lưu"}</button>
      </div>
    </section>
  </main>;
}

export default TimeConfig;
