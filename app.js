function showView(viewId) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(viewId).classList.add('active');
}

function logout() {
  alert("Logged out!");
  // Add redirect or session clear logic here
}
