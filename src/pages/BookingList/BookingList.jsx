import { useEffect, useMemo, useRef, useState } from "react";
import {
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  Globe,
  LogIn,
  LogOut,
  MoreHorizontal,
  Plane,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { generateAllBookings } from "../../data/bookingListData";
import Toast from "../FrontDesk/components/Toast";
import styles from "./BookingList.module.css";

function BookingList() {
  const [bookings, setBookings] = useState(() => generateAllBookings());
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const menuRef = useRef(null);

  // Đóng menu 3 chấm khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lọc dữ liệu theo tìm kiếm và bộ lọc
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        !searchQuery ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone.includes(searchQuery);

      const matchStatus =
        statusFilter === "all" || b.status === statusFilter;

      const matchSource =
        sourceFilter === "all" || b.source === sourceFilter;

      return matchSearch && matchStatus && matchSource;
    });
  }, [bookings, searchQuery, statusFilter, sourceFilter]);

  // Phân trang
  const totalItems = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

  // Checkbox Select All trên trang hiện tại
  const isAllCurrentSelected =
    paginatedBookings.length > 0 &&
    paginatedBookings.every((b) => selectedIds.includes(b.code));

  function handleToggleSelectAll() {
    if (isAllCurrentSelected) {
      const pageCodes = paginatedBookings.map((b) => b.code);
      setSelectedIds((prev) => prev.filter((code) => !pageCodes.includes(code)));
    } else {
      const pageCodes = paginatedBookings.map((b) => b.code);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageCodes])));
    }
  }

  function handleToggleSelect(code) {
    setSelectedIds((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  // Thao tác với từng booking
  function handleStatusChange(code, newStatus, message) {
    setBookings((prev) =>
      prev.map((b) => (b.code === code ? { ...b, status: newStatus } : b))
    );
    setActiveMenuId(null);
    if (detailBooking && detailBooking.code === code) {
      setDetailBooking((prev) => ({ ...prev, status: newStatus }));
    }
    setToastMsg(message);
  }

  // Thao tác hàng loạt
  function handleBulkCheckIn() {
    setBookings((prev) =>
      prev.map((b) => (selectedIds.includes(b.code) ? { ...b, status: "checked_in" } : b))
    );
    setToastMsg(`Đã nhận phòng cho ${selectedIds.length} đặt phòng được chọn`);
    setSelectedIds([]);
  }

  function handleBulkCancel() {
    setBookings((prev) =>
      prev.map((b) => (selectedIds.includes(b.code) ? { ...b, status: "cancelled" } : b))
    );
    setToastMsg(`Đã hủy ${selectedIds.length} đặt phòng được chọn`);
    setSelectedIds([]);
  }

  function handleRefresh() {
    setSearchQuery("");
    setStatusFilter("all");
    setSourceFilter("all");
    setPage(1);
    setSelectedIds([]);
    setToastMsg("Đã làm mới danh sách đặt phòng");
  }

  // Render Nguồn (Source) khớp hình ảnh mẫu
  function renderSource(source) {
    if (source === "Agoda") {
      return (
        <span className={styles.sourceCell}>
          <span className={styles.sourceLogoAgoda} title="Agoda">
            <span className={styles.agodaDot} style={{ backgroundColor: "#ef4444" }} />
            <span className={styles.agodaDot} style={{ backgroundColor: "#f59e0b" }} />
            <span className={styles.agodaDot} style={{ backgroundColor: "#10b981" }} />
            <span className={styles.agodaDot} style={{ backgroundColor: "#3b82f6" }} />
            <span className={styles.agodaDot} style={{ backgroundColor: "#8b5cf6" }} />
          </span>
          Agoda
        </span>
      );
    }
    if (source === "Booking.com") {
      return (
        <span className={styles.sourceCell}>
          <span className={styles.sourceBadgeBooking} title="Booking.com">
            B.
          </span>
          Booking.com
        </span>
      );
    }
    if (source === "Airbnb") {
      return (
        <span className={styles.sourceCell}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF5A5F" title="Airbnb">
            <path d="M12 2C8.5 2 6.5 5 7.5 9.5c1 4.5 4.5 9.5 4.5 9.5s3.5-5 4.5-9.5C17.5 5 15.5 2 12 2zm0 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
          </svg>
          Airbnb
        </span>
      );
    }
    if (source === "Direct") {
      return (
        <span className={styles.sourceCell}>
          <Globe size={16} color="#2563eb" />
          Direct
        </span>
      );
    }
    if (source === "Travel Agent") {
      return (
        <span className={styles.sourceCell}>
          <Plane size={16} color="#2563eb" />
          Travel Agent
        </span>
      );
    }
    if (source === "MICE") {
      return (
        <span className={styles.sourceCell}>
          <Users size={16} color="#2563eb" />
          MICE
        </span>
      );
    }
    return <span className={styles.sourceCell}>{source || "—"}</span>;
  }

  // Render Trạng thái khớp hình ảnh mẫu
  function renderStatusBadge(status) {
    if (status === "checked_in") {
      return (
        <span className={`${styles.statusBadge} ${styles.statusInHouse}`}>
          <span className={styles.dotGreen} /> Đã nhận phòng
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span className={`${styles.statusBadge} ${styles.statusPending}`}>
          <Clock size={13} color="#ea580c" /> Đang chờ
        </span>
      );
    }
    if (status === "reserved") {
      return (
        <span className={`${styles.statusBadge} ${styles.statusReserved}`}>
          <span className={styles.dotBlue} /> Đặt trước
        </span>
      );
    }
    if (status === "cancelled") {
      return (
        <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>
          <Ban size={13} color="#64748b" /> Đã hủy
        </span>
      );
    }
    return <span className={styles.statusBadge}>—</span>;
  }

  // Tạo các số trang hiển thị
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className={styles.page}>
      {/* Tiêu đề & các thao tác đầu trang */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Danh sách đặt phòng</h1>
          <p className={styles.subtitle}>
            Quản lý, theo dõi và tìm kiếm các lượt đặt phòng trong hệ thống.
          </p>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.iconBtn}
            title="Làm mới"
            onClick={handleRefresh}
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setToastMsg("Chức năng xuất báo cáo Excel")}
          >
            <Download size={15} /> Xuất file
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => window.print()}
          >
            <Printer size={15} /> In danh sách
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => setToastMsg("Chuyển tới màn tạo đặt phòng mới")}
          >
            <Plus size={16} /> Tạo đặt phòng
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm & bộ lọc */}
      <div className={styles.filterToolbar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo mã đặt phòng, khách hàng, số điện thoại..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="checked_in">Đã nhận phòng</option>
          <option value="pending">Đang chờ</option>
          <option value="reserved">Đặt trước</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <select
          className={styles.filterSelect}
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Tất cả nguồn</option>
          <option value="Agoda">Agoda</option>
          <option value="Booking.com">Booking.com</option>
          <option value="Airbnb">Airbnb</option>
          <option value="Direct">Direct</option>
          <option value="Travel Agent">Travel Agent</option>
          <option value="MICE">MICE</option>
        </select>
      </div>

      {/* Thanh hành động hàng loạt khi chọn checkbox */}
      {selectedIds.length > 0 && (
        <div className={styles.bulkBar}>
          <span>Đã chọn {selectedIds.length} đặt phòng</span>
          <div className={styles.bulkActions}>
            <button
              type="button"
              className={styles.bulkBtn}
              onClick={handleBulkCheckIn}
            >
              <Check size={14} /> Nhận phòng hàng loạt
            </button>
            <button
              type="button"
              className={`${styles.bulkBtn} ${styles.bulkBtnDanger}`}
              onClick={handleBulkCancel}
            >
              <Ban size={14} /> Hủy hàng loạt
            </button>
            <button
              type="button"
              className={styles.bulkBtn}
              onClick={() => setSelectedIds([])}
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Khung Bảng Danh sách - theo chuẩn mẫu ảnh media_1794998616636_8c0e0b13.png */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkCell}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={isAllCurrentSelected}
                    onChange={handleToggleSelectAll}
                    title="Chọn tất cả trên trang này"
                  />
                </th>
                <th>Mã đặt phòng</th>
                <th>Khách hàng</th>
                <th>Nguồn</th>
                <th>Loại phòng</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Số đêm</th>
                <th>Trạng thái</th>
                <th className={styles.actionCell}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className={styles.emptyRow}>
                    Không tìm thấy đặt phòng nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => {
                  const isSelected = selectedIds.includes(b.code);
                  const isMenuOpen = activeMenuId === b.code;

                  return (
                    <tr
                      key={b.id || b.code}
                      className={isSelected ? styles.rowSelected : ""}
                    >
                      <td className={styles.checkCell}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={isSelected}
                          onChange={() => handleToggleSelect(b.code)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.bookingCodeLink}
                          onClick={() => setDetailBooking(b)}
                          title="Xem chi tiết đặt phòng"
                        >
                          {b.code}
                        </button>
                      </td>
                      <td className={styles.guestNameCell}>{b.guestName}</td>
                      <td>{renderSource(b.source)}</td>
                      <td className={styles.roomTypeCell}>{b.roomType}</td>
                      <td className={styles.dateCell}>{b.checkIn}</td>
                      <td className={styles.dateCell}>{b.checkOut}</td>
                      <td className={styles.nightsCell}>{b.nights}</td>
                      <td>{renderStatusBadge(b.status)}</td>
                      <td className={styles.actionCell}>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${
                            isMenuOpen ? styles.actionBtnActive : ""
                          }`}
                          onClick={() =>
                            setActiveMenuId((prev) =>
                              prev === b.code ? null : b.code
                            )
                          }
                          title="Thao tác"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {/* Menu Dropdown Thao Tác */}
                        {isMenuOpen && (
                          <div className={styles.actionMenu} ref={menuRef}>
                            <button
                              type="button"
                              className={styles.menuItem}
                              onClick={() => {
                                setDetailBooking(b);
                                setActiveMenuId(null);
                              }}
                            >
                              <Eye size={15} /> Xem chi tiết
                            </button>

                            {b.status !== "checked_in" && (
                              <button
                                type="button"
                                className={styles.menuItem}
                                onClick={() =>
                                  handleStatusChange(
                                    b.code,
                                    "checked_in",
                                    `Đã nhận phòng thành công cho ${b.guestName}`
                                  )
                                }
                              >
                                <LogIn size={15} /> Nhận phòng
                              </button>
                            )}

                            {b.status === "checked_in" && (
                              <button
                                type="button"
                                className={styles.menuItem}
                                onClick={() =>
                                  handleStatusChange(
                                    b.code,
                                    "reserved",
                                    `Đã trả phòng thành công cho ${b.guestName}`
                                  )
                                }
                              >
                                <LogOut size={15} /> Trả phòng
                              </button>
                            )}

                            <button
                              type="button"
                              className={styles.menuItem}
                              onClick={() => {
                                setToastMsg(`Chỉnh sửa đặt phòng ${b.code}`);
                                setActiveMenuId(null);
                              }}
                            >
                              <Edit size={15} /> Chỉnh sửa
                            </button>

                            {b.status !== "cancelled" && (
                              <button
                                type="button"
                                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                onClick={() =>
                                  handleStatusChange(
                                    b.code,
                                    "cancelled",
                                    `Đã hủy đặt phòng ${b.code}`
                                  )
                                }
                              >
                                <Ban size={15} /> Hủy đặt phòng
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer phân trang khớp ảnh: Hiển thị [ 10 v ] / tổng 124 đặt phòng và < 1 2 3 4 5 > */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span>Hiển thị</span>
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>/ tổng {totalItems} đặt phòng</span>
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>

            {pageNumbers.map((p) => (
              <button
                key={p}
                type="button"
                className={`${styles.pageNumber} ${
                  p === currentPage ? styles.pageActive : ""
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              title="Trang tiếp"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Chi tiết Đặt phòng */}
      {detailBooking && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setDetailBooking(null)}
        >
          <div
            className={styles.detailModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2>Chi tiết đặt phòng {detailBooking.code}</h2>
                <div style={{ marginTop: 4 }}>
                  {renderStatusBadge(detailBooking.status)}
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setDetailBooking(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Khách hàng</span>
                  <span className={styles.infoValue}>
                    {detailBooking.guestName}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Số điện thoại</span>
                  <span className={styles.infoValue}>
                    {detailBooking.phone || "—"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>
                    {detailBooking.email || "—"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Nguồn đặt phòng</span>
                  <div>{renderSource(detailBooking.source)}</div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Loại phòng</span>
                  <span className={styles.infoValue}>
                    {detailBooking.roomType}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Phòng gán</span>
                  <span className={styles.infoValue}>
                    {detailBooking.room || "Chưa gán"}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ngày đến (Check-in)</span>
                  <span className={styles.infoValue}>
                    {detailBooking.checkIn}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ngày đi (Check-out)</span>
                  <span className={styles.infoValue}>
                    {detailBooking.checkOut}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Số đêm lưu trú</span>
                  <span className={styles.infoValue}>
                    {detailBooking.nights} đêm
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tổng tiền</span>
                  <span
                    className={styles.infoValue}
                    style={{ color: "#2563eb" }}
                  >
                    {new Intl.NumberFormat("vi-VN").format(
                      detailBooking.totalAmount || 0
                    )}{" "}
                    ₫
                  </span>
                </div>
              </div>

              {detailBooking.notes && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ghi chú</span>
                  <p
                    style={{
                      margin: 0,
                      padding: "8px 12px",
                      background: "#f8fafc",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      fontSize: "13px",
                      color: "#334155",
                    }}
                  >
                    {detailBooking.notes}
                  </p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              {detailBooking.status !== "checked_in" && (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() =>
                    handleStatusChange(
                      detailBooking.code,
                      "checked_in",
                      `Đã nhận phòng thành công cho ${detailBooking.guestName}`
                    )
                  }
                >
                  <LogIn size={15} /> Nhận phòng
                </button>
              )}
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setDetailBooking(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thông báo Toast */}
      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}

export default BookingList;
