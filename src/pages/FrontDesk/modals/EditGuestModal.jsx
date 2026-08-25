import { useRef, useState } from "react";
import { CloudUpload, Plus, User, X } from "lucide-react";
import SlidePanelShell from "./SlidePanelShell";
import shared from "./shared.module.css";
import styles from "./EditGuestModal.module.css";

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/bmp"];

function emptyGuest(name = "") {
  return {
    id: `g-${Math.round(Math.random() * 1e9)}`,
    name,
    gender: "male",
    phone: "",
    email: "",
    dob: "",
    nationality: "",
    idNumber: "",
    passport: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    stayReason: "",
    note: "",
    photos: [],
  };
}

function EditGuestModal({ booking, initialSelectedId, onClose, onSave }) {
  const [guests, setGuests] = useState(() => {
    const existing = booking.guests && booking.guests.length > 0 ? booking.guests : [booking.guest];
    return existing.map((g, index) => ({
      ...emptyGuest(g.name),
      id: g.id || `g-${Math.round(Math.random() * 1e9)}`,
      isPrimary: index === 0,
    }));
  });
  const [selectedId, setSelectedId] = useState(initialSelectedId || guests[0]?.id);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const selected = guests.find((g) => g.id === selectedId) || guests[0];

  function updateSelected(patch) {
    setGuests((prev) => prev.map((g) => (g.id === selected.id ? { ...g, ...patch } : g)));
  }

  function addGuest() {
    const next = { ...emptyGuest(""), isPrimary: false };
    setGuests((prev) => [...prev, next]);
    setSelectedId(next.id);
  }

  function removeGuest(id) {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    if (selectedId === id) setSelectedId(guests[0]?.id);
  }

  function handleFilesSelected(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const room = MAX_PHOTOS - (selected.photos?.length || 0);
    if (room <= 0) {
      setUploadError(`Chỉ được tải tối đa ${MAX_PHOTOS} ảnh`);
      return;
    }

    const accepted = [];
    let rejected = false;
    for (const file of files.slice(0, room)) {
      if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_PHOTO_SIZE) {
        rejected = true;
        continue;
      }
      accepted.push({ id: `ph-${Math.round(Math.random() * 1e9)}`, url: URL.createObjectURL(file), name: file.name });
    }

    setUploadError(
      rejected ? "Một số ảnh không hợp lệ (chỉ nhận png, jpg, jpeg, bmp dưới 2MB)" : ""
    );
    if (accepted.length > 0) {
      updateSelected({ photos: [...(selected.photos || []), ...accepted] });
    }
  }

  function removePhoto(photoId) {
    updateSelected({ photos: (selected.photos || []).filter((p) => p.id !== photoId) });
  }

  return (
    <SlidePanelShell
      title="Sửa khách"
      onClose={onClose}
      width={showUpload ? 1180 : 780}
      footer={
        <>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            onClick={() => onSave(guests)}
          >
            Lưu
          </button>
        </>
      }
    >
      <div className={styles.header}>
        <span className={styles.roomName}>
          {booking.roomType} {booking.room}
        </span>
        <span className={styles.count}>
          <User size={13} /> {guests.length}
        </span>
        <button
          type="button"
          className={`${styles.uploadToggle} ${showUpload ? styles.uploadToggleActive : ""}`}
          onClick={() => setShowUpload((v) => !v)}
          title="Tải ảnh giấy tờ"
        >
          <CloudUpload size={16} />
        </button>
      </div>

      <div className={`${styles.body} ${showUpload ? styles.bodyWithUpload : ""}`}>
        <div className={styles.guestList}>
          {guests.map((g) => (
            <div
              key={g.id}
              className={`${styles.guestItem} ${selected?.id === g.id ? styles.guestItemActive : ""}`}
              onClick={() => setSelectedId(g.id)}
            >
              <span>{g.name || "Guest"}</span>
              {!g.isPrimary && (
                <button
                  type="button"
                  className={styles.removeGuest}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeGuest(g.id);
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
          <button type="button" className={styles.addGuest} onClick={addGuest}>
            <Plus size={14} /> Thêm khách
          </button>
        </div>

        {selected && (
          <div className={styles.form}>
            <div className={shared.field}>
              <span className={shared.label}>Tên khách hàng</span>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  className={shared.input}
                  value={selected.name}
                  onChange={(e) => updateSelected({ name: e.target.value })}
                  style={{ flex: 1 }}
                />
                <label style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 13 }}>
                  <input
                    type="radio"
                    checked={selected.gender === "male"}
                    onChange={() => updateSelected({ gender: "male" })}
                  />
                  Nam
                </label>
                <label style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 13 }}>
                  <input
                    type="radio"
                    checked={selected.gender === "female"}
                    onChange={() => updateSelected({ gender: "female" })}
                  />
                  Nữ
                </label>
              </div>
            </div>

            <div className={shared.row}>
              <div className={shared.field}>
                <span className={shared.label}>Di động</span>
                <input
                  className={shared.input}
                  value={selected.phone}
                  onChange={(e) => updateSelected({ phone: e.target.value })}
                />
              </div>
              <div className={shared.field}>
                <span className={shared.label}>Email</span>
                <input
                  className={shared.input}
                  value={selected.email}
                  onChange={(e) => updateSelected({ email: e.target.value })}
                />
              </div>
            </div>

            <div className={shared.row}>
              <div className={shared.field}>
                <span className={shared.label}>Ngày sinh</span>
                <input
                  type="date"
                  className={shared.input}
                  value={selected.dob}
                  onChange={(e) => updateSelected({ dob: e.target.value })}
                />
              </div>
              <div className={shared.field}>
                <span className={shared.label}>Quốc tịch</span>
                <input
                  className={shared.input}
                  value={selected.nationality}
                  onChange={(e) => updateSelected({ nationality: e.target.value })}
                />
              </div>
            </div>

            <div className={shared.row}>
              <div className={shared.field}>
                <span className={shared.label}>ID</span>
                <input
                  className={shared.input}
                  value={selected.idNumber}
                  onChange={(e) => updateSelected({ idNumber: e.target.value })}
                />
              </div>
              <div className={shared.field}>
                <span className={shared.label}>Passport</span>
                <input
                  className={shared.input}
                  value={selected.passport}
                  onChange={(e) => updateSelected({ passport: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.threeCol}>
              <div className={shared.field}>
                <span className={shared.label}>Tỉnh/Thành Phố</span>
                <input
                  className={shared.input}
                  value={selected.province}
                  onChange={(e) => updateSelected({ province: e.target.value })}
                />
              </div>
              <div className={shared.field}>
                <span className={shared.label}>Quận/Huyện</span>
                <input
                  className={shared.input}
                  value={selected.district}
                  onChange={(e) => updateSelected({ district: e.target.value })}
                />
              </div>
              <div className={shared.field}>
                <span className={shared.label}>Phường/Xã</span>
                <input
                  className={shared.input}
                  value={selected.ward}
                  onChange={(e) => updateSelected({ ward: e.target.value })}
                />
              </div>
            </div>

            <div className={shared.field}>
              <span className={shared.label}>Địa chỉ</span>
              <input
                className={shared.input}
                value={selected.address}
                onChange={(e) => updateSelected({ address: e.target.value })}
              />
            </div>

            <div className={shared.field}>
              <span className={shared.label}>Lý do lưu trú</span>
              <input
                className={shared.input}
                value={selected.stayReason}
                onChange={(e) => updateSelected({ stayReason: e.target.value })}
              />
            </div>

            <div className={shared.field}>
              <span className={shared.label}>Ghi chú</span>
              <textarea
                className={shared.textarea}
                value={selected.note}
                onChange={(e) => updateSelected({ note: e.target.value })}
              />
            </div>
          </div>
        )}

        {showUpload && selected && (
          <div className={styles.uploadPanel}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(",")}
              className={styles.uploadInput}
              onChange={(e) => {
                handleFilesSelected(e.target.files);
                e.target.value = "";
              }}
            />

            {(selected.photos || []).length > 0 && (
              <div className={styles.uploadGrid}>
                {selected.photos.map((photo) => (
                  <div key={photo.id} className={styles.uploadThumb}>
                    <img src={photo.url} alt={photo.name} />
                    <button
                      type="button"
                      className={styles.uploadThumbRemove}
                      onClick={() => removePhoto(photo.id)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(selected.photos || []).length < MAX_PHOTOS && (
              <button
                type="button"
                className={styles.uploadDropzone}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilesSelected(e.dataTransfer.files);
                }}
              >
                <CloudUpload size={28} />
                <span>
                  Hỗ trợ ảnh png, jpg, jpeg, bmp và dưới 2MB. Tối đa {MAX_PHOTOS} ảnh
                </span>
              </button>
            )}

            {uploadError && <div className={styles.uploadError}>{uploadError}</div>}
          </div>
        )}
      </div>
    </SlidePanelShell>
  );
}

export default EditGuestModal;
