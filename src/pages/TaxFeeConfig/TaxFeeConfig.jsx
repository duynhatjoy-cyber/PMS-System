import { useMemo, useState } from "react";
import { BedDouble, CircleHelp, ConciergeBell, Plus, Receipt, Save } from "lucide-react";
import ApplyTargetCard from "./components/ApplyTargetCard";
import TaxFeeChip from "./components/TaxFeeChip";
import AddTaxFeeModal from "./modals/AddTaxFeeModal";
import Toast from "../FrontDesk/components/Toast";
import { INITIAL_APPLIED_SLOTS, INITIAL_TAX_FEES } from "../../data/taxFeeData";
import { buildBranchFormula, buildTotalFormula } from "./formula";
import styles from "./TaxFeeConfig.module.css";

function TaxFeeConfig() {
  const [taxFees, setTaxFees] = useState(INITIAL_TAX_FEES);
  const [appliedSlots, setAppliedSlots] = useState(INITIAL_APPLIED_SLOTS);
  const [variants, setVariants] = useState({ room: "after", service: "after" });
  const [autoApply, setAutoApply] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const taxFeesById = useMemo(
    () => Object.fromEntries(taxFees.map((tf) => [tf.id, tf])),
    [taxFees]
  );

  function namesOf(slotKey) {
    return appliedSlots[slotKey].map((id) => taxFeesById[id]?.name).filter(Boolean);
  }

  const roomFormula = buildBranchFormula("Tiền phòng & phụ thu", variants.room, namesOf("room"));
  const serviceFormula = buildBranchFormula("Dịch vụ", variants.service, namesOf("service"));
  const totalFormula = buildTotalFormula(roomFormula, serviceFormula, namesOf("total"));

  function handleCreateTaxFee(taxFee) {
    setTaxFees((prev) => [...prev, taxFee]);
    setIsModalOpen(false);
    setToastMsg(`Đã thêm ${taxFee.name}`);
  }

  function handleDropOnSlot(slotKey, taxFeeId) {
    if (!taxFeesById[taxFeeId]) return;
    setAppliedSlots((prev) => {
      if (prev[slotKey].includes(taxFeeId)) return prev;
      return { ...prev, [slotKey]: [...prev[slotKey], taxFeeId] };
    });
  }

  function handleRemoveFromSlot(slotKey, taxFeeId) {
    setAppliedSlots((prev) => ({
      ...prev,
      [slotKey]: prev[slotKey].filter((id) => id !== taxFeeId),
    }));
  }

  function handleVariantChange(slotKey, value) {
    setVariants((prev) => ({ ...prev, [slotKey]: value }));
  }

  function handleSave() {
    setToastMsg("Đã lưu cấu hình Thuế/Phí");
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Cấu hình Thuế/Phí</h1>
          <p className={styles.subtitle}>
            Thiết lập các loại thuế, phí và quy định thời điểm áp dụng lên doanh thu khách sạn.
          </p>
        </div>

        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          <Save size={16} />
          Lưu
        </button>
      </div>

      <section className={styles.poolCard}>
        <div className={styles.poolHead}>
          <span className={styles.poolLabel}>Thuế/Phí đã thiết lập</span>
          <button type="button" className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={15} />
            Thêm mới
          </button>
        </div>

        <div className={styles.poolChips}>
          {taxFees.map((taxFee) => (
            <TaxFeeChip key={taxFee.id} taxFee={taxFee} draggable />
          ))}
        </div>
      </section>

      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Áp dụng vào doanh thu</h2>
          <span className={styles.sectionHint}>
            Kéo một Thuế/Phí ở trên và thả vào ô tương ứng, chọn thời điểm áp dụng trước hoặc sau
            khi trừ chiết khấu
            <CircleHelp size={14} />
          </span>
        </div>

        <div className={styles.grid}>
          <ApplyTargetCard
            icon={BedDouble}
            title="Tiền phòng & phụ thu"
            subtitle="Doanh thu tiền phòng và phụ thu tiền phòng"
            variant={variants.room}
            onVariantChange={(v) => handleVariantChange("room", v)}
            slotKey="room"
            appliedIds={appliedSlots.room}
            taxFeesById={taxFeesById}
            onDrop={handleDropOnSlot}
            onRemove={handleRemoveFromSlot}
            formula={roomFormula}
          />

          <ApplyTargetCard
            icon={ConciergeBell}
            title="Dịch vụ"
            subtitle="Đền bù, giặt là, minibar, dịch vụ phòng..."
            variant={variants.service}
            onVariantChange={(v) => handleVariantChange("service", v)}
            slotKey="service"
            appliedIds={appliedSlots.service}
            taxFeesById={taxFeesById}
            onDrop={handleDropOnSlot}
            onRemove={handleRemoveFromSlot}
            formula={serviceFormula}
          />

          <ApplyTargetCard
            icon={Receipt}
            title="Tổng hóa đơn"
            subtitle="Áp dụng trên toàn bộ hóa đơn"
            slotKey="total"
            appliedIds={appliedSlots.total}
            taxFeesById={taxFeesById}
            onDrop={handleDropOnSlot}
            onRemove={handleRemoveFromSlot}
            formula={totalFormula}
          />
        </div>
      </section>

      <label className={styles.checkboxCard}>
        <input
          type="checkbox"
          checked={autoApply}
          onChange={(e) => setAutoApply(e.target.checked)}
        />
        Tự động áp dụng Thuế/Phí đối với các đặt phòng mới (không áp dụng với đặt phòng từ OTA)
      </label>

      {isModalOpen && (
        <AddTaxFeeModal onClose={() => setIsModalOpen(false)} onSave={handleCreateTaxFee} />
      )}

      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default TaxFeeConfig;
