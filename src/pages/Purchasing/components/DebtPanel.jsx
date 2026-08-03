import { useMemo, useState } from "react";
import { Building2, DollarSign, Search } from "lucide-react";
import WarehousePagination from "../../Warehouse/components/WarehousePagination";
import EmptyState from "../../../components/EmptyState";
import { useActiveSuppliers } from "../../../context/WarehouseConfigContext";
import { formatCurrency } from "../../../utils/format";
import { paginate } from "../../../utils/pagination";
import styles from "../../Warehouse/Warehouse.module.css";

function DebtPanel() {
  const activeSuppliers = useActiveSuppliers();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // No supplier in the mock data carries an unpaid balance yet, so this
  // always renders empty — matches the reference screenshot exactly.
  const debtRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeSuppliers
      .filter((s) => (s.debt || 0) > 0)
      .filter((s) => !q || s.name.toLowerCase().includes(q));
  }, [activeSuppliers, query]);

  const pagedRows = useMemo(() => paginate(debtRows, page, pageSize), [debtRows, page, pageSize]);

  return (
    <div>
      <div className={styles.searchBar} style={{ marginBottom: 20 }}>
        <Search size={15} />
        <input
          type="text"
          placeholder="Nhà cung cấp?"
          aria-label="Tìm nhà cung cấp"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <span className={styles.thLabel}>
                    <Building2 size={14} /> Nhà cung cấp
                  </span>
                </th>
                <th>
                  <span className={styles.thLabel}>
                    <DollarSign size={14} /> Số chưa trả
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={2}>
                    <EmptyState message="Không có nợ nhà cung cấp" />
                  </td>
                </tr>
              ) : (
                pagedRows.map((s) => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td className={styles.numCell}>{formatCurrency(s.debt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <WarehousePagination
          page={page}
          pageSize={pageSize}
          total={debtRows.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}

export default DebtPanel;
