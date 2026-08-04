import { useState } from "react";
import { X } from "lucide-react";
import styles from "./QrPaymentConfig.module.css";

const PROVIDERS = [
  {
    key: "vnpay",
    label: "Mã QR (via VnPay)",
    title: "Kết nối Mã QR (via VnPay)",
    fields: ["appId", "merchantName", "merchantCode", "secretKey", "terminalId", "merchantType", "secretKeyQuery"],
  },
  {
    key: "bidv",
    label: "Mã VietQR (BIDV)",
    title: "Kết nối Mã VietQR (BIDV)",
    fields: ["serviceCode", "serviceId", "accountName", "merchantId"],
    defaults: { serviceCode: "9648599", serviceId: "04D024", accountName: "Lifrooms Boutique Hotel", merchantId: "8600088604" },
  },
  {
    key: "abbank",
    label: "Mã VietQR (via ABBank)",
    title: "Kết nối Mã VietQR (via ABBank)",
    fields: ["serviceCode", "accountName", "vaToken"],
  },
  {
    key: "mbbank",
    label: "Mã VietQR (via MBBank)",
    title: "Kết nối Mã VietQR (via MBBank)",
    fields: ["merchantCode", "merchantName", "terminalId", "secretKey", "accessKey"],
  },
];

const FIELD_LABELS = {
  appId: "appId",
  merchantName: "merchantName",
  merchantCode: "merchantCode",
  secretKey: "secretKey",
  terminalId: "terminalId",
  merchantType: "merchantType",
  secretKeyQuery: "secretKeyQuery",
  serviceCode: "serviceCode",
  serviceId: "serviceId",
  accountName: "accountName",
  merchantId: "merchantId",
  vaToken: "vaToken",
  accessKey: "accessKey",
};

function ClearableValue({ value, onClear }) {
  return (
    <div className={styles.clearableValue}>
      <span>{value}</span>
      <button type="button" aria-label={`Xóa ${value}`} onClick={onClear}><X size={17} /></button>
    </div>
  );
}

function RegistrationPanel() {
  const [country, setCountry] = useState("Vietnam");
  const [province, setProvince] = useState("Bà Rịa - Vũng Tàu");

  return (
    <section className={styles.registration}>
      <h2>Đăng ký</h2>
      <div className={styles.registrationBody}>
        <h3>Thông tin khách sạn</h3>
        <label><span>Tên khách sạn</span><input disabled value="Lifrooms Boutique Hotel" /></label>
        <label><span>Mã số thuế</span><input value="0102345678" readOnly /></label>
        <h3>Địa chỉ</h3>
        <label><span>Quốc gia</span><ClearableValue value={country} onClear={() => setCountry("")} /></label>
        <label><span>Tỉnh</span><ClearableValue value={province} onClear={() => setProvince("")} /></label>
        <label><span>Quận - Huyện</span><input value="Vũng Tàu" readOnly /></label>
        <label><span>Địa chỉ khách sạn</span><input value="12 Đường Bãi Sau, Phường Thắng Tam, TP. Vũng Tàu" readOnly /></label>
      </div>
    </section>
  );
}

function ProviderForm({ provider, values, onChange }) {
  return (
    <section className={styles.providerForm}>
      <h3>{provider.title}</h3>
      <div className={styles.providerFields}>
        {provider.fields.map((field) => (
          <label key={field}>
            <span>{FIELD_LABELS[field]}</span>
            <input
              className={values[field] ? "" : styles.requiredInput}
              value={values[field] || ""}
              onChange={(event) => onChange(field, event.target.value)}
            />
          </label>
        ))}
        <label>
          <span>Tài khoản ngân hàng</span>
          <select className={values.bankAccount ? "" : styles.requiredInput} value={values.bankAccount || ""} onChange={(event) => onChange("bankAccount", event.target.value)}>
            <option value=""></option>
            <option value="8600088604 - BIDV">8600088604 - BIDV</option>
            <option value="0688888999 - MBBank">0688888999 - MBBank</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function QrPaymentConfig() {
  const [enabled, setEnabled] = useState(["bidv"]);
  const [activeKey, setActiveKey] = useState("bidv");
  const [configs, setConfigs] = useState(() => Object.fromEntries(PROVIDERS.map((provider) => [
    provider.key,
    { ...(provider.defaults || {}), bankAccount: provider.key === "bidv" ? "8600088604 - BIDV" : "" },
  ])));

  const activeProvider = PROVIDERS.find((provider) => provider.key === activeKey);

  function toggleProvider(providerKey) {
    setEnabled((current) => {
      if (current.includes(providerKey)) {
        const next = current.filter((key) => key !== providerKey);
        if (activeKey === providerKey) setActiveKey(next.at(-1) || "");
        return next;
      }
      setActiveKey(providerKey);
      return [...current, providerKey];
    });
  }

  function updateConfig(field, value) {
    setConfigs((current) => ({
      ...current,
      [activeKey]: { ...current[activeKey], [field]: value },
    }));
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeading}>
        <h1>Thanh toán QR code</h1>
        <p>Kết nối và cấu hình các cổng thanh toán QR cho khách sạn.</p>
      </header>
      <RegistrationPanel />
      <section className={styles.connections}>
        <h2>Kết nối với cổng thanh toán</h2>
        <div className={styles.providerList}>
          {PROVIDERS.map((provider) => {
            const isEnabled = enabled.includes(provider.key);
            return (
              <label key={provider.key} className={activeKey === provider.key ? styles.activeProvider : ""}>
                <input type="checkbox" checked={isEnabled} onChange={() => toggleProvider(provider.key)} />
                <span>{provider.label}</span>
              </label>
            );
          })}
        </div>
      </section>
      {activeProvider ? (
        <ProviderForm provider={activeProvider} values={configs[activeKey]} onChange={updateConfig} />
      ) : (
        <section className={styles.emptyForm}>Chọn một cổng thanh toán để cấu hình.</section>
      )}
    </main>
  );
}

export default QrPaymentConfig;
