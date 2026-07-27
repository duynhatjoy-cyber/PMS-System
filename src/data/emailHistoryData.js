import { EMAIL_CAMPAIGNS, TEMPLATES_BY_TRIGGER } from "./emailCampaignData";

export const HISTORY_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  PENDING: "pending",
};

// Giá trị mẫu dùng để lấp đầy các thẻ [Tag] khi xem trước email đã gửi.
const SAMPLE_MERGE_VALUES = {
  Hotel_Name: "Nhà Của My",
  Hotel_Phone: "028 3822 9988",
  Hotel_Email: "info@nhacuamy.vn",
  Hotel_Address: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
  Hotel_Website: "nhacuamy.vn",
  TimeInPrivate: "14:00",
  TimeOutPrivate: "12:00",
  Booking_number: "BK-20260727-0105",
  BookingDate: "20/07/2026",
  ArrivalDate: "25/07/2026",
  DepartureDate: "27/07/2026",
  NoOfNights: "2",
  RoomType: "Phòng Đôi",
  RoomNo: "105",
  Adult: "2",
  Child: "0",
  Service_Name: "Giặt ủi",
  Number_Of_Services: "1",
  Service_Cost: "80.000đ",
  Total_Room_Price: "1.400.000đ",
  Total_Service_Price: "80.000đ",
  Total_Price: "1.480.000đ",
};

// Thay mỗi chip [Tag] trong template bằng giá trị mẫu tương ứng (hoặc giữ nguyên nếu không có).
export function fillTemplate(html, overrides = {}) {
  const values = { ...SAMPLE_MERGE_VALUES, ...overrides };
  return html
    .replace(/<span class="cf-tag">\[(\/?[\w]+)\]<\/span>/g, (match, tagName) => {
      if (tagName.startsWith("/")) return "";
      if (tagName === "listservice" || tagName === "listroom") return "";
      return values[tagName] ?? match;
    })
    .replace(/\[(\/?[\w]+)\]/g, (match, tagName) => values[tagName] ?? match);
}

function findCampaign(campaignId) {
  return EMAIL_CAMPAIGNS.find((c) => c.id === campaignId);
}

export function buildPreviewHtml(entry) {
  const campaign = findCampaign(entry.campaignId);
  const trigger = campaign?.trigger || "upcoming";
  const template = TEMPLATES_BY_TRIGGER[trigger] || TEMPLATES_BY_TRIGGER.upcoming;
  return fillTemplate(template, { Guest_Name: entry.guestName });
}

export const EMAIL_HISTORY = [
  {
    id: "h1",
    campaignId: "cf-2",
    guestName: "SULLIVAN SHANE RICHARD",
    email: "06bj6nbs0000001h53f9jd8aef2d2@agoda-messaging.com",
    room: "105",
    bookingCode: "089226a5-59d4-43c9-a228-599c4753ec53",
    status: HISTORY_STATUS.SUCCESS,
    createdAt: new Date(2026, 6, 27, 13, 8),
    sentAt: new Date(2026, 6, 27, 13, 10),
  },
  {
    id: "h2",
    campaignId: "cf-2",
    guestName: "Nguyễn Thị Thùy Linh",
    email: "hiiammii@icloud.com",
    room: "408",
    bookingCode: "089226a5-59d4-43c9-a228-599c4753ec53",
    status: HISTORY_STATUS.SUCCESS,
    createdAt: new Date(2026, 6, 27, 12, 23),
    sentAt: new Date(2026, 6, 27, 12, 30),
  },
  {
    id: "h3",
    campaignId: "cf-2",
    guestName: "Nguyễn Quỳnh Thanh",
    email: "mbmrgs.837007@guest.booking.com",
    room: "102",
    bookingCode: "089226a5-59d4-43c9-a228-599c4753ec53",
    status: HISTORY_STATUS.SUCCESS,
    createdAt: new Date(2026, 6, 27, 12, 15),
    sentAt: new Date(2026, 6, 27, 12, 20),
  },
  {
    id: "h4",
    campaignId: "cf-2",
    guestName: "Ah Roktutpal",
    email: "04fh71380000001h46sq8jjvj4dxt@agoda-messaging.com",
    room: "106",
    bookingCode: "089226a5-59d4-43c9-a228-599c4753ec53",
    status: HISTORY_STATUS.SUCCESS,
    createdAt: new Date(2026, 6, 27, 10, 14),
    sentAt: new Date(2026, 6, 27, 10, 20),
  },
  {
    id: "h5",
    campaignId: "cf-3",
    guestName: "Trần Hiền My",
    email: "tran.hienmy@gmail.com",
    room: "201",
    bookingCode: "5a12c7e3-9e0a-4d61-8f2b-2b8c9c2b7a11",
    status: HISTORY_STATUS.SUCCESS,
    createdAt: new Date(2026, 6, 27, 9, 45),
    sentAt: new Date(2026, 6, 27, 9, 50),
  },
  {
    id: "h6",
    campaignId: "cf-1",
    guestName: "Vũ Thu Phương",
    email: "vuthuphuong.booking@gmail.com",
    room: "310",
    bookingCode: "7d4e1f2a-3c9b-4a7d-9e6f-1a2b3c4d5e6f",
    status: HISTORY_STATUS.PENDING,
    createdAt: new Date(2026, 6, 27, 8, 30),
    sentAt: null,
  },
  {
    id: "h7",
    campaignId: "cf-4",
    guestName: "Ngô Bảo Châu",
    email: "ngobaochau@yahoo.com",
    room: "112",
    bookingCode: "1f2e3d4c-5b6a-4978-8e7f-6a5b4c3d2e1f",
    status: HISTORY_STATUS.SUCCESS,
    createdAt: new Date(2026, 6, 27, 8, 5),
    sentAt: new Date(2026, 6, 27, 8, 12),
  },
  {
    id: "h8",
    campaignId: "cf-2",
    guestName: "Đặng Văn Long",
    email: "dangvanlong@outlook.com",
    room: "204",
    bookingCode: "089226a5-59d4-43c9-a228-599c4753ec53",
    status: HISTORY_STATUS.ERROR,
    createdAt: new Date(2026, 6, 27, 7, 40),
    sentAt: null,
    errorMessage: "Không thể gửi: địa chỉ email không hợp lệ",
  },
];
