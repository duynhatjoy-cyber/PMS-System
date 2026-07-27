export const SMTP_TYPES = [
  { value: "gmail", label: "Gmail" },
  { value: "outlook", label: "Outlook" },
  { value: "custom", label: "SMTP tùy chỉnh" },
];

export const DEFAULT_HEADER_HTML = `
<div class="cfg-banner"><span class="cf-tag">[Hotel_Name]</span></div>
`.trim();

export const DEFAULT_FOOTER_HTML = `
<p class="cf-muted">*** MỌI THẮC MẮC XIN LIÊN HỆ ***</p>
<p>P: <span class="cf-tag">[Hotel_Phone]</span></p>
<p>A: <span class="cf-tag">[Hotel_Address]</span></p>
<p>E: <span class="cf-tag">[Hotel_Email]</span></p>
`.trim();

export const EMAIL_CONFIGS = [
  {
    id: "ec-1",
    name: "Nhà Của My",
    email: "smtp@nhacuamy.vn",
    status: "active",
    type: "gmail",
    host: "smtp.gmail.com",
    port: "587",
    accountName: "smtp@nhacuamy.vn",
    password: "123456",
    headerHtml: DEFAULT_HEADER_HTML,
    footerHtml: DEFAULT_FOOTER_HTML,
  },
];
