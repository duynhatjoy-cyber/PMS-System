import { useMemo, useState } from "react";
import { BedDouble, Building2, CircleHelp, Layers, PauseCircle, Pencil, PlayCircle, Plus, Trash2, X } from "lucide-react";
import { ROOMS, ROOM_TYPES } from "../../data/roomMapData";
import styles from "./RoomPriceConfig.module.css";

const typeId = (key) => key.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const initialRoomTypes = ROOM_TYPES.map((type) => {
  const typeRooms = ROOMS.filter((room) => room.typeKey === type.key);
  const floors = [...new Set(typeRooms.map((room) => room.floor))].sort((a, b) => a - b);
  return {
    id: typeId(type.key),
    code: type.key,
    name: type.label,
    kind: "room",
    adults: type.maxAdults,
    children: type.maxChildren,
    floors: floors.map((floor) => ({
      id: `${typeId(type.key)}-floor-${floor}`,
      name: `FLOOR ${floor}`,
      rooms: typeRooms.filter((room) => room.floor === floor).map((room) => room.number),
    })),
  };
});

function RoomPriceConfig() {
  const [roomTypes, setRoomTypes] = useState(initialRoomTypes);
  const [selectedId, setSelectedId] = useState(initialRoomTypes[0]?.id || null);
  const [modal, setModal] = useState(null);
  const [floorDraft, setFloorDraft] = useState("");
  const [typeDraft, setTypeDraft] = useState({ kind: "room", code: "", name: "", adults: 1, children: 0 });
  const [roomDraft, setRoomDraft] = useState("");
  const [roomAssignment, setRoomAssignment] = useState({
    roomTypeId: initialRoomTypes[0]?.id || "",
    floorId: initialRoomTypes[0]?.floors[0]?.id || "",
  });
  const [activeTab, setActiveTab] = useState("rooms");
  const [pricePolicies, setPricePolicies] = useState(() =>
    Object.fromEntries(initialRoomTypes.map((type) => [type.id, [{ id: "default", name: "DEFAULT" }]]))
  );
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [selectedPriceType, setSelectedPriceType] = useState(null);
  const [policyDraft, setPolicyDraft] = useState("");
  const [prices, setPrices] = useState({});
  const [enabledPriceTypes, setEnabledPriceTypes] = useState({});
  const [supplementRates, setSupplementRates] = useState({});

  const selected = useMemo(() => roomTypes.find((type) => type.id === selectedId), [roomTypes, selectedId]);
  const roomCount = (type) => type.floors.reduce((count, floor) => count + floor.rooms.length, 0);

  function saveType(event) {
    event.preventDefault();
    if (!typeDraft.code.trim() || !typeDraft.name.trim()) return;
    if (modal === "typeEdit" && selected) {
      setRoomTypes((items) => items.map((type) => type.id === selected.id ? { ...type, ...typeDraft, code: typeDraft.code.trim().toUpperCase(), name: typeDraft.name.trim() } : type));
      setModal(null);
      return;
    }
    const id = `${typeDraft.code}-${Date.now()}`.toLowerCase().replace(/\s+/g, "-");
    setRoomTypes((items) => [...items, { ...typeDraft, id, code: typeDraft.code.trim().toUpperCase(), name: typeDraft.name.trim(), floors: [] }]);
    setSelectedId(id);
    setModal(null);
    setTypeDraft({ kind: "room", code: "", name: "", adults: 1, children: 0 });
  }

  function openEditType() {
    if (!selected) return;
    setTypeDraft({ kind: selected.kind, code: selected.code, name: selected.name, adults: selected.adults, children: selected.children });
    setModal("typeEdit");
  }

  function togglePauseType() {
    if (!selected) return;
    setRoomTypes((items) => items.map((type) => type.id === selected.id ? { ...type, paused: !type.paused } : type));
  }

  function deleteSelectedType() {
    if (!selected) return;
    const id = selected.id;
    setRoomTypes((items) => items.filter((type) => type.id !== id));
    setPricePolicies((items) => { const next = { ...items }; delete next[id]; return next; });
    setSelectedId(null);
    setModal(null);
  }

  function addFloor(event) {
    event.preventDefault();
    const name = floorDraft.trim();
    if (!name || !selected) return;
    setRoomTypes((items) => items.map((type) => type.id === selected.id ? { ...type, floors: [...type.floors, { id: `floor-${Date.now()}`, name: name.toUpperCase(), rooms: [] }] } : type));
    setFloorDraft("");
    setModal(null);
  }

  function addRoom(event) {
    event.preventDefault();
    const name = roomDraft.trim();
    if (!name || !roomAssignment.roomTypeId || !roomAssignment.floorId) return;
    setRoomTypes((items) => items.map((type) => type.id === roomAssignment.roomTypeId ? { ...type, floors: type.floors.map((floor) => floor.id === roomAssignment.floorId ? { ...floor, rooms: [...floor.rooms, name] } : floor) } : type));
    setRoomDraft("");
    setModal(null);
  }

  function selectPriceRoom(id) {
    setSelectedId(id);
    setSelectedPolicyId(null);
    setSelectedPriceType(null);
  }

  function addPricePolicy(event) {
    event.preventDefault();
    const name = policyDraft.trim();
    if (!name || !selectedId) return;
    const policy = { id: `${name}-${Date.now()}`.toLowerCase().replace(/\s+/g, "-"), name: name.toUpperCase() };
    setPricePolicies((items) => ({ ...items, [selectedId]: [...(items[selectedId] || []), policy] }));
    setSelectedPolicyId(policy.id);
    setPolicyDraft("");
    setModal(null);
  }

  function updatePrice(field, value) {
    const key = `${selectedId}:${selectedPolicyId}:${selectedPriceType}`;
    setPrices((items) => ({ ...items, [key]: { ...(items[key] || {}), [field]: value } }));
  }

  const activePolicyKey = `${selectedId}:${selectedPolicyId}`;
  function togglePriceType(priceTypeId) {
    const current = enabledPriceTypes[activePolicyKey] || [];
    const next = current.includes(priceTypeId) ? current.filter((id) => id !== priceTypeId) : [...current, priceTypeId];
    setEnabledPriceTypes((items) => ({ ...items, [activePolicyKey]: next }));
    if (!current.includes(priceTypeId)) setSelectedPriceType(priceTypeId);
    else if (selectedPriceType === priceTypeId) setSelectedPriceType(next[0] || null);
  }

  function addSupplement(kind) {
    const key = `${selectedId}:${selectedPolicyId}:${selectedPriceType}:${kind}`;
    setSupplementRates((items) => ({ ...items, [key]: [...(items[key] || []), { id: Date.now(), time: "", amount: "" }] }));
  }

  function updateSupplement(kind, rowId, field, value) {
    const key = `${selectedId}:${selectedPolicyId}:${selectedPriceType}:${kind}`;
    setSupplementRates((items) => ({ ...items, [key]: (items[key] || []).map((row) => row.id === rowId ? { ...row, [field]: value } : row) }));
  }

  function removeSupplement(kind, rowId) {
    const key = `${selectedId}:${selectedPolicyId}:${selectedPriceType}:${kind}`;
    setSupplementRates((items) => ({ ...items, [key]: (items[key] || []).filter((row) => row.id !== rowId) }));
  }

  const currentPrice = prices[`${selectedId}:${selectedPolicyId}:${selectedPriceType}`] || {};

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <h1>Cấu hình Phòng &amp; Giá</h1>
          <p>Thiết lập loại phòng, tầng và danh sách phòng của khách sạn.</p>
        </div>
      </div>

      <div className={styles.tabs} role="tablist">
        <button className={activeTab === "rooms" ? styles.tabActive : styles.tab} onClick={() => setActiveTab("rooms")}>Phòng/giường</button>
        <button
          className={activeTab === "prices" ? styles.tabActive : styles.tab}
          onClick={() => {
            setActiveTab("prices");
            setSelectedId(null);
            setSelectedPolicyId(null);
            setSelectedPriceType(null);
          }}
        >
          Đơn giá
        </button>
      </div>

      {activeTab === "prices" ? (
        <PriceBoard roomTypes={roomTypes} roomCount={roomCount} selectedId={selectedId} onSelectRoom={selectPriceRoom} policies={pricePolicies[selectedId] || []} selectedPolicyId={selectedPolicyId} onSelectPolicy={(id) => { setSelectedPolicyId(id); setSelectedPriceType(null); }} onAddPolicy={() => setModal("pricePolicy")} selectedPriceType={selectedPriceType} enabledTypes={enabledPriceTypes[activePolicyKey] || []} onTogglePriceType={togglePriceType} value={currentPrice} onChange={updatePrice} earlyRates={supplementRates[`${activePolicyKey}:${selectedPriceType}:early`] || []} lateRates={supplementRates[`${activePolicyKey}:${selectedPriceType}:late`] || []} onAddSupplement={addSupplement} onUpdateSupplement={updateSupplement} onRemoveSupplement={removeSupplement} />
      ) : (
        <div className={styles.workspace}>
          <aside className={styles.typePanel} aria-label="Danh sách loại phòng">
            <button className={`${styles.typeCard} ${!selectedId ? styles.typeCardActive : ""}`} onClick={() => setSelectedId(null)}><span>Tất cả</span><small>{roomTypes.reduce((sum, type) => sum + roomCount(type), 0)} phòng</small></button>
            {roomTypes.map((type) => <button key={type.id} className={`${styles.typeCard} ${selectedId === type.id ? styles.typeCardActive : ""} ${type.paused ? styles.typeCardPaused : ""}`} onClick={() => setSelectedId(type.id)}><span><b>{type.code}</b>{type.name}{type.paused && <em>Tạm dừng</em>}</span><small>{roomCount(type)} phòng</small></button>)}
            <button className={styles.addType} onClick={() => { setTypeDraft({ kind: "room", code: "", name: "", adults: 1, children: 0 }); setModal("type"); }}><Plus size={16} /> Thêm loại phòng</button>
          </aside>

          <section className={styles.roomPanel}>
            {selected ? <>
              <header className={styles.roomHeader}><div><span className={styles.typeKind}>{selected.kind === "dorm" ? "Giường Dorm" : "Phòng"}</span><h2>{selected.code} <span>{selected.name}</span></h2></div><div className={styles.headerActions}><button title="Sửa loại phòng" onClick={openEditType}><Pencil size={17} /></button><button title={selected.paused ? "Tiếp tục sử dụng" : "Tạm dừng"} onClick={togglePauseType}>{selected.paused ? <PlayCircle size={18} /> : <PauseCircle size={18} />}</button><button className={styles.deleteTypeBtn} title="Xóa loại phòng" onClick={() => setModal("deleteType")}><Trash2 size={17} /></button></div></header>
              <button className={styles.addFloor} onClick={() => setModal("floor")}><Building2 size={17} /> Thêm tầng</button>
              <div className={styles.floorList}>
                {selected.floors.map((floor) => <article className={styles.floorRow} key={floor.id}><div className={styles.floorName}><Layers size={16} /> {floor.name}</div><div className={styles.roomChips}>{floor.rooms.map((room) => <span key={room} className={styles.roomChip}>{room}</span>)}<button className={styles.addRoom} onClick={() => { setRoomAssignment({ roomTypeId: selected.id, floorId: floor.id }); setModal({ name: "room" }); }}><Plus size={18} /></button></div></article>)}
                {selected.floors.length === 0 && <div className={styles.emptyState}><BedDouble size={28} /><p>Chưa có tầng nào. Hãy thêm tầng đầu tiên cho loại phòng này.</p></div>}
              </div>
            </> : (
              <>
                <header className={styles.roomHeader}>
                  <div><span className={styles.typeKind}>Toàn bộ khách sạn</span><h2>Tất cả tầng và phòng</h2></div>
                </header>
                <div className={styles.allRoomTypes}>
                  {roomTypes.map((type) => (
                    <section key={type.id} className={styles.allTypeSection}>
                      <h3>{type.code} <span>{type.name}</span></h3>
                      {type.floors.map((floor) => (
                        <article className={styles.floorRow} key={floor.id}>
                          <div className={styles.floorName}><Layers size={16} /> {floor.name}</div>
                          <div className={styles.roomChips}>
                            {floor.rooms.map((room) => <span key={room} className={styles.roomChip}>{room}</span>)}
                          </div>
                        </article>
                      ))}
                    </section>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {modal === "type" && <Modal title="Thêm loại phòng" onClose={() => setModal(null)}><form onSubmit={saveType}><div className={styles.kindChoices}><label><input type="radio" checked={typeDraft.kind === "room"} onChange={() => setTypeDraft({ ...typeDraft, kind: "room" })} /> Phòng</label><label><input type="radio" checked={typeDraft.kind === "dorm"} onChange={() => setTypeDraft({ ...typeDraft, kind: "dorm" })} /> Giường Dorm</label></div><Field label="Mã loại phòng *" value={typeDraft.code} onChange={(code) => setTypeDraft({ ...typeDraft, code })} placeholder="Ví dụ: STD" /><Field label="Tên loại phòng *" value={typeDraft.name} onChange={(name) => setTypeDraft({ ...typeDraft, name })} placeholder="Ví dụ: Standard Double" /><div className={styles.guestFields}><Field label="Người lớn" type="number" value={typeDraft.adults} onChange={(adults) => setTypeDraft({ ...typeDraft, adults: Number(adults) })} /><Field label="Trẻ em" type="number" value={typeDraft.children} onChange={(children) => setTypeDraft({ ...typeDraft, children: Number(children) })} /></div><ModalActions onCancel={() => setModal(null)} /></form></Modal>}
      {modal === "floor" && <Modal title="Thêm tầng" onClose={() => setModal(null)}><form onSubmit={addFloor}><Field label="Tên tầng *" value={floorDraft} onChange={setFloorDraft} placeholder="Ví dụ: FLOOR 1" autoFocus /><ModalActions onCancel={() => setModal(null)} /></form></Modal>}
      {modal?.name === "room" && <Modal title="Thêm phòng" onClose={() => setModal(null)}><form onSubmit={addRoom}><Field label="Tên phòng *" value={roomDraft} onChange={setRoomDraft} placeholder="Ví dụ: 101" autoFocus /><div className={styles.selectFields}><label><span>Loại phòng *</span><select value={roomAssignment.roomTypeId} onChange={(event) => { const roomTypeId = event.target.value; setRoomAssignment({ roomTypeId, floorId: roomTypes.find((type) => type.id === roomTypeId)?.floors[0]?.id || "" }); }}><option value="">Chọn loại phòng</option>{roomTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label><label><span>Tầng *</span><select value={roomAssignment.floorId} onChange={(event) => setRoomAssignment({ ...roomAssignment, floorId: event.target.value })} disabled={!roomAssignment.roomTypeId}><option value="">Chọn tầng</option>{roomTypes.find((type) => type.id === roomAssignment.roomTypeId)?.floors.map((floor) => <option key={floor.id} value={floor.id}>{floor.name}</option>)}</select></label></div><p className={styles.modalHint}>Phòng mới sẽ được gán vào loại phòng và tầng đã chọn.</p><ModalActions onCancel={() => setModal(null)} /></form></Modal>}
      {modal === "pricePolicy" && <Modal title="Thêm chính sách giá" onClose={() => setModal(null)}><form onSubmit={addPricePolicy}><Field label="Tên chính sách *" value={policyDraft} onChange={setPolicyDraft} placeholder="Ví dụ: STD" autoFocus /><ModalActions onCancel={() => setModal(null)} /></form></Modal>}
      {modal === "typeEdit" && <Modal title="Sửa loại phòng" onClose={() => setModal(null)}><TypeEditorForm draft={typeDraft} onChange={setTypeDraft} onSubmit={saveType} onCancel={() => setModal(null)} /></Modal>}
      {modal === "deleteType" && <Modal title="Xóa loại phòng" onClose={() => setModal(null)}><p className={styles.modalHint}>Bạn có chắc muốn xóa loại phòng <strong>{selected?.code}</strong>? Các thiết lập giá liên quan cũng sẽ bị xóa.</p><div className={styles.modalActions}><button type="button" className={styles.cancelBtn} onClick={() => setModal(null)}>Đóng</button><button type="button" className={styles.deleteConfirmBtn} onClick={deleteSelectedType}>Xóa loại phòng</button></div></Modal>}
    </main>
  );
}

const priceTypes = [
  { id: "hourly", label: "Giá giờ" }, { id: "daily", label: "Giá ngày" }, { id: "nightly", label: "Giá đêm" }, { id: "weekly", label: "Giá tuần" }, { id: "monthly", label: "Giá tháng" },
];

function PriceBoard({ roomTypes, roomCount, selectedId, onSelectRoom, policies, selectedPolicyId, onSelectPolicy, onAddPolicy, selectedPriceType, enabledTypes, onTogglePriceType, value, onChange, earlyRates, lateRates, onAddSupplement, onUpdateSupplement, onRemoveSupplement }) {
  const type = priceTypes.find((item) => item.id === selectedPriceType);
  const title = type?.label || "Giá ngày";
  return <section className={styles.priceBoard}>
    <aside className={styles.priceRoomColumn}>
      <div className={styles.priceColumnTitle}>Loại phòng</div>
      {roomTypes.map((room) => <button key={room.id} className={`${styles.priceRoomItem} ${selectedId === room.id ? styles.priceRoomActive : ""}`} onClick={() => onSelectRoom(room.id)}><span><b>{room.code}</b>{room.name}</span><small>{roomCount(room)} phòng</small></button>)}
    </aside>
    {selectedId && <aside className={styles.policyColumn}>
      <div className={styles.priceColumnTitle}>Chính sách giá</div>
      {policies.map((policy) => <button key={policy.id} className={`${styles.policyItem} ${selectedPolicyId === policy.id ? styles.policyActive : ""}`} onClick={() => onSelectPolicy(policy.id)}><span className={styles.checkBox}>✓</span>{policy.name}<X size={14} className={styles.removePolicy} /></button>)}
      <button className={styles.addPolicy} onClick={onAddPolicy}><Plus size={16} /> Thêm chính sách giá</button>
    </aside>}
    {selectedPolicyId && <aside className={styles.priceTypeColumn}>
      <div className={styles.priceColumnTitle}>Loại giá</div>
      {priceTypes.map((item) => { const enabled = enabledTypes.includes(item.id); return <button key={item.id} className={`${styles.priceTypeItem} ${selectedPriceType === item.id ? styles.priceTypeActive : ""}`} onClick={() => onTogglePriceType(item.id)}><span className={`${styles.checkBox} ${enabled ? styles.checkBoxSelected : ""}`}>{enabled ? "✓" : ""}</span>{item.label}</button>; })}
    </aside>}
    {selectedPriceType && <section className={styles.priceEditor}>
      <header className={styles.priceEditorHeader}><h2>{title} {selectedPriceType === "daily" && <CircleHelp size={17} />}</h2><div><button className={styles.testBtn}>Kiểm tra</button><button className={styles.saveBtn} onClick={() => {}}>Lưu</button></div></header>
      <div className={styles.priceEditorBody}>{selectedPriceType ? <PriceForm type={selectedPriceType} value={value} onChange={onChange} earlyRates={earlyRates} lateRates={lateRates} onAddSupplement={onAddSupplement} onUpdateSupplement={onUpdateSupplement} onRemoveSupplement={onRemoveSupplement} /> : <p className={styles.priceDescription}>Chọn ít nhất một loại giá để bắt đầu thiết lập.</p>}</div>
    </section>}
  </section>;
}

function PriceForm({ type, value, onChange, earlyRates, lateRates, onAddSupplement, onUpdateSupplement, onRemoveSupplement }) {
  if (type === "hourly") return <><p className={styles.priceDescription}>Thiết lập mức giá áp dụng theo từng giờ lưu trú.</p><div className={styles.formSplit}><PriceInput label="Từ giờ" field="from" placeholder="hh:mm" value={value} onChange={onChange} /><PriceInput label="Giá giờ" value={value} onChange={onChange} /></div><button type="button" className={styles.addRate} onClick={() => onAddSupplement("early")}><Plus size={15} /> Thêm giá giờ</button><SupplementRows rows={earlyRates} kind="early" onUpdate={onUpdateSupplement} onRemove={onRemoveSupplement} /></>;
  if (type === "nightly") return <><p className={styles.priceDescription}>Tính “Giá đêm” khi khách check in và check out trong khoảng quy định.</p><div className={styles.formSplit}><PriceInput label="Check in" field="checkIn" placeholder="hh:mm" value={value} onChange={onChange} /><PriceInput label="Check out" field="checkOut" placeholder="hh:mm" value={value} onChange={onChange} /></div><PriceInput label="Giá đêm" value={value} onChange={onChange} /></>;
  if (type === "weekly") return <><p className={styles.priceDescription}>Tính “Giá tuần” khi khách lưu trú đủ 7 ngày tại khách sạn.</p><PriceInput label="Giá tuần" value={value} onChange={onChange} /></>;
  if (type === "monthly") return <><p className={styles.priceDescription}>Tính giá “tháng” khi</p><label className={styles.radioLine}><input type="radio" name="month" defaultChecked /> Khách ở đủ 30 ngày</label><label className={styles.radioLine}><input type="radio" name="month" /> Khách ở từ ngày này tháng này đến cùng ngày tháng sau</label><PriceInput label="Giá tháng" value={value} onChange={onChange} /></>;
  return <><p className={styles.priceDescription}>Tính “Giá ngày” khi</p><label className={styles.radioLine}><input type="radio" name="day" defaultChecked /> Thời gian Check in, Check out trong khung giờ quy định</label><div className={styles.formSplit}><PriceInput label="Check in" field="checkIn" placeholder="14:00" value={value} onChange={onChange} /><PriceInput label="Check out" field="checkOut" placeholder="12:00" value={value} onChange={onChange} /></div><PriceInput label="Giá ngày" value={value} onChange={onChange} /><div className={styles.extraRates}><button type="button" onClick={() => onAddSupplement("early")}>Phí checkin sớm <Plus size={16} /></button><SupplementRows rows={earlyRates} kind="early" onUpdate={onUpdateSupplement} onRemove={onRemoveSupplement} /><button type="button" onClick={() => onAddSupplement("late")}>Phí checkout muộn <Plus size={16} /></button><SupplementRows rows={lateRates} kind="late" onUpdate={onUpdateSupplement} onRemove={onRemoveSupplement} /></div><PriceInput label="Phụ thu người lớn" field="adultExtra" value={value} onChange={onChange} /><PriceInput label="Phụ thu trẻ em" field="childExtra" value={value} onChange={onChange} /></>;
}

function SupplementRows({ rows, kind, onUpdate, onRemove }) { return rows.map((row) => <div className={styles.supplementRow} key={row.id}><input value={row.time} placeholder="01:00" onChange={(event) => onUpdate(kind, row.id, "time", event.target.value)} /><input value={row.amount} placeholder="Đơn giá" onChange={(event) => onUpdate(kind, row.id, "amount", event.target.value)} /><button type="button" onClick={() => onRemove(kind, row.id)}><X size={15} /></button></div>); }

function PriceInput({ label, field = "amount", placeholder = "VND 0", value, onChange }) { return <label className={styles.priceInput}><span>{label}</span><input value={value[field] || ""} onChange={(event) => onChange(field, event.target.value)} placeholder={placeholder} /></label>; }

function TypeEditorForm({ draft, onChange, onSubmit, onCancel }) {
  return <form onSubmit={onSubmit}>
    <div className={styles.kindChoices}>
      <label><input type="radio" checked={draft.kind === "room"} onChange={() => onChange({ ...draft, kind: "room" })} /> Phòng</label>
      <label><input type="radio" checked={draft.kind === "dorm"} onChange={() => onChange({ ...draft, kind: "dorm" })} /> Giường Dorm</label>
    </div>
    <Field label="Mã loại phòng *" value={draft.code} onChange={(code) => onChange({ ...draft, code })} />
    <Field label="Tên loại phòng *" value={draft.name} onChange={(name) => onChange({ ...draft, name })} />
    <div className={styles.guestFields}>
      <Field label="Người lớn" type="number" value={draft.adults} onChange={(adults) => onChange({ ...draft, adults: Number(adults) })} />
      <Field label="Trẻ em" type="number" value={draft.children} onChange={(children) => onChange({ ...draft, children: Number(children) })} />
    </div>
    <ModalActions onCancel={onCancel} />
  </form>;
}

function Field({ label, value, onChange, placeholder, type = "text", autoFocus = false }) { return <label className={styles.field}><span>{label}</span><input autoFocus={autoFocus} type={type} min={type === "number" ? 0 : undefined} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={label.includes("*")} /></label>; }
function Modal({ title, children, onClose }) { return <div className={styles.overlay} role="presentation" onMouseDown={onClose}><section className={styles.modal} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><button className={styles.modalClose} onClick={onClose}><X size={18} /></button><h2>{title}</h2>{children}</section></div>; }
function ModalActions({ onCancel }) { return <div className={styles.modalActions}><button type="button" className={styles.cancelBtn} onClick={onCancel}>Bỏ qua</button><button type="submit" className={styles.saveBtn}>Lưu</button></div>; }

export default RoomPriceConfig;
