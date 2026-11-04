import { useState } from "react";
import { getGuestTiers, saveGuestTiers } from "../../data/guestData";
import styles from "./GuestClassification.module.css";

export default function GuestClassification() {
  const [tiers, setTiers] = useState(getGuestTiers);
  const [message, setMessage] = useState("");

  function update(id, value) {
    setTiers((current) => current.map((tier) => tier.id === id ? { ...tier, minStays: value } : tier));
    setMessage("");
  }

  function save(event) {
    event.preventDefault();
    const next = tiers.map((tier) => ({ ...tier, minStays: Number(tier.minStays) }));
    if (next.slice(1).some((tier, index) => !Number.isSafeInteger(tier.minStays) || tier.minStays <= next[index].minStays)) {
      setMessage("Số lần ở phải là số nguyên và tăng dần theo từng hạng.");
      return;
    }
    try {
      saveGuestTiers(next);
      setTiers(next);
      setMessage("Đã lưu. Hạng khách được cập nhật tự động theo số lần ở.");
    } catch {
      setMessage("Không thể lưu cấu hình trên trình duyệt này.");
    }
  }

  return (
    <section className={styles.panel}>
      <h1>Phân loại khách hàng</h1>
      <p>Đặt số lần ở tối thiểu để khách tự động lên từng hạng. Thay đổi sẽ áp dụng cho cả khách đã có trong danh sách.</p>
      <form onSubmit={save}>
        <div className={styles.heading}><span>Hạng khách</span><span>Số lần ở tối thiểu</span></div>
        {tiers.map((tier) => (
          <label className={styles.row} key={tier.id}>
            <span className={styles.name}><i style={{ background: tier.color }} />{tier.label}</span>
            {tier.id === "new" ? <span className={styles.fixed}>0 (mặc định)</span> : (
              <input type="number" min="1" step="1" required value={tier.minStays}
                onChange={(event) => update(tier.id, event.target.value)} aria-label={`Số lần ở tối thiểu cho hạng ${tier.label}`} />
            )}
          </label>
        ))}
        <div className={styles.actions}><button type="submit">Lưu phân loại</button><span role="status">{message}</span></div>
      </form>
    </section>
  );
}
