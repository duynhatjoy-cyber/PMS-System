import React from "react";

export function getSourceCategory(source) {
  if (!source) return null;
  const s = String(source).toLowerCase().trim();
  if (s.includes("booking")) return "booking";
  if (s.includes("agoda")) return "agoda";
  if (s.includes("traveloka")) return "traveloka";
  if (s.includes("airbnb")) return "airbnb";
  if (s.includes("expedia")) return "expedia";
  if (s.includes("trip")) return "trip";
  if (s.includes("call") || s.includes("điện thoại")) return "call";
  if (s.includes("walk") || s.includes("vãng lai")) return "walkin";
  if (s.includes("ez") || s.includes("engine")) return "ez_be";
  if (s.includes("direct") || s.includes("trực tiếp")) return "direct";
  return "other";
}

export default function SourceLogo({ source, size = 18, style = {} }) {
  if (!source) return null;

  const category = getSourceCategory(source);
  const commonStyle = {
    flexShrink: 0,
    borderRadius: 3.5,
    display: "inline-block",
    verticalAlign: "middle",
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
    ...style,
  };

  switch (category) {
    case "booking":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          style={commonStyle}
          title={source}
        >
          <rect width="24" height="24" rx="4" fill="#003580" />
          <text
            x="4"
            y="18"
            fill="#ffffff"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="900"
            fontSize="16.5"
            letterSpacing="-0.5"
          >
            B.
          </text>
        </svg>
      );

    case "agoda":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          style={commonStyle}
          title={source}
        >
          <rect width="24" height="24" rx="4" fill="#ffffff" />
          <circle cx="5" cy="12" r="2.8" fill="#e53935" />
          <circle cx="9.5" cy="8.2" r="2.8" fill="#fbc02d" />
          <circle cx="14" cy="15.8" r="2.8" fill="#43a047" />
          <circle cx="18.5" cy="8.5" r="2.8" fill="#0288d1" />
          <circle cx="21" cy="14" r="2.2" fill="#7b1fa2" />
        </svg>
      );

    case "traveloka":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          style={commonStyle}
          title={source}
        >
          <rect width="24" height="24" rx="4" fill="#0194F3" />
          <path
            d="M4 14.5C7 14 11 11 14 6C12.5 9.5 12 12 11 14C14 13 18 10.5 20 8.5C18 12 14.5 15.5 10 16.5C7.5 17 5.5 16 4 14.5Z"
            fill="#ffffff"
          />
        </svg>
      );

    case "airbnb":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          style={commonStyle}
          title={source}
        >
          <rect width="24" height="24" rx="4" fill="#FF5A5F" />
          <path
            d="M12 4.2c-2.3 0-3.9 2-3.2 5.5.6 2.8 3.2 6.5 3.2 6.5s2.6-3.7 3.2-6.5c.7-3.5-.9-5.5-3.2-5.5zm0 6.6c-.9 0-1.6-.7-1.6-1.6 0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6c0 .9-.7 1.6-1.6 1.6z"
            fill="#ffffff"
          />
        </svg>
      );

    case "expedia":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          style={commonStyle}
          title={source}
        >
          <rect width="24" height="24" rx="4" fill="#00355F" />
          <path d="M6 13l8-5v4l5-2-1 3-4 1v3l-2-1v-2l-4 1z" fill="#ffcc00" />
        </svg>
      );

    case "trip":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          style={commonStyle}
          title={source}
        >
          <rect width="24" height="24" rx="4" fill="#2681FF" />
          <text
            x="3"
            y="16"
            fill="#ffffff"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="10"
          >
            Trip
          </text>
        </svg>
      );

    case "call":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          style={commonStyle}
          title={source}
        >
          <rect width="24" height="24" rx="4" fill="#475569" />
          <path
            d="M7 8.5C7 7.7 7.7 7 8.5 7h1c.5 0 1 .4 1.1.9l.5 2c.1.5-.1 1-.5 1.2L9.6 11.7c.8 1.5 2 2.7 3.5 3.5l.6-1c.3-.4.8-.6 1.2-.5l2 .5c.5.1.9.6.9 1.1v1c0 .8-.7 1.5-1.5 1.5-5.5 0-9.8-4.3-9.8-9.8z"
            fill="#ffffff"
          />
        </svg>
      );

    case "walkin":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          style={commonStyle}
          title={source}
        >
          <rect width="24" height="24" rx="4" fill="#16A34A" />
          <circle cx="12" cy="6.5" r="2.2" fill="#ffffff" />
          <path
            d="M10.2 10.5h3.6c.6 0 1 .5.8 1.1l-1 3.5 1.4 3.9h-1.8l-1.2-3.1-.7 3.1H9.5l1.3-5.2-1.2.8-.7-1.6 1.3-2.5z"
            fill="#ffffff"
          />
        </svg>
      );

    case "ez_be":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          style={commonStyle}
          title={source}
        >
          <rect width="24" height="24" rx="4" fill="#D97706" />
          <text
            x="3.5"
            y="17"
            fill="#ffffff"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="13"
          >
            EZ
          </text>
        </svg>
      );

    case "direct":
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          style={commonStyle}
          title={source}
        >
          <rect width="24" height="24" rx="4" fill="#0D9488" />
          <path
            d="M5 8h14v10H5V8zm2 2v6h10v-6H7zm-3-4l2-2h12l2 2v1H4V6z"
            fill="#ffffff"
          />
        </svg>
      );

    default: {
      const code = String(source).slice(0, 2).toUpperCase();
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          style={commonStyle}
          title={source}
        >
          <rect width="24" height="24" rx="4" fill="#64748b" />
          <text
            x="4"
            y="17"
            fill="#ffffff"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="12"
          >
            {code}
          </text>
        </svg>
      );
    }
  }
}

