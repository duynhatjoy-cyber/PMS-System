import { createContext, useContext, useMemo, useState } from "react";
import { buildFrontDeskBookings } from "../data/frontDeskData";
import { buildRoomMapBookings } from "../data/roomMapData";
import { startOfDay } from "../utils/format";

const BookingsContext = createContext(null);

export function BookingsProvider({ children }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [bookings, setBookings] = useState(() => buildFrontDeskBookings(today));
  const [roomMapBookings, setRoomMapBookings] = useState(() => buildRoomMapBookings(today));
  const [lodgingGroups, setLodgingGroups] = useState([]);

  return <BookingsContext.Provider value={{ today, bookings, setBookings, roomMapBookings, setRoomMapBookings, lodgingGroups, setLodgingGroups }}>{children}</BookingsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook colocated by design
export function useBookings() {
  const context = useContext(BookingsContext);
  if (!context) throw new Error("useBookings must be used within BookingsProvider");
  return context;
}
