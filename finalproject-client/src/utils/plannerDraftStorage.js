const CREATE_KEY = "mealplan-draft-create";

function getDraftKey(plannerId) {
  return plannerId ? `mealplan-draft-edit-${plannerId}` : CREATE_KEY;
}

export function loadPlannerDraft(plannerId) {
  try {
    const raw = sessionStorage.getItem(getDraftKey(plannerId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePlannerDraft(plannerId, draft) {
  try {
    sessionStorage.setItem(getDraftKey(plannerId), JSON.stringify(draft));
  } catch {
    // ignore storage errors
  }
}

export function clearPlannerDraft(plannerId) {
  sessionStorage.removeItem(getDraftKey(plannerId));
}
