export const CAMPAIGN_TRIGGERS = [
  { key: "upcoming", label: "Sắp đến", icon: "PlaneTakeoff" },
  { key: "departed", label: "Sau khi đi", icon: "PlaneLanding" },
  { key: "inhouse", label: "Đang ở", icon: "BedDouble" },
  { key: "birthday", label: "Sinh nhật", icon: "Cake" },
];

export const EMAIL_CAMPAIGNS = [
  {
    id: "cf-1",
    title: "Reservation Confirmation email to Guest/Booker",
    subtitle: "Lưu lại gửi sau",
    trigger: "upcoming",
    status: "inactive",
    subject: "Reservation Confirmation email to Guest/Booker",
  },
  {
    id: "cf-2",
    title: "Thank You email to Guest/Booker upon checking out from Hotel",
    subtitle: "Lưu lại gửi sau",
    trigger: "departed",
    status: "inactive",
    subject: "Thank You email to Guest/Booker upon checking out from Hotel",
  },
  {
    id: "cf-3",
    title: "Thank You email to Guest/Booker upon checking in from Hotel",
    subtitle: "Lưu lại gửi sau",
    trigger: "inhouse",
    status: "inactive",
    subject: "Thank You email to Guest/Booker upon checking in from Hotel",
  },
  {
    id: "cf-4",
    title: "RESERVATION CONFIRMATION / XÁC NHẬN ĐẶT PHÒNG",
    subtitle: "Lưu lại gửi sau",
    trigger: "upcoming",
    status: "active",
    subject: "RESERVATION CONFIRMATION / XÁC NHẬN ĐẶT PHÒNG",
  },
];

export const HOTEL_TAGS = [
  "Hotel_Name",
  "Hotel_Phone",
  "Hotel_Email",
  "Hotel_Address",
  "Hotel_Website",
  "TimeInPrivate",
  "TimeOutPrivate",
];

export const GUEST_TAGS = [
  "Guest_Name",
  "Guest_Address",
  "Guest_Birthday",
  "Guest_Sex",
  "Guest_Email",
  "Guest_Phone",
  "Guest_Note",
  "Guest_Country",
];

export const ROOM_TAGS = [
  "ArrivalDate",
  "DepartureDate",
  "Booking_number",
  "Booking_no_of_channel",
  "Note",
  "Price_room_per_night",
  "Adult",
  "Child",
  "RoomNo",
  "RoomType",
  "CompanyName",
  "NoOfNights",
  "BookingDate",
  "Deposite",
  "NoOfRooms",
  "ExchargeDiscount",
  "Currency",
  "Total_Group_price",
  "Total_Room_price",
  "PassCode_Lock",
  "PasscodeSmartLock",
  "PasscodeELife",
  "First_Night_Price",
  "Last_Night_Price",
  "Average_Room_Price",
  "Room_Price",
  "First_ArrivalDate",
  "Last_DepartureDate",
  "TotalOfNights",
  "Price_Service_Per_Unit",
  "Service_Cost",
];

export const SERVICE_TAGS = [
  "Service_Name",
  "Number_Of_Services",
  "Price_Service_Per_Unit",
  "Service_Cost",
];

export const MISC_TAGS = [
  "Total_Service_Price",
  "Total_Room_Price",
  "Total_Price",
  "Remaining_Amount",
];

export const MISC_BLOCK_TAGS = [
  { open: "listroom", close: "/listroom" },
  { open: "listservice", close: "/listservice" },
];

// Sắp đến / Sau khi đi / Đang ở đều có đủ nhóm thẻ. Sinh nhật không có thông tin phòng.
export const MERGE_TAG_GROUPS = [
  { key: "hotel", title: "Khách sạn", tags: HOTEL_TAGS },
  { key: "guest", title: "Khách", tags: GUEST_TAGS },
  { key: "room", title: "Thông tin phòng", tags: ROOM_TAGS, hideForTriggers: ["birthday"] },
  { key: "service", title: "Thông tin dịch vụ", tags: SERVICE_TAGS },
  { key: "misc", title: "Another_Email_Marketing_Info", tags: MISC_TAGS, blockTags: MISC_BLOCK_TAGS },
];

