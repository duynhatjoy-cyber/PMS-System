import { useState } from "react";
import { BedDouble } from "lucide-react";
import { formatCurrency, formatDMYShort, formatTime } from "../../../utils/format";
import { PREVIEW_BOOKING, SOURCES_BY_GROUP } from "../../../data/bookingConfigData";
import { sourceAvatar } from "../sourceAvatar";

const OTA_NAMES = SOURCES_BY_GROUP.ota.map((s) => s.name);

// Booking card mẫu dùng chung cho 2 panel "Thông tin hiển thị" và "Màu đặt
// phòng" — sống theo `fields` để người dùng thấy ngay mỗi lựa chọn đổi gì.
function BookingCardPreview({ styles, fields }) {
  const [sourceName, setSourceName] = useState(OTA_NAMES[1] || OTA_NAMES[0]);
  const b = PREVIEW_BOOKING;
  const avatar = sourceAvatar(sourceName);

  let guestLine = b.guestName;
  if (fields.guestDisplay === "gender") guestLine += ` (${b.gender})`;
  if (fields.showSegment) guestLine += ` - ${b.segment}`;

  const priceValue =
    fields.priceDisplay === "lastNight"
      ? b.price.lastNight
      : fields.priceDisplay === "total"
      ? b.price.total
      : b.price.firstNight;

  const timeLine =
    fields.timeDisplay === "duration"
      ? `Ở ${b.nights} đêm`
      : `${formatDMYShort(b.checkIn)} ${formatTime(b.checkIn)} → ${formatDMYShort(b.checkOut)} ${formatTime(b.checkOut)}`;

  const metaParts = [b.roomType, `${b.nights} đêm`];
  if (fields.showSourceGroup) metaParts.push("Nguồn OTA");

  return (
    <div className={styles.previewCard}>
      <div className={styles.previewHeadRow}>
        <div>
          <div className={styles.previewLabel}>Xem trước booking card</div>
          <div className={styles.previewHint}>
            Khi thêm logo OTA, nhân viên có thể nhận biết nguồn booking nhanh hơn.
          </div>
        </div>
        <select
          className={styles.previewSourceSelect}
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
        >
          {OTA_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.previewStage}>
        <div className={styles.bookingCard}>
          <div className={styles.cardCode} style={{ background: "var(--fd-navy)" }}>
            <span className={styles.cardCodeRoomType}>{b.roomType}</span>
            <span className={styles.cardCodeRoomNum}>{b.room}</span>
            <BedDouble size={14} />
          </div>

          <div className={styles.cardBody}>
            <div className={styles.cardTopRow}>
              <span className={styles.cardSourceBadge} style={{ background: avatar.color }}>
                {avatar.letters} {sourceName}
              </span>
              <span className={styles.cardStatusBadge}>Đã đặt</span>
            </div>

            <div className={styles.cardGuestRow}>
              {fields.guestDisplay === "nationality" && (
                <span className={styles.cardFlag} title="Việt Nam">
                  VN
                </span>
              )}
              <span>{guestLine}</span>
            </div>

            <div className={styles.cardMetaLine}>{timeLine}</div>
            <div className={styles.cardMetaLine}>{metaParts.join(" · ")}</div>

            <div className={styles.cardPrice}>{formatCurrency(priceValue)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingCardPreview;
