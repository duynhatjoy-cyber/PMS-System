import { addDays, isSameDay } from "../utils/format";

export const roomTypes = [
  {
    id: "double",
    name: "Phòng Đôi",
    tag: "double · Tối đa 4 người",
    price: 700000,
    available: 10,
  },
  {
    id: "twin",
    name: "Phòng Twin",
    tag: "Tối đa 2 người",
    price: 700000,
    available: 2,
  },
  {
    id: "family",
    name: "Phòng Gia Đình",
    tag: "family · Tối đa 6 người",
    price: 1250000,
    available: 4,
  },
];

export const ratePlans = [
  "-- Giá mặc định (700.000đ) --",
  "OFF (CN-T6)",
  "ONL (CN-T6)",
  "OFF (T7)",
  "ONL (T7)",
  "Giá OTA (vui lòng không chỉnh sửa)",
];

export const bookingSources = ["Walk-in", "Lễ Tân", "OTA", "Traveloka", "Booking.com"];

export const AVAILABLE_ROOMS = {
  double: ["101", "102", "103", "201", "202", "210"],
  twin: ["305", "306"],
  family: ["106", "108", "109", "110", "507"],
};

// Flat nightly room rate used across the mock dataset (no per-room-type
// pricing model exists yet — every booking bills at this rate).
export const NIGHTLY_RATE = 700000;

// A small mock guest directory used to demo "search an existing guest" —
// stands in for a real guest CRM which this app doesn't have yet.
export const guestDirectory = [
  { id: "g1", name: "Bùi Quốc Tiến", phone: "0901234561" },
  { id: "g2", name: "Lê Tấn Minh", phone: "0901234562" },
  { id: "g3", name: "Trần Hiền My", phone: "0901234563" },
  { id: "g4", name: "Nguyễn Lý Ngọc Phát", phone: "0901234564" },
  { id: "g5", name: "Vũ Thu Phương", phone: "0901234565" },
  { id: "g6", name: "Ngô Bảo Châu", phone: "0901234566" },
  { id: "g7", name: "Phạm Thu Hà", phone: "0901234567" },
  { id: "g8", name: "Đặng Văn Long", phone: "0901234568" },
];

const FLAG = "VN";

function makeGuest(name) {
  return { name, flag: FLAG };
}

function makeGuestList(id, name) {
  return [{ id: `${id}-g1`, name, flag: FLAG }];
}

function at(date, hh, mm) {
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
}