// Sắp đến: xác nhận đặt phòng, gửi trước ngày nhận phòng.
export const TEMPLATE_UPCOMING = `
<p class="cf-confirm-title">CONFIRM BOOKING</p>
<p>BOOKING REFERENCE NO : <span class="cf-tag">[Booking_number]</span></p>
<p>Kindly print this confirmation and have it ready upon check-in at the Hotel</p>
<table class="cf-hotel-info">
  <tbody>
    <tr><td><span class="cf-tag">[Hotel_Name]</span></td></tr>
    <tr><td>Address: <span class="cf-tag">[Hotel_Address]</span></td></tr>
    <tr><td>Email: <span class="cf-tag">[Hotel_Email]</span></td></tr>
    <tr><td>Website: <span class="cf-tag">[Hotel_Website]</span></td></tr>
    <tr><td>Phone : <span class="cf-tag">[Hotel_Phone]</span></td></tr>
  </tbody>
</table>
<p>Dear <span class="cf-tag">[Guest_Name]</span>,</p>
<p>Thank you for choosing <strong><span class="cf-tag">[Hotel_Name]</span></strong> for your stay. We are pleased to inform you that your reservation request is <strong>CONFIRMED</strong>.</p>
<h4 class="cf-section-title">Booking Details</h4>
<table class="cf-detail-table">
  <tbody>
    <tr><td>Booking Date</td><td>: <span class="cf-tag">[BookingDate]</span></td></tr>
    <tr><td>Check In</td><td>: <span class="cf-tag">[ArrivalDate]</span></td></tr>
    <tr><td>Check Out</td><td>: <span class="cf-tag">[DepartureDate]</span></td></tr>
    <tr><td>Nights</td><td>: <span class="cf-tag">[NoOfNights]</span></td></tr>
    <tr><td>Room</td><td>: <span class="cf-tag">[RoomType]</span> - <span class="cf-tag">[RoomNo]</span></td></tr>
  </tbody>
</table>
<h4 class="cf-section-title">Conditions &amp; Policies</h4>
<p class="cf-muted">...</p>
<h4 class="cf-section-title">Cancellation Policy</h4>
<p class="cf-muted">...</p>
<h4 class="cf-section-title">Hotel Policy</h4>
<p class="cf-muted">...</p>
<p><strong>This email has been sent from an automated system - please do not reply.</strong></p>
`.trim();

// Sau khi đi: cảm ơn khách sau khi trả phòng, tóm tắt kỳ nghỉ và mời đánh giá.
export const TEMPLATE_DEPARTED = `
<p class="cf-confirm-title">THANK YOU FOR STAYING WITH US</p>
<p>Dear <span class="cf-tag">[Guest_Name]</span>,</p>
<p>Thank you for choosing <strong><span class="cf-tag">[Hotel_Name]</span></strong> for your recent stay. We hope you had a pleasant experience and we look forward to welcoming you back soon.</p>
<h4 class="cf-section-title">Stay Summary</h4>
<table class="cf-detail-table">
  <tbody>
    <tr><td>Room</td><td>: <span class="cf-tag">[RoomType]</span> - <span class="cf-tag">[RoomNo]</span></td></tr>
    <tr><td>Check In</td><td>: <span class="cf-tag">[ArrivalDate]</span></td></tr>
    <tr><td>Check Out</td><td>: <span class="cf-tag">[DepartureDate]</span></td></tr>
    <tr><td>Nights</td><td>: <span class="cf-tag">[NoOfNights]</span></td></tr>
  </tbody>
</table>
<h4 class="cf-section-title">Services Used</h4>
<p><span class="cf-tag">[listservice]</span></p>
<p class="cf-muted">- <span class="cf-tag">[Service_Name]</span> x <span class="cf-tag">[Number_Of_Services]</span> : <span class="cf-tag">[Service_Cost]</span></p>
<p><span class="cf-tag">[/listservice]</span></p>
<h4 class="cf-section-title">Bill Summary</h4>
<table class="cf-detail-table">
  <tbody>
    <tr><td>Room Charges</td><td>: <span class="cf-tag">[Total_Room_Price]</span></td></tr>
    <tr><td>Service Charges</td><td>: <span class="cf-tag">[Total_Service_Price]</span></td></tr>
    <tr><td>Total Paid</td><td>: <span class="cf-tag">[Total_Price]</span></td></tr>
  </tbody>
</table>
<p>We would love to hear about your experience. Your feedback helps us serve you even better on your next visit.</p>
<p class="cf-muted"><span class="cf-tag">[Hotel_Name]</span> | <span class="cf-tag">[Hotel_Address]</span> | <span class="cf-tag">[Hotel_Phone]</span> | <span class="cf-tag">[Hotel_Email]</span> | <span class="cf-tag">[Hotel_Website]</span></p>
<p><strong>This email has been sent from an automated system - please do not reply.</strong></p>
`.trim();

