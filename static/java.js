 const API_URL = 'http://127.0.0.1:5000/produtos';
        let editandoId = null;

        // Inicialização
        document.addEventListener('DOMContentLoaded', function() {
            carregarProdutos();
            
            document.getElementById('produto-form').addEventListener('submit', function(e) {
                e.preventDefault();
                if (editandoId) {
                    atualizarProduto(editandoId);
                } else {
                    adicionarProduto();
                }
            });
            
            document.getElementById('cancel-btn').addEventListener('click', cancelarEdicao);
        });

        // Carregar produtos da API
        async function carregarProdutos() {
            try {
                mostrarEstado('loading');
                
                const response = await fetch(API_URL);
                
                if (!response.ok) {
                    throw new Error('Erro ao carregar produtos');
                }
                
                const produtos = await response.json();
                
                if (produtos.length === 0) {
                    mostrarEstado('empty');
                } else {
                    mostrarEstado('table');
                    renderizarProdutos(produtos);
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarEstado('error');
            }
        }

        // Renderizar produtos na tabela
        function renderizarProdutos(produtos) {
            const tbody = document.getElementById('produtos-tbody');
            tbody.innerHTML = '';
            
            produtos.forEach(produto => {
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td>${produto.id}</td>
                    <td>${produto.nome}</td>
                    <td>${produto.quantidade}</td>
                    <td class="actions">
                        <button class="btn-editar" onclick="iniciarEdicao(${produto.id}, '${produto.nome.replace(/'/g, "\\'")}', ${produto.quantidade})">
                            ✏️ Editar
                        </button>
                        <button class="btn-excluir" onclick="excluirProduto(${produto.id})">
                            🗑️ Excluir
                        </button>
                    </td>
                `;
                
                tbody.appendChild(tr);
            });
        }

        // Adicionar novo produto
        async function adicionarProduto() {
            const nome = document.getElementById('nome').value.trim();
            const quantidade = parseInt(document.getElementById('quantidade').value);
            
            if (!nome || isNaN(quantidade) || quantidade < 0) {
                mostrarMensagem('Por favor, preencha todos os campos corretamente.', 'error');
                return;
            }
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nome, quantidade })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Erro ao adicionar produto');
                }
                
                document.getElementById('produto-form').reset();
                await carregarProdutos();
                mostrarMensagem('✅ Produto adicionado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('❌ ' + error.message, 'error');
            }
        }

        // Iniciar edição de produto
        function iniciarEdicao(id, nome, quantidade) {
            editandoId = id;
            
            document.getElementById('nome').value = nome;
            document.getElementById('quantidade').value = quantidade;
            
            document.getElementById('form-title').textContent = 'Editando Produto';
            document.getElementById('submit-btn').textContent = 'Atualizar Produto';
            document.getElementById('cancel-btn').style.display = 'inline-block';
            
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('nome').focus();
        }

        // Atualizar produto
        async function atualizarProduto(id) {
            const nome = document.getElementById('nome').value.trim();
            const quantidade = parseInt(document.getElementById('quantidade').value);
            
            if (!nome || isNaN(quantidade) || quantidade < 0) {
                mostrarMensagem('Por favor, preencha todos os campos corretamente.', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nome, quantidade })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Erro ao atualizar produto');
                }
                
                cancelarEdicao();
                await carregarProdutos();
                mostrarMensagem('✅ Produto atualizado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('❌ ' + error.message, 'error');
            }
        }

        // Cancelar edição
        function cancelarEdicao() {
            editandoId = null;
            document.getElementById('produto-form').reset();
            document.getElementById('form-title').textContent = 'Adicionar Novo Produto';
            document.getElementById('submit-btn').textContent = 'Adicionar Produto';
            document.getElementById('cancel-btn').style.display = 'none';
        }

        // Excluir produto
        async function excluirProduto(id) {
            if (!confirm('Tem certeza que deseja excluir este produto?')) {
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Erro ao excluir produto');
                }
                
                await carregarProdutos();
                mostrarMensagem('✅ Produto excluído com sucesso!', 'success');
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('❌ ' + error.message, 'error');
            }
        }

        // Controlar estados da interface
        function mostrarEstado(estado) {
            document.getElementById('loading-message').style.display = 'none';
            document.getElementById('empty-message').style.display = 'none';
            document.getElementById('error-message').style.display = 'none';
            document.getElementById('produtos-table').style.display = 'none';
            
            switch(estado) {
                case 'loading':
                    document.getElementById('loading-message').style.display = 'flex';
                    break;
                case 'empty':
                    document.getElementById('empty-message').style.display = 'block';
                    break;
                case 'error':
                    document.getElementById('error-message').style.display = 'block';
                    break;
                case 'table':
                    document.getElementById('produtos-table').style.display = 'table';
                    break;
            }
        }

        // Mostrar mensagem temporária
        function mostrarMensagem(mensagem, tipo) {
            const mensagemEl = document.createElement('div');
            mensagemEl.textContent = mensagem;
            mensagemEl.className = `flash-message ${tipo}`;
            
            document.body.appendChild(mensagemEl);
            
            setTimeout(() => {
                mensagemEl.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(mensagemEl)) {
                        document.body.removeChild(mensagemEl);
                    }
                }, 300);
            }, 4000);
          }
