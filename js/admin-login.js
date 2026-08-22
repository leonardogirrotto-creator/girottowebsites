(function () {
  "use strict";

  var form = document.getElementById("login-form");
  var errorEl = document.getElementById("login-error");

  function showError(text) {
    errorEl.textContent = text;
    errorEl.style.display = text ? "block" : "none";
  }

  window.supabaseClient.auth.getSession().then(function (res) {
    if (res.data.session) {
      window.location.href = "index.html";
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    showError("");

    var email = form.email.value.trim();
    var password = form.password.value;
    var submitBtn = form.querySelector("button[type=submit]");

    submitBtn.disabled = true;

    window.supabaseClient.auth
      .signInWithPassword({ email: email, password: password })
      .then(function (res) {
        submitBtn.disabled = false;
        if (res.error) {
          showError("E-mail ou senha inválidos.");
          return;
        }
        window.location.href = "index.html";
      });
  });
})();