// Đang ở: chào mừng khách ngay sau khi nhận phòng, cung cấp thông tin cần thiết cho kỳ nghỉ.
export const TEMPLATE_INHOUSE = `
<p class="cf-confirm-title">WELCOME TO <span class="cf-tag">[Hotel_Name]</span></p>
<p>Dear <span class="cf-tag">[Guest_Name]</span>,</p>
<p>We are delighted to welcome you. Below are your stay details for your reference during your time with us.</p>
<h4 class="cf-section-title">Your Stay</h4>
<table class="cf-detail-table">
  <tbody>
    <tr><td>Room</td><td>: <span class="cf-tag">[RoomType]</span> - <span class="cf-tag">[RoomNo]</span></td></tr>
    <tr><td>Check In</td><td>: <span class="cf-tag">[ArrivalDate]</span> (<span class="cf-tag">[TimeInPrivate]</span>)</td></tr>
    <tr><td>Check Out</td><td>: <span class="cf-tag">[DepartureDate]</span> (<span class="cf-tag">[TimeOutPrivate]</span>)</td></tr>
    <tr><td>Guests</td><td>: <span class="cf-tag">[Adult]</span> Adult(s), <span class="cf-tag">[Child]</span> Child(ren)</td></tr>
  </tbody>
</table>
<h4 class="cf-section-title">Need Anything?</h4>
<p class="cf-muted">Our front desk is available around the clock. Reach us anytime at <span class="cf-tag">[Hotel_Phone]</span> or <span class="cf-tag">[Hotel_Email]</span>.</p>
<h4 class="cf-section-title">Hotel Policy</h4>
<p class="cf-muted">...</p>
<p><strong>This email has been sent from an automated system - please do not reply.</strong></p>
`.trim();

// Sinh nhật: lời chúc mừng sinh nhật, không dùng thông tin phòng.
export const TEMPLATE_BIRTHDAY = `
<p class="cf-confirm-title">HAPPY BIRTHDAY, <span class="cf-tag">[Guest_Name]</span>!</p>
<p>Dear <span class="cf-tag">[Guest_Name]</span>,</p>
<p>The entire team at <strong><span class="cf-tag">[Hotel_Name]</span></strong> wishes you a very happy birthday! To celebrate, we would love to welcome you back for a special stay.</p>
<h4 class="cf-section-title">A Gift From Us</h4>
<p class="cf-muted">Book your next stay with us and enjoy an exclusive birthday offer, valid for a limited time.</p>
<h4 class="cf-section-title">Contact Us</h4>
<table class="cf-detail-table">
  <tbody>
    <tr><td>Phone</td><td>: <span class="cf-tag">[Hotel_Phone]</span></td></tr>
    <tr><td>Email</td><td>: <span class="cf-tag">[Hotel_Email]</span></td></tr>
    <tr><td>Website</td><td>: <span class="cf-tag">[Hotel_Website]</span></td></tr>
  </tbody>
</table>
<p><strong>This email has been sent from an automated system - please do not reply.</strong></p>
`.trim();

export const TEMPLATES_BY_TRIGGER = {
  upcoming: TEMPLATE_UPCOMING,
  departed: TEMPLATE_DEPARTED,
  inhouse: TEMPLATE_INHOUSE,
  birthday: TEMPLATE_BIRTHDAY,
};
