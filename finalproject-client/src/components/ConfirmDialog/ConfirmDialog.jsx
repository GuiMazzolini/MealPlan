import "./ConfirmDialog.css";

function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel} role="presentation">
      <div
        className="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="confirm-btn confirm-btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="confirm-btn confirm-btn--danger" onClick={onConfirm}>
            {confirmLabel || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
