let editandoId = null;

        // Função para carregar produtos do servidor
        async function carregarProdutos() {
            try {
                document.getElementById('loading-message').style.display = 'block';
                document.getElementById('empty-message').style.display = 'none';
                document.getElementById('error-message').style.display = 'none';
                document.getElementById('produtos-container').innerHTML = '';
                
                const response = await fetch('/produtos');
                
                if (!response.ok) {
                    throw new Error('Erro ao carregar produtos');
                }
                
                const produtos = await response.json();
                
                document.getElementById('loading-message').style.display = 'none';
                
                if (produtos.length === 0) {
                    document.getElementById('empty-message').style.display = 'block';
                } else {
                    renderizarProdutos(produtos);
                }
            } catch (error) {
                console.error('Erro:', error);
                document.getElementById('loading-message').style.display = 'none';
                document.getElementById('error-message').style.display = 'block';
            }
        }

        // Função para renderizar produtos
        function renderizarProdutos(produtos) {
            const container = document.getElementById('produtos-container');
            container.innerHTML = '';
            
            produtos.forEach(produto => {
                const card = document.createElement('div');
                card.className = 'produto-card';
                card.innerHTML = `
                    <img src="${produto.imagem || 'https://via.placeholder.com/300x150/2d2d42/9d4edd?text=Sem+Imagem'}" alt="${produto.nome}">
                    <div class="produto-body">
                        <h3 class="produto-nome">${produto.nome}</h3>
                        <p class="produto-preco">R$ ${parseFloat(produto.preco).toFixed(2)}</p>
                        <p class="produto-desc">${produto.descricao || 'Sem descrição'}</p>
                        <div class="produto-actions">
                            <button class="btn-editar" onclick="editarProduto(${produto.id})">Editar</button>
                            <button class="btn-excluir" onclick="excluirProduto(${produto.id})">Excluir</button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        // Função para adicionar/editar produto
        document.getElementById('produto-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nome').value;
            const preco = parseFloat(document.getElementById('preco').value);
            const descricao = document.getElementById('descricao').value;
            const imagem = document.getElementById('imagem').value;
            
            try {
                if (editandoId) {
                    // Editar produto existente
                    const response = await fetch(`/produtos/${editandoId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            nome,
                            preco,
                            descricao,
                            imagem
                        })
                    });
                    
                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Erro ao atualizar produto');
                    }
                    
                    mostrarMensagem('Produto atualizado com sucesso!', 'success');
                    editandoId = null;
                    document.getElementById('form-title').textContent = 'Adicionar Novo Produto';
                    document.getElementById('submit-btn').textContent = 'Adicionar Produto';
                    document.getElementById('cancel-btn').style.display = 'none';
                } else {
                    // Adicionar novo produto
                    const response = await fetch('/produtos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            nome,
                            preco,
                            descricao,
                            imagem
                        })
                    });
                    
                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Erro ao adicionar produto');
                    }
                    
                    mostrarMensagem('Produto adicionado com sucesso!', 'success');
                }
                
                // Limpar formulário
                document.getElementById('produto-form').reset();
                
                // Recarregar produtos
                carregarProdutos();
                
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem(error.message, 'error');
            }
        });

        // Função para editar produto
        async function editarProduto(id) {
            try {
                const response = await fetch(`/produtos/${id}`);
                
                if (!response.ok) {
                    throw new Error('Erro ao carregar produto');
                }
                
                const produto = await response.json();
                
                document.getElementById('nome').value = produto.nome;
                document.getElementById('preco').value = produto.preco;
                document.getElementById('descricao').value = produto.descricao || '';
                document.getElementById('imagem').value = produto.imagem || '';
                
                editandoId = id;
                document.getElementById('form-title').textContent = 'Editar Produto';
                document.getElementById('submit-btn').textContent = 'Atualizar Produto';
                document.getElementById('cancel-btn').style.display = 'inline-block';
                
                // Scroll para o formulário
                document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                console.error('Erro:', error);
                mostrarMensagem('Erro ao carregar produto para edição', 'error');
            }
        }

        // Função para excluir produto
        async function excluirProduto(id) {
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                try {
                    const response = await fetch(`/produtos/${id}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.error || 'Erro ao excluir produto');
                    }
                    
                    mostrarMensagem('Produto excluído com sucesso!', 'success');
                    carregarProdutos();
                    
                } catch (error) {
                    console.error('Erro:', error);
                    mostrarMensagem(error.message, 'error');
                }
            }
        }

        // Função para cancelar edição
        document.getElementById('cancel-btn').addEventListener('click', function() {
            editandoId = null;
            document.getElementById('produto-form').reset();
            document.getElementById('form-title').textContent = 'Adicionar Novo Produto';
            document.getElementById('submit-btn').textContent = 'Adicionar Produto';
            document.getElementById('cancel-btn').style.display = 'none';
        });

        // Função para mostrar mensagens
        function mostrarMensagem(mensagem, tipo) {
            const flash = document.createElement('div');
            flash.className = `flash-message ${tipo}`;
            flash.textContent = mensagem;
            document.body.appendChild(flash);
            
            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(flash);
                }, 300);
            }, 3000);
        }

        // Inicializar a página
        document.addEventListener('DOMContentLoaded', function() {
            carregarProdutos();
        });
