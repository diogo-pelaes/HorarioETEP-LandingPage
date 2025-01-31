import requests
from bs4 import BeautifulSoup


class Aula:
    def __init__(self, horario):
        self.horario = horario  
        self.seg = ''
        self.ter = ''
        self.qua = ''
        self.qui = ''
        self.sex = ''
    
    def set_turma(self, dia_numero, turma):
        if dia_numero == 0:
            self.seg = turma
        elif dia_numero == 1:
            self.ter = turma
        elif dia_numero == 2:
            self.qua = turma
        elif dia_numero == 3:
            self.qui = turma
        elif dia_numero == 4:
            self.sex = turma


class Professor:
    def __init__(self, codigo, name, disciplina):

        self.name = name
        self.codigo = codigo
        self.disciplinas = disciplina
        self.aulas = []

    def set_aula(self, aula):
        self.aulas.append(aula)


def collect_data():
    # Caminho do arquivo HTML local
    file_path = 'HorarioETEP.html'

    # Ler o conteúdo do arquivo HTML
    with open(file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()

    # Analisar o HTML com BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')

    # Encontrar todos os elementos <option> e extrair seus valores
    options = soup.find_all('option')
    professores = []

    for option in options:
        if option['value'] != '':
            [nome, disciplina] = option.text.split(' - ')
            codigo = option['value']
            professor =Professor(codigo, nome, disciplina)

            # percorrer a div com id = profHorario-codigo
            div = soup.find('div', id=f'profHorario-{codigo}')
            if div:
                # percorrer as linhas da tabela
                for tr in div.find_all('tr'):
                    aula = None
                    # percorrer as colunas da linha
                    for th in tr.find_all('th'):

                        # Se tem scope="col" continue
                        if th.get('scope') == 'col':
                            continue
                        # Se tem scope="row" continue
                        if th.get('scope') == 'row':
                            horario = th.text.strip().replace('-', ' às ')
                            aula = Aula(horario)
                            break
                    if aula:
                        for k, td in enumerate(tr.find_all('td')):
                            turma = td.text.replace('\n', '').strip()
                            aula.set_turma(k, turma)
                        professor.set_aula(aula)
                professores.append(professor)
    return professores
