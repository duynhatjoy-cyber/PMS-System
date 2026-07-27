import { Search } from "lucide-react";
import PresetDateDropdown from "./PresetDateDropdown";
import DateField from "./DateField";
import styles from "../Warehouse.module.css";

function FilterBar({
  preset,
  onPresetChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  combinedDateLabel,
  onSubmit,
  submitLabel = "LẤY DỮ LIỆU",
  extraActions,
  children,
}) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>&nbsp;</label>
        <PresetDateDropdown value={preset} onChange={onPresetChange} />
      </div>

      {combinedDateLabel ? (
        <div className={styles.field}>
          <label className={styles.fieldLabel}>{combinedDateLabel}</label>
          <div style={{ display: "flex", gap: 10 }}>
            <DateField value={fromDate} onChange={onFromDateChange} />
            <DateField value={toDate} onChange={onToDateChange} />
          </div>
        </div>
      ) : (
        <>
          <DateField label="Từ ngày" value={fromDate} onChange={onFromDateChange} />
          <DateField label="Đến ngày" value={toDate} onChange={onToDateChange} />
        </>
      )}

      {children}

      <button type="button" className={styles.submitBtn} onClick={onSubmit}>
        <Search size={15} />
        {submitLabel}
      </button>
      {extraActions}
    </div>
  );
}

export default FilterBar;
