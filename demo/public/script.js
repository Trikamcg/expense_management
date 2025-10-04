const alertPlaceholder = document.getElementById('alert-placeholder');

function showAlert(message, type = 'success') {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  alertPlaceholder.append(wrapper);
}

function validateForm(form) {
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return false;
  }
  return true;
}

// Login Form Submit
const authForm = document.getElementById('authForm');
const dashboard = document.getElementById('dashboard-section');
const authSection = document.getElementById('auth-section');

authForm.onsubmit = function (e) {
  e.preventDefault();
  if (!validateForm(authForm)) return;
  const username = document.getElementById('auth-username').value.trim();
  dashboard.style.display = 'block';
  authSection.style.display = 'none';
  document.getElementById('display-username').textContent = username;
  showAlert('Logged in successfully');
};

// Signup Form Submit
const signupForm = document.getElementById('signupForm');
signupForm.onsubmit = function (e) {
  e.preventDefault();
  if (!validateForm(signupForm)) return;
  const username = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  if (password !== confirmPassword) {
    showAlert('Passwords do not match!', 'danger');
    return;
  }
  showAlert('Signup successful! Please login with your credentials.');
  const modalElement = document.getElementById('signupModal');
  const modal = bootstrap.Modal.getInstance(modalElement);
  modal.hide();
  signupForm.reset();
};

// Show signup modal on button click
document.getElementById('signup-btn').onclick = function () {
  const modal = new bootstrap.Modal(document.getElementById('signupModal'));
  modal.show();
};

function logout() {
  authSection.style.display = 'block';
  dashboard.style.display = 'none';
  document.getElementById('authForm').reset();
  showAlert('Logged out successfully', 'info');
}

