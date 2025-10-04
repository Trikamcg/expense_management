export function handleLogin(authForm, displayUsername, roleDisplay, dashboardSection, authSection, updateHistory, updateSummary, updateApprovals) {
  authForm.addEventListener('submit', e => {
    e.preventDefault();
    const usernameInput = authForm.querySelector('#auth-username');
    if (!usernameInput.value.trim()) {
      alert('Please enter username');
      usernameInput.focus();
      return;
    }
    const currentUser = usernameInput.value.trim();
    const currentRole = "employee"; // Add real role from backend here

    displayUsername.textContent = currentUser;
    roleDisplay.textContent = currentRole;

    dashboardSection.style.display = "block";
    authSection.style.display = "none";

    updateHistory();
    updateSummary();

    if (["manager", "admin"].includes(currentRole)) {
      document.getElementById("approval-section").style.display = "block";
      updateApprovals();
    } else {
      document.getElementById("approval-section").style.display = "none";
    }
  });
}

export function handleLogout(authForm, dashboardSection, authSection) {
  authForm.reset();
  dashboardSection.style.display = "none";
  authSection.style.display = "block";
}
