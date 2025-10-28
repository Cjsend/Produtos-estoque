from flask import Flask, request, jsonify, send_from_directory
from database import init_app, get_db
import json
import os

app = Flask(__name__)

# Inicializar banco de dados
init_app(app)

# database.py
import sqlite3
import os
from flask import g

def get_db_path():
    """Retorna o caminho para o banco de dados"""
    return os.path.join(os.path.dirname(__file__), 'produtos.db')

def init_app(app):
    """Inicializa a configuração do banco de dados no app Flask"""
    app.teardown_appcontext(close_db)

def get_db():
    """Obtém a conexão com o banco de dados"""
    if 'db' not in g:
        g.db = sqlite3.connect(
            get_db_path(),
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    
    return g.db

def close_db(e=None):
    """Fecha a conexão com o banco de dados"""
    db = g.pop('db', None)
    
    if db is not None:
        db.close()

        # Remove a referência ao banco de dados
        g.pop('db', None)

# Garante que a tabela `produtos` exista com os campos requeridos
def init_produtos_table():
    db = get_db()
    cur = db.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            preco REAL NOT NULL DEFAULT 0.0,
            descricao TEXT DEFAULT '',
            imagem TEXT DEFAULT ''
        )
    ''')
    db.commit()


# inicializa tabela de produtos
with app.app_context():
    init_produtos_table()

# No Jinja2 templates are used for the product UI; static files are served
@app.route('/')
def index():
    return jsonify({'message': 'Aula3 API is running. Visit /produto for the UI.'})

# GET - Listar todos os produtos
@app.route('/produtos', methods=['GET'])
def listar_produtos():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT id, nome, preco, descricao, imagem FROM produtos ORDER BY id DESC')
        produtos = cursor.fetchall()

        produtos_list = []
        for produto in produtos:
            produtos_list.append({
                'id': produto['id'],
                'nome': produto['nome'],
                'preco': produto['preco'],
                'descricao': produto['descricao'],
                'imagem': produto['imagem']
            })

        return jsonify(produtos_list)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST - Adicionar novo produto
@app.route('/produtos', methods=['POST'])
def adicionar_produto():
    try:
        data = request.get_json(force=True)
        nome = data.get('nome')
        preco = data.get('preco', 0)
        descricao = data.get('descricao', '')
        imagem = data.get('imagem', '')

        if not nome:
            return jsonify({'error': 'Nome é obrigatório'}), 400

        try:
            preco = float(preco)
        except Exception:
            return jsonify({'error': 'Preço inválido'}), 400

        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'INSERT INTO produtos (nome, preco, descricao, imagem) VALUES (?, ?, ?, ?)',
            (nome, preco, descricao, imagem)
        )
        db.commit()

        return jsonify({
            'id': cursor.lastrowid,
            'nome': nome,
            'preco': preco,
            'descricao': descricao,
            'imagem': imagem
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# PUT - Atualizar produto
@app.route('/produtos/<int:id>', methods=['PUT'])
def atualizar_produto(id):
    try:
        data = request.get_json(force=True)
        nome = data.get('nome')
        preco = data.get('preco')
        descricao = data.get('descricao', '')
        imagem = data.get('imagem', '')

        if not nome or preco is None:
            return jsonify({'error': 'Nome e preço são obrigatórios'}), 400

        try:
            preco = float(preco)
        except Exception:
            return jsonify({'error': 'Preço inválido'}), 400

        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'UPDATE produtos SET nome = ?, preco = ?, descricao = ?, imagem = ? WHERE id = ?',
            (nome, preco, descricao, imagem, id)
        )
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Produto não encontrado'}), 404

        return jsonify({
            'id': id,
            'nome': nome,
            'preco': preco,
            'descricao': descricao,
            'imagem': imagem
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DELETE - Excluir produto
@app.route('/produtos/<int:id>', methods=['DELETE'])
def excluir_produto(id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('DELETE FROM produtos WHERE id = ?', (id,))
        db.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Produto não encontrado'}), 404
        
        return jsonify({'message': 'Produto excluído com sucesso'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)


@app.route('/produto')
def produto_page():
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    return send_from_directory(static_dir, 'produto.html')
