import React from 'react';
import { useSharing } from '../SharingContext';

/**
 * PUBLIC_INTERFACE
 * SharedItemsList
 * Displays and manages locally stored "shared" items. Future: connect to backend shares/feed items.
 */
export default function SharedItemsList() {
  const { state, actions } = useSharing();

  const items = state.items || [];

  function togglePublish(item) {
    actions.updateShare(item.id, { status: item.status === 'published' ? 'draft' : 'published' });
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Your Shared Items</h3>
      {items.length === 0 ? (
        <div style={styles.empty}>No shared items yet.</div>
      ) : (
        <ul style={styles.list}>
          {items.map((it) => (
            <li key={it.id} style={styles.item}>
              <div style={{ flex: 1 }}>
                <div style={styles.titleRow}>
                  <strong>{it.title}</strong>
                  <span style={styles.badge}>{it.type}</span>
                  {it.exportFormat && <span style={styles.badgeMuted}>{it.exportFormat}</span>}
                </div>
                <div style={styles.meta}>
                  <span>Created: {new Date(it.createdAt).toLocaleString()}</span>
                  <span>Visibility: {it.visibility}</span>
                  <span>Status: {it.status}</span>
                </div>
              </div>
              <div style={styles.actions}>
                <button style={styles.secondaryBtn} onClick={() => togglePublish(it)}>
                  {it.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button style={styles.dangerBtn} onClick={() => actions.deleteShare(it.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={styles.hint}>Note: Items are stored locally for now. They will sync when backend is connected.</div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 16,
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginTop: 16,
  },
  heading: { margin: 0, marginBottom: 12 },
  empty: { color: '#666' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid #eee',
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
  badge: { background: '#1976D2', color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 12, textTransform: 'capitalize' },
  badgeMuted: { background: '#eee', color: '#333', borderRadius: 12, padding: '2px 8px', fontSize: 12, textTransform: 'uppercase' },
  meta: { display: 'flex', gap: 16, color: '#666', fontSize: 12 },
  actions: { display: 'flex', gap: 8 },
  secondaryBtn: { background: '#f2f6ff', color: '#1976D2', border: '1px solid #1976D2', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' },
  dangerBtn: { background: '#ffebee', color: '#c62828', border: '1px solid #c62828', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' },
  hint: { marginTop: 8, color: '#666', fontSize: 12 },
};
