import { ROOM_TYPES, ROOMS } from "../data/roomMapData";

const defaults = ROOM_TYPES.map((type) => ({
  id: type.key.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name: type.label,
  code: type.key,
  price: type.basePrice,
  maxOccupancy: type.maxAdults + type.maxChildren,
  numbers: ROOMS.filter((room) => room.typeKey === type.key).map((room) => room.number),
}));

export function getConfiguredRoomTypes() {
  try {
    const saved = JSON.parse(localStorage.getItem("pms-room-price-types"));
    if (!Array.isArray(saved)) return defaults;
    return saved.map((type) => ({
      id: type.id,
      name: type.name,
      code: type.code,
      price: ROOM_TYPES.find((item) => item.key === type.code)?.basePrice || 700000,
      maxOccupancy: Number(type.adults || 0) + Number(type.children || 0),
      numbers: (type.floors || []).flatMap((floor) => floor.rooms || []),
    }));
  } catch { return defaults; }
}
