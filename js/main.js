/* main.js */
$(document).ready(function () {
  const $btnCarregar = $("#btn-carregar");
  const $loading = $("#loading");
  const $produtosList = $("#produtos-list");
  const $inputBusca = $("#input-busca");
  const $selectCategoria = $("#select-categoria");
  const $selectOrdenar = $("#select-ordenar");
  const $selectPreco = $("#select-preco");
  const $btnLimpar = $("#btn-limpar");
  const $contador = $("#contador");
  const $nenhum = $("#nenhum");
  const $form = $("#form-cadastrar");
  const $btnResetForm = $("#btn-reset-form");

  let allProdutos = [];
  let exibidos = [];

  // --- render de cards ---
  function renderCards(lista) {
    $produtosList.empty();
    if (!lista || !lista.length) {
      $nenhum.show();
      $contador.text(0);
      return;
    }
    $nenhum.hide();

    lista.forEach((p) => {
      const img = p.imagem ? p.imagem : "assets/images/placeholder.png";
      const precoFormat = Number(p.preco || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const $card = $(`
        <article class="card" data-id="${p.id}">
          <img style="width: auto; height: auto;" src="${img}" alt="Imagem ${p.nome}" onerror="this.src='assets/images/placeholder.png'"/>
          <h3>${p.nome}</h3>
          <div class="categoria">${p.categoria}</div>
          <div class="preco">R$ ${precoFormat}</div>
          <div class="acoes">
            <button class="btn ver-detalhes">Ver Detalhes</button>
            <button class="btn sec btn-apagar">🗑️ Excluir</button>
          </div>
        </article>
      `);
      $produtosList.append($card.hide().fadeIn(220));
    });
    $contador.text(lista.length);
  }

  // --- aplicar filtros/ordenacao/busca ---
  function aplicarFiltros() {
    const termo = $inputBusca.val().trim().toLowerCase();
    const cat = $selectCategoria.val();
    const orden = $selectOrdenar.val();
    const preco = $selectPreco.val();

    let res = allProdutos.slice();

    if (termo)
      res = res.filter((p) => (p.nome || "").toLowerCase().includes(termo));

    if (cat && cat !== "todas") res = res.filter((p) => p.categoria === cat);

    if (preco && preco !== "todas") {
      if (preco === "0-100") res = res.filter((p) => p.preco <= 100);
      if (preco === "100-500")
        res = res.filter((p) => p.preco > 100 && p.preco <= 500);
      if (preco === "500-2000")
        res = res.filter((p) => p.preco > 500 && p.preco <= 2000);
      if (preco === "2000+") res = res.filter((p) => p.preco > 2000);
    }

    if (orden === "nome-asc") res.sort((a, b) => a.nome.localeCompare(b.nome));
    if (orden === "preco-asc") res.sort((a, b) => a.preco - b.preco);
    if (orden === "preco-desc") res.sort((a, b) => b.preco - a.preco);

    exibidos = res;
    renderCards(exibidos);
  }

  // --- popular select categorias ---
  function popularCategorias() {
    $selectCategoria.find('option[value!="todas"]').remove();
    const cats = ProdutosData.getCategorias();
    cats.forEach((c) =>
      $selectCategoria.append(`<option value="${c}">${c}</option>`)
    );
  }

  // --- carregar produtos (botão) - usa AJAX via ProdutosData.loadInitialFromJSON ---
  $btnCarregar.on("click", function () {
    $loading.show();
    ProdutosData.loadInitialFromJSON("data/produtos.json")
      .then(() => {
        allProdutos = ProdutosData.getAll();
        popularCategorias();
        aplicarFiltros();
      })
      .catch((err) => {
        console.error("Erro ao carregar JSON:", err);
        alert(
          "Não foi possível carregar produtos do JSON. Verifique o console e se está usando Live Server."
        );
      })
      .always(() => {
        $loading.hide();
      });
  });

  // --- inicial: tenta carregar do localStorage, se não tiver deixa vazio ---
  (function inicializar() {
    const ok = ProdutosData.loadFromLocalStorage();
    allProdutos = ProdutosData.getAll();
    if (allProdutos && allProdutos.length) {
      popularCategorias();
      aplicarFiltros();
    } else {
      // ainda não há dados em localStorage; usuário pode carregar via botão
      $contador.text(0);
    }
  })();

  // eventos UI
  $inputBusca.on("input", aplicarFiltros);
  $selectCategoria.on("change", aplicarFiltros);
  $selectOrdenar.on("change", aplicarFiltros);
  $selectPreco.on("change", aplicarFiltros);

  $btnLimpar.on("click", function () {
    $inputBusca.val("");
    $selectCategoria.val("todas");
    $selectOrdenar.val("padrao");
    $selectPreco.val("todas");
    aplicarFiltros();
  });

  // cadastrar produto (form)
  $form.on("submit", function (e) {
    e.preventDefault();
    const novo = {
      nome: $("#p-nome").val(),
      categoria: $("#p-categoria").val(),
      preco: parseFloat($("#p-preco").val()) || 0,
      descricao: $("#p-descricao").val(),
      imagem: $("#p-imagem").val() || "assets/images/placeholder.png",
      estoque: parseInt($("#p-estoque").val(), 10) || 0,
    };
    const criado = ProdutosData.add(novo);
    allProdutos = ProdutosData.getAll();
    popularCategorias();
    aplicarFiltros();
    // rolar até o produto recém criado (UI pequena melhoria)
    const $card = $produtosList.find(`[data-id="${criado.id}"]`);
    if ($card.length)
      $("html,body").animate({ scrollTop: $card.offset().top - 80 }, 300);
    // limpar form
    $form[0].reset();
    alert("Produto cadastrado com sucesso!");
  });

  $btnResetForm.on("click", function () {
    $form[0].reset();
  });

  // delegação: ver detalhes e apagar
  $produtosList.on("click", ".ver-detalhes", function () {
    const id = $(this).closest(".card").data("id");
    const p = ProdutosData.findById(id);
    if (!p) return;
    const html = `
      <div style="display:flex;gap:18px;flex-wrap:wrap">
        <img src="${p.imagem}"  onerror="this.src='assets/images/placeholder.png'" alt="${
      p.nome
    }" style="width:280px;max-width:100%;border-radius:8px" onerror="this.src='assets/images/placeholder.png'"/>
        <div style="flex:1;min-width:220px">
          <h2 id="modal-title">${p.nome}</h2>
          <p><strong>Categoria:</strong> ${p.categoria}</p>
          <p><strong>Preço:</strong> R$ ${Number(p.preco)
            .toFixed(2)
            .replace(".", ",")}</p>
          <p><strong>Estoque:</strong> ${p.estoque}</p>
          <p style="margin-top:8px">${p.descricao || ""}</p>
          <div style="margin-top:12px">
            <button id="modal-excluir" class="btn sec">Excluir este produto</button>
          </div>
        </div>
      </div>
    `;
    CatalogModal.abrir(html);

    // attach handler para excluir dentro do modal (delegated by one-time)
    $("#modal-body")
      .off("click", "#modal-excluir")
      .on("click", "#modal-excluir", function () {
        if (!confirm("Confirma exclusão deste produto?")) return;
        const removed = ProdutosData.removeById(id);
        if (removed) {
          allProdutos = ProdutosData.getAll();
          CatalogModal.fechar && CatalogModal.fechar(); // tentar fechar modal
          aplicarFiltros();
          popularCategorias();
          alert("Produto excluído.");
        } else {
          alert("Falha ao excluir produto.");
        }
      });
  });

  $produtosList.on("click", ".btn-apagar", function () {
    const id = $(this).closest(".card").data("id");
    if (!confirm("Confirma exclusão deste produto?")) return;
    const removed = ProdutosData.removeById(id);
    if (removed) {
      allProdutos = ProdutosData.getAll();
      aplicarFiltros();
      popularCategorias();
    } else {
      alert("Falha ao excluir produto.");
    }
  });
});
