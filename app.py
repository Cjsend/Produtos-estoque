from flask import Flask, request, jsonify, render_template, send_from_directory
from database import init_app, get_db
import json
import os

app = Flask(__name__)

# Inicializar banco de dados
init_app(app)


# Garante que a tabela `produtos` exista (caso database.init_app não a tenha criado)
def init_produtos_table():
    db = get_db()
    cur = db.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            quantidade INTEGER NOT NULL DEFAULT 0
        )
    ''')
    db.commit()


# inicializa tabela de produtos
with app.app_context():
    init_produtos_table()

@app.route('/')
def index():
    return render_template('index.html')

# GET - Listar todos os produtos
@app.route('/produtos', methods=['GET'])
def listar_produtos():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM produtos ORDER BY id DESC')
        produtos = cursor.fetchall()
        
        # Converter para lista de dicionários
        produtos_list = []
        for produto in produtos:
            produtos_list.append({
                'id': produto['id'],
                'nome': produto['nome'],
                'quantidade': produto['quantidade']
            })
        
        return jsonify(produtos_list)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST - Adicionar novo produto
@app.route('/produtos', methods=['POST'])
def adicionar_produto():
    try:
        data = request.get_json()
        nome = data.get('nome')
        quantidade = data.get('quantidade')
        
        if not nome or quantidade is None:
            return jsonify({'error': 'Nome e quantidade são obrigatórios'}), 400
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'INSERT INTO produtos (nome, quantidade) VALUES (?, ?)',
            (nome, quantidade)
        )
        db.commit()
        
        return jsonify({
            'id': cursor.lastrowid,
            'nome': nome,
            'quantidade': quantidade
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# PUT - Atualizar produto
@app.route('/produtos/<int:id>', methods=['PUT'])
def atualizar_produto(id):
    try:
        data = request.get_json()
        nome = data.get('nome')
        quantidade = data.get('quantidade')
        
        if not nome or quantidade is None:
            return jsonify({'error': 'Nome e quantidade são obrigatórios'}), 400
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'UPDATE produtos SET nome = ?, quantidade = ? WHERE id = ?',
            (nome, quantidade, id)
        )
        db.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Produto não encontrado'}), 404
        
        return jsonify({
            'id': id,
            'nome': nome,
            'quantidade': quantidade
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
