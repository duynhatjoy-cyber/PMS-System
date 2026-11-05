import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  STAFF_LIST,
  PAYMENT_METHODS,
  SUB_SYSTEMS,
} from "../data/shiftHandoverData";
import styles from "../ShiftHandover.module.css";

function formatMoney(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "0";
  return Number(amount).toLocaleString("vi-VN");
}

export default function ShiftPaymentsTab({
  shiftInfo,
  transactions,
  selectedStaff,
  onChangeStaff,
  selectedMethod,
  onChangeMethod,
  selectedSubSystem,
  onChangeSubSystem,
}) {
  const [isTxExpanded, setIsTxExpanded] = useState(true);

  // Filter transactions
  const filteredList = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedStaff !== "all" && tx.cashier !== selectedStaff) {
        return false;
      }
      if (selectedMethod !== "all" && tx.method !== selectedMethod) {
        return false;
      }
      if (selectedSubSystem !== "all" && tx.subSystem !== selectedSubSystem) {
        return false;
      }
      return true;
    });
  }, [transactions, selectedStaff, selectedMethod, selectedSubSystem]);

  // Aggregate stats by Cashier
  const summaryByCashier = useMemo(() => {
    const map = {};
    filteredList.forEach((tx) => {
      const c = tx.cashier || "Khác";
      if (!map[c]) {
        map[c] = { cashier: c, totalIn: 0, totalOut: 0 };
      }
      if (tx.type === "out") {
        map[c].totalOut += tx.amount;
      } else {
        map[c].totalIn += tx.amount;
      }
    });

    // If no transactions, fall back to current shift cashier
    if (Object.keys(map).length === 0) {
      map[shiftInfo.cashier || "Thư Võ"] = {
        cashier: shiftInfo.cashier || "Thư Võ",
        totalIn: 0,
        totalOut: 0,
      };
    }

    return Object.values(map);
  }, [filteredList, shiftInfo.cashier]);

  // Aggregate stats by Payment Method
  const summaryByMethod = useMemo(() => {
    const map = {};
    filteredList.forEach((tx) => {
      const m = tx.method || "Chưa rõ";
      if (!map[m]) map[m] = 0;
      map[m] += tx.type === "out" ? -tx.amount : tx.amount;
    });
    return Object.entries(map).map(([method, amount]) => ({ method, amount }));
  }, [filteredList]);

  // Total income calculated
  const totalIncome = useMemo(() => {
    return filteredList.reduce((sum, tx) => {
      return sum + (tx.type === "out" ? -tx.amount : tx.amount);
    }, 0);
  }, [filteredList]);

  const totalExpense = useMemo(() => {
    return filteredList.reduce((sum, tx) => {
      return sum + (tx.type === "out" ? tx.amount : 0);
    }, 0);
  }, [filteredList]);

  return (
    <div className={styles.shiftPayContainer}>
      {/* 1. FILTER CONTROLS BAR */}
      <div className={styles.filterBar}>
        <div className={styles.shiftBadge}>{shiftInfo.shiftCode}</div>

        <div className={styles.filterDropdownGroup}>
          <span className={styles.dropdownLabel}>Nhân viên</span>
          <select
            className={styles.selectDropdown}
            value={selectedStaff}
            onChange={(e) => onChangeStaff(e.target.value)}
          >
            {STAFF_LIST.map((staff) => (
              <option key={staff.id} value={staff.id === "all" ? "all" : staff.name}>
                {staff.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterDropdownGroup}>
          <span className={styles.dropdownLabel}>Hình thức TT</span>
          <select
            className={styles.selectDropdown}
            value={selectedMethod}
            onChange={(e) => onChangeMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterDropdownGroup}>
          <span className={styles.dropdownLabel}>Phân hệ</span>
          <select
            className={styles.selectDropdown}
            value={selectedSubSystem}
            onChange={(e) => onChangeSubSystem(e.target.value)}
          >
            {SUB_SYSTEMS.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. THREE SUMMARY TABLES */}
      <div className={styles.summaryTablesGrid}>
        {/* Table 1: Theo người thu tiền */}
        <div>
          <table className={styles.miniTable}>
            <thead>
              <tr>
                <th>Người thu tiền</th>
                <th className={styles.numCol}>Khoản thu (VND)</th>
                <th className={styles.numCol}>Khoản chi (VND)</th>
                <th className={styles.numCol}>Tổng doanh thu (VND)</th>
              </tr>
            </thead>
            <tbody>
              {summaryByCashier.map((item) => (
                <tr key={item.cashier}>
                  <td>{item.cashier}</td>
                  <td className={`${styles.numCol} ${styles.greenMoney}`}>
                    {item.totalIn > 0 ? formatMoney(item.totalIn) : "0"}
                  </td>
                  <td className={`${styles.numCol} ${styles.zeroMoney}`}>
                    {item.totalOut > 0 ? formatMoney(item.totalOut) : "0"}
                  </td>
                  <td className={`${styles.numCol}`} style={{ fontWeight: 600 }}>
                    {formatMoney(item.totalIn - item.totalOut)}
                  </td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td>Tổng (VND)</td>
                <td className={`${styles.numCol} ${styles.greenMoney}`}>
                  {formatMoney(totalIncome + totalExpense)}
                </td>
                <td className={`${styles.numCol} ${styles.zeroMoney}`}>
                  {formatMoney(totalExpense)}
                </td>
                <td className={styles.numCol}>{formatMoney(totalIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table 2: Theo phương thức thanh toán */}
        <div>
          <table className={styles.miniTable}>
            <thead>
              <tr>
                <th>Phương thức thanh toán</th>
                <th className={styles.numCol}>Tổng doanh thu (VND)</th>
              </tr>
            </thead>
            <tbody>
              {summaryByMethod.length === 0 ? (
                <tr>
                  <td>Chưa có giao dịch</td>
                  <td className={styles.numCol}>0</td>
                </tr>
              ) : (
                summaryByMethod.map((row) => (
                  <tr key={row.method}>
                    <td>{row.method}</td>
                    <td className={styles.numCol}>{formatMoney(row.amount)}</td>
                  </tr>
                ))
              )}
              <tr className={styles.totalRow}>
                <td>Tổng (VND)</td>
                <td className={styles.numCol}>{formatMoney(totalIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table 3: Theo tiền tệ */}
        <div>
          <table className={styles.miniTable}>
            <thead>
              <tr>
                <th>Tiền tệ</th>
                <th className={styles.numCol}>Tổng doanh thu (VND)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>VND</td>
                <td className={styles.numCol}>{formatMoney(totalIncome)}</td>
              </tr>
              <tr className={styles.totalRow}>
                <td>Tổng (VND)</td>
                <td className={styles.numCol}>{formatMoney(totalIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. DETAILED TRANSACTIONS TABLE */}
      <div className={styles.txTableCard}>
        <div
          className={styles.txGroupHeader}
          onClick={() => setIsTxExpanded(!isTxExpanded)}
          title="Nhấn để thu gọn / mở rộng"
        >
          {isTxExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span>Khoản thu</span>
          <span className={styles.txGroupTotal}>
            Tổng: {formatMoney(totalIncome)} VND
          </span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b", fontWeight: 400 }}>
            {filteredList.length} giao dịch
          </span>
        </div>

        {isTxExpanded && (
          <div className={styles.tableWrap}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>#Ph...</th>
                  <th>Tên p...</th>
                  <th>Tên khách</th>
                  <th>#Thanh toá...</th>
                  <th>Nội dung</th>
                  <th className={styles.numCol}>Số tiền</th>
                  <th>Hình thức TT</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>
                      Không có giao dịch thanh toán nào phù hợp với bộ lọc
                    </td>
                  </tr>
                ) : (
                  filteredList.map((tx) => (
                    <tr key={tx.id}>
                      <td className={styles.codeCell}>{tx.bookingCode}</td>
                      <td className={styles.roomCellBadge}>{tx.room}</td>
                      <td className={styles.guestCell}>{tx.guest}</td>
                      <td className={styles.codeCell}>{tx.paymentCode}</td>
                      <td style={{ color: "#475569" }}>{tx.content || ""}</td>
                      <td className={`${styles.numCol}`} style={{ fontWeight: 600 }}>
                        {formatMoney(tx.amount)} VND
                      </td>
                      <td>
                        <span
                          className={`${styles.methodBadge} ${
                            tx.method === "Chuyển khoản NH"
                              ? styles.methodBank
                              : tx.method === "Công nợ"
                              ? styles.methodDebt
                              : styles.methodCash
                          }`}
                        >
                          {tx.method}
                        </span>
                      </td>
                      <td className={styles.timeCell}>{tx.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