// A single flat list of bookings is the source of truth. Each booking has a
// `stage` ("arrival" | "inhouse") — tab lists (arrivals / departures / inhouse)
// are derived from this list at render time so an edit made from any tab
// stays consistent everywhere else.
export function buildFrontDeskBookings(today) {
  const inhouseSeed = [
    { room: "101", roomType: "C_Std Dbl", code: 45893, guest: "4659519 - Nam", stays: 2, adults: 2, children: 0, inAgo: 2, nightsLeft: 1 },
    { room: "102", roomType: "STD DBL", code: 45900, guest: "Bùi Quốc Tiến", stays: 4, adults: 2, children: 0, inAgo: 2, nightsLeft: 2 },
    { room: "103", roomType: "STD DBL", code: 45909, guest: "Đoàn Quang Minh Trí", stays: 0, adults: 1, children: 0, inAgo: 3, nightsLeft: 3 },
    { room: "104", roomType: "C_Sup Dbl", code: 45806, guest: "Lê Tấn Minh", stays: 2, adults: 2, children: 0, inAgo: 1, nightsLeft: 2 },
    { room: "105", roomType: "STD DBL", code: 45113, guest: "Nguyễn Lý Ngọc Phát", stays: 1, adults: 2, children: 0, inAgo: 4, nightsLeft: 1 },
    { room: "106", roomType: "DELUXE FAM", code: 45913, guest: "Nguyễn Thành Phát", stays: 0, adults: 4, children: 0, inAgo: 1, nightsLeft: 4 },
    { room: "107", roomType: "STD DBL", code: 45713, guest: "Trần Hiền My", stays: 5, adults: 2, children: 0, inAgo: 2, nightsLeft: 2 },
    { room: "108", roomType: "C_Fam View", code: 45561, guest: "Trần Thị Bích Tuyền", stays: 3, adults: 2, children: 0, inAgo: 2, nightsLeft: 0, paid: false },
    { room: "109", roomType: "C.CON FAM", code: 45321, guest: "Trương Thị Mai Anh", stays: 2, adults: 8, children: 0, inAgo: 3, nightsLeft: 0, paid: false },
    { room: "110", roomType: "C_Sup Fam", code: 45708, guest: "Võ Thị Thanh Nga", stays: 2, adults: 4, children: 0, inAgo: 4, nightsLeft: 0, paid: true },
  ];

  const inhouse = inhouseSeed.map((seed, index) => {
    const id = `IH-${seed.room}`;
    const checkIn = at(addDays(today, -seed.inAgo), 13, 30 + index);
    const checkOut = at(addDays(today, seed.nightsLeft), 12, 0);
    const nights = Math.max(1, Math.round((checkOut - checkIn) / 86400000));
    const isPaid = seed.paid ?? true;
    return {
      id,
      stage: "inhouse",
      room: seed.room,
      roomType: seed.roomType,
      bookingCode: seed.code,
      guest: makeGuest(seed.guest),
      guests: makeGuestList(id, seed.guest),
      checkIn,
      checkOut,
      stayCount: seed.stays,
      adults: seed.adults,
      children: seed.children,
      assigned: true,
      paid: isPaid,
      source: index % 3 === 0 ? "Lễ Tân" : index % 3 === 1 ? "Traveloka" : "OTA",
      notes: "đã ttcn",
      services:
        index === 0 ? [{ name: "Ăn sáng", range: "18/7 - 19/7", price: 90000, qty: 1 }] : [],
      paymentRecords: isPaid
        ? [{ id: `${id}-p1`, date: checkIn, method: "Tiền mặt", amount: nights * NIGHTLY_RATE, note: "" }]
        : [],
    };
  });

  const arrivalSeed = [
    { room: "201", roomType: "C_Std Dbl", code: 45930, guest: "Ngô Bảo Châu", adults: 2, children: 0, nights: 2, assigned: true, confirmed: true },
    { room: "202", roomType: "STD DBL", code: 45931, guest: "Phạm Thu Hà", adults: 2, children: 1, nights: 1, assigned: true, confirmed: true },
    { room: null, roomType: "C_Sup Dbl", code: 45932, guest: "Đặng Văn Long", adults: 1, children: 0, nights: 3, assigned: false, confirmed: false },
    { room: "305", roomType: "DELUXE FAM", code: 45933, guest: "Vũ Thu Phương", adults: 4, children: 1, nights: 2, assigned: true, confirmed: true },
    { room: null, roomType: "C_Fam View", code: 45934, guest: "Hoàng Minh Đức", adults: 2, children: 0, nights: 1, assigned: false, confirmed: false },
    { room: "210", roomType: "STD DBL", code: 45935, guest: "Lâm Gia Bảo", adults: 2, children: 0, nights: 2, assigned: true, confirmed: true },
  ];

  const arrivals = arrivalSeed.map((seed, index) => {
    const id = `AR-${seed.code}`;
    return {
      id,
      stage: "arrival",
      room: seed.room,
      roomType: seed.roomType,
      bookingCode: seed.code,
      guest: makeGuest(seed.guest),
      guests: makeGuestList(id, seed.guest),
      checkIn: at(today, 14, 0 + index),
      checkOut: at(addDays(today, seed.nights), 12, 0),
      stayCount: index % 2 === 0 ? 1 : 0,
      adults: seed.adults,
      children: seed.children,
      assigned: seed.assigned,
      confirmed: seed.confirmed,
      paid: false,
      source: index % 2 === 0 ? "Traveloka" : "Lễ Tân",
      notes: "",
      services: [],
      paymentRecords: [],
    };
  });

  return [...arrivals, ...inhouse];
}

export function selectArrivals(bookings) {
  return bookings.filter((b) => b.stage === "arrival");
}

export function selectInhouse(bookings) {
  return bookings.filter((b) => b.stage === "inhouse");
}

export function selectDepartures(bookings, selectedDate) {
  return bookings.filter((b) => b.stage === "inhouse" && isSameDay(b.checkOut, selectedDate));
}

export function computeStats(bookings, selectedDate) {
  const arrivals = selectArrivals(bookings);
  const departures = selectDepartures(bookings, selectedDate);
  const inhouse = selectInhouse(bookings);

  return {
    arrivals: {
      count: arrivals.length,
      confirmed: arrivals.filter((b) => b.confirmed).length,
      pendingCheckin: arrivals.filter((b) => !b.confirmed).length,
    },
    departures: {
      count: departures.length,
      unpaid: departures.filter((b) => !b.paid).length,
      completed: departures.filter((b) => b.paid).length,
    },
    inhouse: { count: inhouse.length },
    roomsReady: { count: 6, needsCleaning: 2, outOfOrder: 0 },
    occupancy: { percent: 83, occupied: 10, total: 12 },
    revenueToday: 18450000,
    adr: 1845000,
  };
}
