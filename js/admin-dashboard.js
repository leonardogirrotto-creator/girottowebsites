(function () {
  "use strict";

  var STATUS_OPTIONS = ["novo", "em contato", "respondido", "descartado"];

  var tableBody = document.getElementById("solicitacoes-body");
  var stateEl = document.getElementById("admin-state");
  var userEmailEl = document.getElementById("user-email");
  var logoutBtn = document.getElementById("logout-btn");

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
  }

  function buildStatusSelect(current, id) {
    var select = document.createElement("select");
    select.className = "status-select";
    select.dataset.id = id;
    STATUS_OPTIONS.forEach(function (opt) {
      var option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      if (opt === current) option.selected = true;
      select.appendChild(option);
    });
    select.addEventListener("change", function () {
      window.supabaseClient
        .from("solicitacoes")
        .update({ status: select.value })
        .eq("id", id)
        .then(function (res) {
          if (res.error) {
            alert("Não foi possível atualizar o status.");
          }
        });
    });
    return select;
  }

  function renderRows(rows) {
    tableBody.innerHTML = "";

    if (!rows.length) {
      stateEl.textContent = "Nenhuma solicitação recebida ainda.";
      stateEl.style.display = "block";
      return;
    }

    stateEl.style.display = "none";

    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + formatDate(row.created_at) + "</td>" +
        "<td>" + escapeHtml(row.nome) + "</td>" +
        "<td><a href=\"mailto:" + escapeHtml(row.email) + "\">" + escapeHtml(row.email) + "</a></td>" +
        "<td>" + escapeHtml(row.tipo_projeto || "—") + "</td>" +
        "<td class=\"cell-msg\">" + escapeHtml(row.mensagem) + "</td>" +
        "<td class=\"status-cell\"></td>";
      tr.querySelector(".status-cell").appendChild(buildStatusSelect(row.status, row.id));
      tableBody.appendChild(tr);
    });
  }

  function loadSolicitacoes() {
    stateEl.textContent = "Carregando...";
    stateEl.style.display = "block";

    window.supabaseClient
      .from("solicitacoes")
      .select("*")
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) {
          stateEl.textContent = "Erro ao carregar as solicitações.";
          stateEl.style.display = "block";
          return;
        }
        renderRows(res.data);
      });
  }

  logoutBtn.addEventListener("click", function () {
    window.supabaseClient.auth.signOut().then(function () {
      window.location.href = "login.html";
    });
  });

  window.supabaseClient.auth.getSession().then(function (res) {
    var session = res.data.session;
    if (!session) {
      window.location.href = "login.html";
      return;
    }
    userEmailEl.textContent = session.user.email;
    loadSolicitacoes();
  });
})();
