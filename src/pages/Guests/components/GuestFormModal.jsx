import { useRef, useState } from "react";
import { CloudUpload, X } from "lucide-react";
import shared from "../../FrontDesk/modals/shared.module.css";
import TierBadge from "./TierBadge";
import { NATIONALITIES } from "../../../data/guestData";
import { getGuestGroups } from "../../../data/groupData";
import styles from "./GuestFormModal.module.css";

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/bmp"];

function emptyGuest() {
  return {
    name: "",
    nameOnId: "",
    gender: "male",
    dob: "",
    nationality: "Việt Nam",
    idNumber: "",
    passport: "",
    email: "",
    phone: "",
    address: "",
    note: "",
    stayCount: 0,
    photos: [],
  };
}

function GuestFormModal({ guest, onClose, onSave }) {
  const [form, setForm] = useState(() => ({ ...emptyGuest(), ...guest }));
  const [showUpload, setShowUpload] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  function patch(fields) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  function handleFilesSelected(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    const room = MAX_PHOTOS - (form.photos?.length || 0);
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

    setUploadError(rejected ? "Một số ảnh không hợp lệ (chỉ nhận png, jpg, jpeg, bmp dưới 2MB)" : "");
    if (accepted.length > 0) patch({ photos: [...(form.photos || []), ...accepted] });
  }

  function removePhoto(photoId) {
    patch({ photos: (form.photos || []).filter((p) => p.id !== photoId) });
  }

  const canSave = form.name.trim().length > 0 && form.nationality.trim().length > 0;
  const guestGroups = form.id ? getGuestGroups(form.id) : [];

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={styles.panel} style={{ width: showUpload ? "min(980px, 100%)" : "min(720px, 100%)" }}>
        <div className={styles.head}>
          <h2 className={styles.title}>{guest ? "Sửa khách" : "Thêm khách mới"}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} title="Đóng" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className={styles.panelBody}>
      <div className={styles.uploadToggleRow}>
        <button
          type="button"
          className={`${styles.uploadToggle} ${showUpload ? styles.uploadToggleActive : ""}`}
          onClick={() => setShowUpload((v) => !v)}
        >
          <CloudUpload size={15} /> Ảnh giấy tờ
        </button>
      </div>

      <div className={`${styles.body} ${showUpload ? styles.bodyWithUpload : ""}`}>
        <div className={styles.form}>
          <div className={shared.row}>
            <div className={shared.field}>
              <span className={shared.label}>Tên khách *</span>
              <input className={shared.input} value={form.name} onChange={(e) => patch({ name: e.target.value })} />
            </div>
            <div className={shared.field}>
              <span className={shared.label}>Tên trên CMND/Hộ chiếu</span>
              <input
                className={shared.input}
                value={form.nameOnId}
                onChange={(e) => patch({ nameOnId: e.target.value })}
              />
            </div>
          </div>

          <div className={shared.row}>
            <div className={shared.field}>
              <span className={shared.label}>Giới tính</span>
              <div className={styles.genderRow}>
                <label className={styles.genderOption}>
                  <input
                    type="radio"
                    checked={form.gender === "male"}
                    onChange={() => patch({ gender: "male" })}
                  />
                  Nam
                </label>
                <label className={styles.genderOption}>
                  <input
                    type="radio"
                    checked={form.gender === "female"}
                    onChange={() => patch({ gender: "female" })}
                  />
                  Nữ
                </label>
              </div>
            </div>
            <div className={shared.field}>
              <span className={shared.label}>Ngày sinh</span>
              <input type="date" className={shared.input} value={form.dob} onChange={(e) => patch({ dob: e.target.value })} />
            </div>
          </div>

          <div className={shared.row}>
            <div className={shared.field}>
              <span className={shared.label}>Quốc tịch *</span>
              <select
                className={shared.select}
                value={form.nationality}
                onChange={(e) => patch({ nationality: e.target.value })}
              >
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className={shared.field}>
              <span className={shared.label}>SĐT</span>
              <input className={shared.input} value={form.phone} onChange={(e) => patch({ phone: e.target.value })} />
            </div>
          </div>

          <div className={shared.row}>
            <div className={shared.field}>
              <span className={shared.label}>Số CMND</span>
              <input className={shared.input} value={form.idNumber} onChange={(e) => patch({ idNumber: e.target.value })} />
            </div>
            <div className={shared.field}>
              <span className={shared.label}>Hộ chiếu</span>
              <input className={shared.input} value={form.passport} onChange={(e) => patch({ passport: e.target.value })} />
            </div>
          </div>

          <div className={shared.field}>
            <span className={shared.label}>Email</span>
            <input className={shared.input} value={form.email} onChange={(e) => patch({ email: e.target.value })} />
          </div>

          <div className={shared.field}>
            <span className={shared.label}>Địa chỉ</span>
            <input className={shared.input} value={form.address} onChange={(e) => patch({ address: e.target.value })} />
          </div>

          <div className={shared.field}>
            <span className={shared.label}>Số lần lưu trú</span>
            <div className={styles.tierPreviewRow}>
              <input
                type="number"
                min={0}
                className={shared.input}
                style={{ width: 100 }}
                value={form.stayCount}
                onChange={(e) => patch({ stayCount: Math.max(0, Number(e.target.value) || 0) })}
              />
              <TierBadge stayCount={form.stayCount} />
              <span className={styles.tierPreviewLabel}>Hạng được tính tự động theo số lần lưu trú</span>
            </div>
          </div>

          {form.id && (
            <div className={shared.field}>
              <span className={shared.label}>Nhóm đã tham gia</span>
              {guestGroups.length === 0 ? (
                <span className={styles.tierPreviewLabel}>Khách lẻ — chưa từng thuộc đoàn nào.</span>
              ) : (
                <div className={styles.groupChipRow}>
                  {guestGroups.map((g) => (
                    <span key={g.id} className={styles.groupChip}>
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={shared.field}>
            <span className={shared.label}>Ghi chú</span>
            <textarea className={shared.textarea} value={form.note} onChange={(e) => patch({ note: e.target.value })} />
          </div>
        </div>

        {showUpload && (
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

            {(form.photos || []).length > 0 && (
              <div className={styles.uploadGrid}>
                {form.photos.map((photo) => (
                  <div key={photo.id} className={styles.uploadThumb}>
                    <img src={photo.url} alt={photo.name} />
                    <button type="button" className={styles.uploadThumbRemove} onClick={() => removePhoto(photo.id)}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(form.photos || []).length < MAX_PHOTOS && (
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
                <CloudUpload size={26} />
                <span>Hỗ trợ ảnh png, jpg, jpeg, bmp và dưới 2MB. Tối đa {MAX_PHOTOS} ảnh</span>
              </button>
            )}

            {uploadError && <div className={styles.uploadError}>{uploadError}</div>}
          </div>
        )}
      </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={`${shared.btn} ${shared.btnSecondary}`} onClick={onClose}>
            Huỷ
          </button>
          <button
            type="button"
            className={`${shared.btn} ${shared.btnPrimary}`}
            disabled={!canSave}
            onClick={() => onSave(form)}
          >
            Lưu
          </button>
        </div>
      </aside>
    </div>
  );
}

export default GuestFormModal;
