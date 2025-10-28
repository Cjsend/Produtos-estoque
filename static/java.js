// pega referências a elementos do DOM
    const form = document.getElementById('form-produto');
    const lista = document.getElementById('lista');

    // função que busca produtos do back-end e renderiza na página
    async function carregarProdutos() {
      // chama a rota GET /produtos
      const res = await fetch('/produtos');
      // convierte resposta em JSON (array de produtos)
      const produtos = await res.json();

      // monta o HTML dos cards a partir do array de produtos
      lista.innerHTML = produtos.map(p => `
        <div class="card">
          <!-- exibe a imagem; se p.imagem for null/undefined usa placeholder -->
          <img src="${p.imagem || 'https://via.placeholder.com/150'}" alt="produto">
          <h3>${p.nome}</h3>
          <!-- mostra o preço — nota: aqui não formatamos casas decimais -->
          <p>R$ ${p.preco}</p>
          <p>${p.descricao || ''}</p>
          <!-- botão excluir chama função excluir passando o id -->
          <button onclick="excluir(${p.id})">Excluir</button>
        </div>
      `).join(''); // join para transformar array de strings em uma string só
    }

    // listener para submissão do formulário
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // evita que o formulário recarregue a página

      // FormData permite enviar texto + arquivos no mesmo request
      const dados = new FormData(form);

      // faz POST para /produtos com o body sendo o FormData
      await fetch('/produtos', { method: 'POST', body: dados });

      // limpa o formulário
      form.reset();

      // recarrega a lista para mostrar o novo produto
      carregarProdutos();
    });

    // função que deleta o produto por id
    async function excluir(id) {
      // chamada DELETE para /produtos/:id
      await fetch(`/produtos/${id}`, { method: 'DELETE' });
      // atualiza lista
      carregarProdutos();
    }

    // carrega os produtos ao abrir a página
    carregarProdutos();
