(function () {
  "use strict";

  var root = document.documentElement;
  var themeToggle = document.getElementById("theme-toggle");
  var STORAGE_KEY = "girottowebsites-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  var saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    applyTheme(saved);
  } else {
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  themeToggle.addEventListener("click", function () {
    var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    var next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var form = document.getElementById("contact-form");
  var formStatus = document.getElementById("form-status");

  function setFormStatus(text, isError) {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.classList.toggle("is-error", !!isError);
    formStatus.classList.toggle("is-success", !isError && !!text);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!window.supabaseClient) {
        setFormStatus("Não foi possível enviar agora. Tente novamente em instantes.", true);
        return;
      }

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var whatsapp = form.whatsapp.value.trim();
      var project = form.project.value;
      var message = form.message.value.trim();
      var submitBtn = form.querySelector("button[type=submit]");

      submitBtn.disabled = true;
      setFormStatus("Enviando...", false);

      window.supabaseClient
        .from("solicitacoes")
        .insert({
          nome: name,
          email: email,
          whatsapp: whatsapp,
          tipo_projeto: project,
          mensagem: message
        })
        .then(function (result) {
          submitBtn.disabled = false;
          if (result.error) {
            setFormStatus("Erro ao enviar. Tente novamente em instantes.", true);
            return;
          }
          form.reset();
          setFormStatus("Mensagem enviada! Retornaremos em breve.", false);
        });
    });
  }
})();
