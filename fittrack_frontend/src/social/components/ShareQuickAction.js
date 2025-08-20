import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * ShareQuickAction
 * A lightweight button to navigate to the Sharing page.
 */
export default function ShareQuickAction({ label = 'Share / Export' }) {
  return (
    <Link to="/share" style={styles.linkBtn}>{label}</Link>
  );
}

const styles = {
  linkBtn: {
    background: '#1976D2',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: 6,
    textDecoration: 'none',
    fontSize: 14,
  },
};
