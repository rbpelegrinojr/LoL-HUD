const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

function showError(message) {
  loginError.textContent = message;
  loginError.classList.remove('d-none');
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }

    loginError.classList.add('d-none');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        window.location.assign(data.redirect || '/admin/dashboard');
        return;
      }

      const data = await response.json().catch(() => ({}));
      showError(data.message || 'Invalid credentials');
    } catch (error) {
      showError('Unable to reach the server. Please try again.');
    }
  });
}
