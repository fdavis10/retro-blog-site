import React, { useState } from 'react';
import { SMILEYS } from '../utils/smilies';

const SmileyPicker = ({ onInsert, visible }) => {
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

  return (
    <div className="smiley-picker-wrapper" style={{ position: 'relative' }}>
      <button
        type="button"
        className="smiley-picker-btn"
        onClick={() => setExpanded(!expanded)}
        title="Смайлы"
        style={{
          background: 'none',
          border: 'none',
          padding: '6px 8px',
          cursor: 'pointer',
          fontSize: '18px',
          color: 'var(--fb-text-light)',
          borderRadius: '2px',
        }}
      >
        😊
      </button>
      {expanded && (
        <>
          <div
            className="smiley-overlay"
            onClick={() => setExpanded(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}
          />
          <div
            className="smiley-picker"
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              marginBottom: '5px',
              backgroundColor: 'var(--fb-white)',
              border: '1px solid var(--fb-border)',
              borderRadius: '3px',
              padding: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 999,
              maxWidth: '220px',
            }}
          >
            {SMILEYS.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => {
                  onInsert(s.code);
                  setExpanded(false);
                }}
                title={s.label}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  borderRadius: '2px',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--fb-hover)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                {s.img}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SmileyPicker;
