import os
from jinja2 import Environment, FileSystemLoader
from collect_data import collect_data
from PyPDF2 import PdfMerger


def compilar_latex(file_name):
    os.system(f'xelatex -output-directory=latex latex/{file_name}.tex')


def apagar_arquivos():

    for file in os.listdir('latex'):
        if file != 'template.tex':
            os.remove(f'latex/{file}')


def junta_pdfs():
    merger = PdfMerger()
    
    # Adicionar todos os arquivos PDF no diretório 'latex'
    for file in os.listdir('latex'):
        if file.endswith('.pdf'):
            merger.append(f'latex/{file}')
    
    # Salvar o PDF combinado
    merger.write('Horarios.pdf')
    merger.close()


def render_latex():

    # Coletar dados dos professores

    professores = collect_data()

    # Configurar o ambiente do Jinja2
    env = Environment(loader=FileSystemLoader(os.path.dirname(__file__)))
    template = env.get_template('latex/template.tex')

    # Renderizar o template com os dados dos professores
    for professor in professores:
        output = template.render(professor=professor)
        # Salvar o resultado em um arquivo .tex
        with open(f'latex/{professor.codigo}.tex', 'w', encoding='utf-8') as f:
            f.write(output)
        compilar_latex(professor.codigo)
    
    junta_pdfs()
    apagar_arquivos()


if __name__ == "__main__":
    render_latex()
