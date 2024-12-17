// Função para obter os dados do horário
function obterDadosHorario() {
    const dados = {
        titulo: document.querySelector('input[placeholder="Digite o título do horário"]').value,
        disciplinas: [],
        horarios: []
    };

    // Obter dados das disciplinas (máximos e valores atuais)
    document.querySelectorAll('.disciplinas-container .d-flex').forEach(container => {
        const card = container.querySelector('.card');
        const contador = container.querySelector('.aula-count');
        const label = container.querySelector('.contador-label');
        
        dados.disciplinas.push({
            nome: card.textContent,
            cor: card.style.backgroundColor,
            maximo: contador.value || '0',
            atual: (parseInt(label.textContent) || 0).toString()
        });
    });

    // Obter posições dos cards na tabela
    document.querySelectorAll('td').forEach((cell, index) => {
        if (cell.dataset.disciplina) {
            dados.horarios.push({
                posicao: index,
                disciplina: cell.dataset.disciplina,
                cor: cell.style.backgroundColor
            });
        }
    });

    return dados;
}

// Função para fazer download do arquivo JSON
function downloadHorario() {
    const dados = obterDadosHorario();
    const dataStr = JSON.stringify(dados, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `horario_${dados.titulo || 'sem_titulo'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Função para carregar os dados do arquivo JSON
async function carregarHorario(arquivo) {
    try {
        const texto = await arquivo.text();
        const dados = JSON.parse(texto);

        // Inserir título
        document.querySelector('input[placeholder="Digite o título do horário"]').value = dados.titulo || '';

        // Limpar todas as células da tabela
        document.querySelectorAll('td').forEach(cell => {
            cell.textContent = '';
            cell.style.backgroundColor = '';
            cell.style.color = '';
            cell.style.cursor = '';
            delete cell.dataset.disciplina;
            cell.setAttribute('draggable', 'false');
        });

        // Configurar valores máximos e atuais das disciplinas
        const containers = document.querySelectorAll('.disciplinas-container .d-flex');
        dados.disciplinas.forEach(disc => {
            const container = Array.from(containers).find(cont => 
                cont.querySelector('.card').textContent === disc.nome
            );
            
            if (container) {
                const contador = container.querySelector('.aula-count');
                const label = container.querySelector('.contador-label');
                contador.value = disc.maximo;
                label.textContent = `${disc.atual}/`;
                
                // Atualizar estado do card
                const event = new Event('change');
                contador.dispatchEvent(event);
            }
        });

        // Inserir cards nas posições da tabela
        const cells = document.querySelectorAll('td');
        dados.horarios.forEach(horario => {
            const cell = cells[horario.posicao];
            if (cell) {
                cell.textContent = horario.disciplina;
                cell.style.backgroundColor = horario.cor;
                cell.style.color = 'white';
                cell.style.cursor = 'grab';
                cell.dataset.disciplina = horario.disciplina;
                cell.setAttribute('draggable', 'true');
            }
        });

        return true;
    } catch (error) {
        console.error('Erro ao carregar arquivo:', error);
        return false;
    }
}

// Função para manipular o input de arquivo
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        carregarHorario(file).then(success => {
            if (success) {
                console.log('Horário carregado com sucesso!');
            } else {
                alert('Erro ao carregar o arquivo. Verifique se é um arquivo JSON válido.');
            }
        });
    }
}

// Adicionar links na navbar
document.addEventListener('DOMContentLoaded', function() {
    // Criar container para os links
    const container = document.createElement('div');
    container.className = 'd-flex align-items-center ms-auto';
    
    // Input de arquivo (oculto)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.onchange = handleFileSelect;
    
    // Link de Download
    const downloadLink = document.createElement('a');
    downloadLink.href = '#';
    downloadLink.className = 'nav-link d-flex align-items-center me-3';
    downloadLink.innerHTML = '<span class="material-symbols-outlined me-1">download</span> Salvar';
    downloadLink.onclick = function(e) {
        e.preventDefault();
        downloadHorario();
    };
    
    // Link de Upload
    const uploadLink = document.createElement('a');
    uploadLink.href = '#';
    uploadLink.className = 'nav-link d-flex align-items-center';
    uploadLink.innerHTML = '<span class="material-symbols-outlined me-1">upload</span> Carregar';
    uploadLink.onclick = function(e) {
        e.preventDefault();
        fileInput.click();
    };
    
    // Adicionar elementos ao container
    container.appendChild(downloadLink);
    container.appendChild(uploadLink);
    container.appendChild(fileInput);
    
    // Inserir na navbar
    const navbar = document.querySelector('.navbar-brand').parentNode;
    navbar.appendChild(container);
});
