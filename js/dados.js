/* dados.js
  - Contém o módulo ProdutosData com CRUD (em memória + localStorage)
  - Interface simples:
    loadInitialFromJSON(url),
    getAll(),
    add(prod),
    removeById(id),
    save(),
    resetToInitial()
*/

const ProdutosData = (function () {
  const STORAGE_KEY = "catalogo_produtos_v2";

  let produtos = [];
  let initial = [];

  // Carrega produtos iniciais a partir de um arquivo JSON
  // Retorna uma Promise
  function loadInitialFromJSON(url) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: url,
        dataType: "json",
        method: "GET",
        cache: false,
        success: function (data) {
          if (data && Array.isArray(data.produtos)) {
            initial = data.produtos.map((p) => ({ ...p })); // clonagem
            produtos = initial.slice();
            save();
            resolve(produtos);
          } else {
            reject(new Error('JSON inválido: array "produtos" não encontrado'));
          }
        },
        error: function (xhr, status, err) {
          reject(err || status);
        },
      });
    });
  }

  // Carrega dados do localStorage, se existirem
  function loadFromLocalStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        produtos = arr;
        return true;
      }
    } catch (e) {
      console.error("Erro ao processar localStorage", e);
    }

    return false;
  }

  // Salva os produtos no localStorage
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
  }

  // Retorna uma cópia da lista de produtos
  function getAll() {
    return produtos.slice();
  }

  // Adiciona um novo produto
  function add(prod) {
    // Garante um ID único incremental
    const nextId = produtos.length
      ? Math.max(...produtos.map((p) => Number(p.id))) + 1
      : 1;

    const novo = {
      id: nextId,
      nome: String(prod.nome || "").trim(),
      categoria: String(prod.categoria || "Outros").trim(),
      preco: Number(prod.preco || 0),
      descricao: String(prod.descricao || ""),
      imagem: prod.imagem || "assets/images/MouseGamerRGB.jpeg",
      estoque: Number(prod.estoque || 0),
    };

    produtos.push(novo);
    save();
    return novo;
  }

  // Remove produto pelo ID
  function removeById(id) {
    const before = produtos.length;
    produtos = produtos.filter((p) => Number(p.id) !== Number(id));
    const removed = produtos.length !== before;

    if (removed) save();
    return removed;
  }

  // Busca produto pelo ID
  function findById(id) {
    return produtos.find((p) => Number(p.id) === Number(id));
  }

  // Retorna categorias únicas ordenadas
  function getCategorias() {
    const cats = produtos.map((p) => p.categoria || "Outros");
    return Array.from(new Set(cats)).sort();
  }

  // Restaura os produtos iniciais
  function resetToInitial() {
    produtos = initial.slice();
    save();
  }

  // Inicialização automática
  (function init() {
    const ok = loadFromLocalStorage();
    if (!ok) {
      // Se não houver dados no localStorage, lista começa vazia
      produtos = [];
    }
  })();

  return {loadInitialFromJSON,loadFromLocalStorage,save,getAll,add,removeById,findById,getCategorias,resetToInitial,
  };
})();
