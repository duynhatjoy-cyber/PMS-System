import { useState } from "react";
import { Plus, Save } from "lucide-react";
import EmptyState from "../../../components/EmptyState";
import { sourceAvatar } from "../sourceAvatar";
import { SOURCE_GROUPS, SOURCES_BY_GROUP } from "../../../data/bookingConfigData";
import { createIdSequence } from "../../../utils/id";

const nextId = createIdSequence();

function blankSource(groupId) {
  return {
    id: nextId("src-draft"),
    group: groupId,
    name: "",
    locked: false,
    description: "",
    phone: "",
    email: "",
    fax: "",
    taxCode: "",
    representative: "",
    mobile: "",
    contactEmail: "",
    address: "",
    position: "",
  };
}

function SourceGroupsPanel({ styles, onToast }) {
  const [sourcesByGroup, setSourcesByGroup] = useState(SOURCES_BY_GROUP);
  const [groupId, setGroupId] = useState(SOURCE_GROUPS[0].id);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(SOURCES_BY_GROUP[SOURCE_GROUPS[0].id][0]?.id ?? null);

  const group = SOURCE_GROUPS.find((g) => g.id === groupId);
  const sources = sourcesByGroup[groupId] || [];
  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(search.trim().toLowerCase())
  );
  const selectedSource = sources.find((s) => s.id === selectedId) || null;

  function handleSelectGroup(id) {
    setGroupId(id);
    setSearch("");
    setSelectedId(sourcesByGroup[id][0]?.id ?? null);
  }

  function handleAddSource() {
    const draft = blankSource(groupId);
    setSourcesByGroup((prev) => ({ ...prev, [groupId]: [...prev[groupId], draft] }));
    setSelectedId(draft.id);
  }

  function patchSelected(key, value) {
    setSourcesByGroup((prev) => ({
      ...prev,
      [groupId]: prev[groupId].map((s) => (s.id === selectedId ? { ...s, [key]: value } : s)),
    }));
  }

  function handleSave() {
    if (!selectedSource.name.trim()) {
      onToast("Vui lòng nhập tên nguồn trước khi lưu");
      return;
    }
    onToast(`Đã lưu nguồn "${selectedSource.name}"`);
  }

  return (
    <div className={styles.main}>
      <div className={styles.panelHeaderRow}>
        <div>
          <div className={styles.panelTitle}>Nhóm nguồn</div>
          <p className={styles.panelSubtitle}>
            Quản lý các nhóm nguồn booking và hồ sơ từng kênh cụ thể trong nhóm.
          </p>
        </div>
      </div>

      <div className={styles.threeCol}>
        <div className={styles.groupCol}>
          <div className={styles.listCard}>
            <div className={styles.listCardHead}>Nhóm nguồn</div>
            {SOURCE_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`${styles.groupItem} ${g.id === groupId ? styles.groupItemActive : ""}`}
                onClick={() => handleSelectGroup(g.id)}
              >
                <div className={styles.groupItemTitle}>{g.label}</div>
                <div className={styles.groupItemDesc}>{g.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.sourceCol}>
          <div className={styles.listCard}>
            <div className={styles.listCardHead}>Nguồn ({sources.length})</div>
            <div className={styles.sourceToolbar}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={`Lọc nguồn trong ${group.label}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="button" className={styles.addSourceBtn} onClick={handleAddSource}>
                <Plus size={14} /> Thêm {group.itemLabel}
              </button>
            </div>

            <div className={styles.sourceScroll}>
              {filteredSources.length === 0 ? (
                <EmptyState
                  message={sources.length === 0 ? "Chưa có nguồn nào trong nhóm này" : "Không tìm thấy nguồn phù hợp"}
                  hint={sources.length === 0 ? `Nhấn "+ Thêm ${group.itemLabel}" để khai báo nguồn đầu tiên.` : undefined}
                />
              ) : (
                filteredSources.map((s) => {
                  const avatar = sourceAvatar(s.name || "?");
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`${styles.sourceRow} ${s.id === selectedId ? styles.sourceRowActive : ""}`}
                      onClick={() => setSelectedId(s.id)}
                    >
                      <span className={styles.sourceAvatar} style={{ background: avatar.color }}>
                        {avatar.letters}
                      </span>
                      <span className={styles.sourceName}>{s.name || "Nguồn mới"}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className={styles.detailCol}>
          <div className={styles.detailCard}>
            {!selectedSource ? (
              <EmptyState message="Chọn một nguồn ở danh sách bên trái để xem chi tiết" />
            ) : (
              <>
                <div className={styles.detailTitle}>Chi tiết công ty</div>
                <p className={styles.banner}>
                  Mã nguồn và tên nguồn được cố định để đồng bộ filter booking. Khách sạn có thể điền
                  thêm số điện thoại, email hoặc thông tin liên hệ của kênh.
                </p>

                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Mã nguồn / Mã công ty *</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.name}
                      disabled={selectedSource.locked}
                      placeholder="Nhập mã công ty"
                      onChange={(e) => patchSelected("name", e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Người đại diện</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.representative}
                      onChange={(e) => patchSelected("representative", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Tên nguồn / Tên công ty *</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.name}
                      disabled={selectedSource.locked}
                      placeholder="Nhập tên công ty"
                      onChange={(e) => patchSelected("name", e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Số di động</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.mobile}
                      onChange={(e) => patchSelected("mobile", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Số điện thoại</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.phone}
                      placeholder="Số điện thoại của kênh (nếu có)"
                      onChange={(e) => patchSelected("phone", e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Email liên hệ</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.contactEmail}
                      onChange={(e) => patchSelected("contactEmail", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Email</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.email}
                      placeholder="Email của kênh (nếu có)"
                      onChange={(e) => patchSelected("email", e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Địa chỉ liên hệ</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.address}
                      onChange={(e) => patchSelected("address", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Số Fax</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.fax}
                      onChange={(e) => patchSelected("fax", e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Chức vụ</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.position}
                      onChange={(e) => patchSelected("position", e.target.value)}
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Mã số thuế</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.taxCode}
                      onChange={(e) => patchSelected("taxCode", e.target.value)}
                    />
                  </label>
                  <div />

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Mô tả</span>
                    <input
                      className={styles.fieldInput}
                      value={selectedSource.description}
                      placeholder="Mô tả"
                      onChange={(e) => patchSelected("description", e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Nhóm nguồn</span>
                    <input className={styles.fieldInput} value={group.label} disabled />
                  </label>
                </div>

                <div className={styles.actionsRow}>
                  <button type="button" className={styles.saveBtn} onClick={handleSave}>
                    <Save size={16} /> Lưu thay đổi
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SourceGroupsPanel;
