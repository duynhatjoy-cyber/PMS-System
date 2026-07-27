import styles from "./EmailRenderedContent.module.css";

function EmailRenderedContent({ html, className, stacked }) {
  return (
    <div
      className={`${styles.content} ${stacked ? styles.contentStacked : ""} ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default EmailRenderedContent;
