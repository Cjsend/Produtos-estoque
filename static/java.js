// URL da API - usando localStorage para simular uma "API"
        const API_BASE = 'produtos';
        let editandoId = null;

        // Inicialização
        document.addEventListener('DOMContentLoaded', function() {
            // Inicializar dados se não existirem
            if (!localStorage.getItem(API_BASE)) {
                localStorage.setItem(API_BASE, JSON.stringify([]));
            }
            
            carregarProdutos();
            
            // Configurar o formulário
            document.getElementById('produto-form').addEventListener('submit', function(e) {
                e.preventDefault();
                if (editandoId) {
                    atualizarProduto(editandoId);
                } else {
                    adicionarProduto();
                }
            });
            
            // Configurar botão cancelar
            document.getElementById('cancel-btn').addEventListener('click', function() {
                cancelarEdicao();
            });
        });

        // Funções para simular API usando localStorage
        function getProdutos() {
            return JSON.parse(localStorage.getItem(API_BASE) || '[]');
        }

        function salvarProdutos(produtos) {
            localStorage.setItem(API_BASE, JSON.stringify(produtos));
        }

        // Carregar produtos
        async function carregarProdutos() {
            try {
                mostrarEstado('loading');
                
                // Simular delay de rede
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const produtos = getProdutos();
                
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
                    <td>
                        <button class="btn-editar" onclick="iniciarEdicao(${produto.id}, '${produto.nome.replace(/'/g, "\\'")}', ${produto.quantidade})">Editar</button>
                        <button class="btn-excluir" onclick="excluirProduto(${produto.id})">Excluir</button>
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
                alert('Por favor, preencha todos os campos corretamente.');
                return;
            }
            
            try {
                const produtos = getProdutos();
                
                // Gerar novo ID
                const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
                
                // Adicionar novo produto
                const novoProduto = {
                    id: novoId,
                    nome: nome,
                    quantidade: quantidade
                };
                
                produtos.push(novoProduto);
                salvarProdutos(produtos);
                
                // Limpar formulário e recarregar produtos
                document.getElementById('produto-form').reset();
                carregarProdutos();
                
                // Feedback visual
                mostrarMensagem('Produto adicionado com sucesso!', 'success');
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('Erro ao adicionar produto.', 'error');
            }
        }

        // Iniciar edição de produto
        function iniciarEdicao(id, nome, quantidade) {
            editandoId = id;
            
            // Preencher formulário com dados do produto
            document.getElementById('nome').value = nome;
            document.getElementById('quantidade').value = quantidade;
            
            // Alterar interface para modo edição
            document.getElementById('form-title').textContent = 'Editando Produto';
            document.getElementById('submit-btn').textContent = 'Atualizar Produto';
            document.getElementById('cancel-btn').style.display = 'inline-block';
            
            // Rolagem suave para o formulário
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        }

        // Atualizar produto
        async function atualizarProduto(id) {
            const nome = document.getElementById('nome').value.trim();
            const quantidade = parseInt(document.getElementById('quantidade').value);
            
            if (!nome || isNaN(quantidade) || quantidade < 0) {
                alert('Por favor, preencha todos os campos corretamente.');
                return;
            }
            
            try {
                const produtos = getProdutos();
                
                // Encontrar e atualizar produto
                const produtoIndex = produtos.findIndex(p => p.id === id);
                if (produtoIndex !== -1) {
                    produtos[produtoIndex] = {
                        id: id,
                        nome: nome,
                        quantidade: quantidade
                    };
                    
                    salvarProdutos(produtos);
                    
                    // Limpar formulário e recarregar produtos
                    cancelarEdicao();
                    carregarProdutos();
                    
                    // Feedback visual
                    mostrarMensagem('Produto atualizado com sucesso!', 'success');
                } else {
                    throw new Error('Produto não encontrado');
                }
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('Erro ao atualizar produto.', 'error');
            }
        }

        // Cancelar edição
        function cancelarEdicao() {
            editandoId = null;
            
            // Limpar formulário
            document.getElementById('produto-form').reset();
            
            // Restaurar interface para modo adição
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
                const produtos = getProdutos();
                
                // Filtrar produto a ser excluído
                const produtosAtualizados = produtos.filter(p => p.id !== id);
                
                salvarProdutos(produtosAtualizados);
                
                // Recarregar produtos
                carregarProdutos();
                
                // Feedback visual
                mostrarMensagem('Produto excluído com sucesso!', 'success');
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('Erro ao excluir produto.', 'error');
            }
        }

        // Controlar estados da interface
        function mostrarEstado(estado) {
            // Ocultar todos os estados
            document.getElementById('loading-message').style.display = 'none';
            document.getElementById('empty-message').style.display = 'none';
            document.getElementById('error-message').style.display = 'none';
            document.getElementById('produtos-table').style.display = 'none';
            
            // Mostrar estado solicitado
            switch(estado) {
                case 'loading':
                    document.getElementById('loading-message').style.display = 'block';
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
            // Criar elemento de mensagem
            const mensagemEl = document.createElement('div');
            mensagemEl.textContent = mensagem;
            mensagemEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: opacity 0.3s;
            `;
            
            // Definir cor baseada no tipo
            if (tipo === 'success') {
                mensagemEl.style.backgroundColor = '#2ecc71';
            } else {
                mensagemEl.style.backgroundColor = '#e74c3c';
            }
            
            // Adicionar ao DOM
            document.body.appendChild(mensagemEl);
            
            // Remover após 3 segundos
            setTimeout(() => {
                mensagemEl.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(mensagemEl);
                }, 300);
            }, 3000);
        }
