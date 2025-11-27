// CONTROLE DO MODAL DE DETALHES
(function ($) {
  // Elementos do modal
  const $modal = $("#modal");
  const $conteudo = $("#modal-body");
  const $fechar = $("#modal-close");

  // Abre o modal com conteúdo HTML recebido
  function abrir(html) {
    $conteudo.html(html);
    $modal.fadeIn(150).attr("aria-hidden", "false");
  }

  // Fecha o modal
  function fechar() {
    $modal.fadeOut(120).attr("aria-hidden", "true");
    $conteudo.empty();
  }

  // Eventos para fechar
  $fechar.on("click", fechar);
  $modal.find(".modal-overlay").on("click", fechar);

  // Fecha ao apertar ESC
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") fechar();
  });

  // Torna disponível para o main.js
  window.CatalogModal = {
    abrir,
    fechar,
  };
})(jQuery);
