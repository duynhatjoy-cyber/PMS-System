import { useEffect, useState } from "react";
import { DEFAULT_CARD_FIELDS } from "../data/bookingConfigData";

const STORAGE_KEY = "pms.bookingCardFields";
const CHANGE_EVENT = "pms:booking-card-fields";

export function readBookingCardFields() {
  try {
    return { ...DEFAULT_CARD_FIELDS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return DEFAULT_CARD_FIELDS;
  }
}

export function saveBookingCardFields(fields) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: fields }));
}

export function useBookingCardFields() {
  const [fields, setFields] = useState(readBookingCardFields);

  useEffect(() => {
    const sync = (event) => setFields(event.detail || readBookingCardFields());
    const syncStorage = (event) => {
      if (event.key === STORAGE_KEY) setFields(readBookingCardFields());
    };
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  return fields;
}
