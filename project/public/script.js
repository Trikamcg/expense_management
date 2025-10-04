const alertPlaceholder = document.getElementById('alert-placeholder');

function showAlert(message, type = 'success', timeout = 3000) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  alertPlaceholder.append(wrapper);
  if (timeout > 0) setTimeout(() => wrapper.remove(), timeout);
}

async function signupAPI(username, password, email) {
  const response = await fetch('http://localhost:3000/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }
  return await response.json();
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!signupForm.checkValidity()) {
      signupForm.classList.add('was-validated');
      return;
    }

    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
      showAlert('Passwords do not match!', 'danger');
      return;
    }

    try {
      await signupAPI(username, password, email);
      showAlert('Signup successful! Please login with your credentials.');
      signupForm.reset();
      signupForm.classList.remove('was-validated');
    } catch (err) {
      showAlert(err.message, 'danger');
    }
  });
}
