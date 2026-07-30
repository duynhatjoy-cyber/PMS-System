import "./emailTemplateTags.css";
import styles from "./EmailRenderedContent.module.css";

function EmailRenderedContent({ html, className, stacked }) {
  return (
    <div
      className={`${styles.content} email-template-body ${stacked ? "stacked" : ""} ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default EmailRenderedContent;
