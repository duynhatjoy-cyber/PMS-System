import { getGuestTier } from "../../../data/guestData";
import styles from "../Guests.module.css";

function TierBadge({ stayCount }) {
  const tier = getGuestTier(stayCount);
  return (
    <span className={styles.tierBadge} style={{ color: tier.color, background: tier.soft }}>
      {tier.label}
    </span>
  );
}

export default TierBadge;
