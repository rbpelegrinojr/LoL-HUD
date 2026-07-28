const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }

    window.location.assign('/admin/dashboard');
  });
}
