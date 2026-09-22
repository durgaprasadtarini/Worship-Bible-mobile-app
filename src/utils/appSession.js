// Plain module-scoped flag — resets naturally every cold app launch (a
// fresh JS bundle instance), but stays put across screen navigation within
// the same launch. Used so the daily-message overlay shows once per open,
// not once ever (that would need AsyncStorage) and not on every screen
// focus (that would need a ref reset elsewhere).
let dailyMessageShown = false;

export function shouldShowDailyMessage() {
  if (dailyMessageShown) return false;
  dailyMessageShown = true;
  return true;
}
