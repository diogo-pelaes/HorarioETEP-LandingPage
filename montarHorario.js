document.addEventListener('DOMContentLoaded', function() {
    // Configurar os contadores
    const contadores = document.querySelectorAll('.aula-count');
    contadores.forEach((contador, index) => {
        // Configurar navegação por Enter
        contador.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (index < contadores.length - 1) {
                    contadores[index + 1].focus();
                } else {
                    contadores[0].focus();
                }
            }
        });
        
        // Configurar evento de mudança
        contador.addEventListener('change', function() {
            atualizarEstadoCard(contador);
        });

        // Desabilitar cards sem valor máximo inicialmente
        atualizarEstadoCard(contador);
    });

    // Tornar os cards arrastáveis
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.setAttribute('draggable', 'true');
        
        card.addEventListener('dragstart', function(e) {
            // Prevenir arrasto se o card estiver desabilitado
            if (card.style.opacity === '0.5') {
                e.preventDefault();
                return;
            }
            
            // Criar uma imagem transparente para o drag
            const dragImage = document.createElement('div');
            dragImage.style.opacity = '0';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            
            e.dataTransfer.setData('text/plain', card.textContent);
            e.dataTransfer.setData('background-color', card.style.backgroundColor);
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', function(e) {
            card.classList.remove('dragging');
            // Remover elementos temporários
            const dragImage = document.querySelector('.drag-image');
            if (dragImage) dragImage.remove();
        });
    });

    // Configurar a área de disciplinas para receber drop
    const disciplinasContainer = document.querySelector('.disciplinas-container');
    disciplinasContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        disciplinasContainer.classList.add('drag-over');
    });

    disciplinasContainer.addEventListener('dragleave', function() {
        disciplinasContainer.classList.remove('drag-over');
    });

    disciplinasContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        disciplinasContainer.classList.remove('drag-over');

        // Obter os dados do card arrastado
        const disciplina = e.dataTransfer.getData('text/plain');
        
        // Decrementar o contador apenas se veio de uma célula da tabela
        const sourceElement = document.querySelector('.dragging');
        if (sourceElement && sourceElement.tagName === 'TD') {
            decrementarContador(disciplina);
            
            // Limpar a célula de origem
            sourceElement.textContent = '';
            sourceElement.style.backgroundColor = '';
            sourceElement.style.color = '';
            sourceElement.style.cursor = '';
            delete sourceElement.dataset.disciplina;
            sourceElement.setAttribute('draggable', 'false');
        }

        // Verificar todas as linhas após a remoção
        verificarTodasLinhas();
    });

    // Configurar TODAS as células da tabela para receber o drop
    const tableCells = document.querySelectorAll('td');
    tableCells.forEach(cell => {
        cell.addEventListener('dragover', function(e) {
            e.preventDefault();
            if (!cell.classList.contains('no-drop')) {
                cell.classList.add('drag-over');
            }
        });

        cell.addEventListener('dragleave', function() {
            cell.classList.remove('drag-over');
        });

        cell.addEventListener('drop', function(e) {
            e.preventDefault();
            if (cell.classList.contains('no-drop')) return;
            
            cell.classList.remove('drag-over');

            // Se já existe uma disciplina, decrementar seu contador
            if (cell.dataset.disciplina) {
                decrementarContador(cell.dataset.disciplina);
            }

            // Obter os dados do card arrastado
            const disciplina = e.dataTransfer.getData('text/plain');
            const backgroundColor = e.dataTransfer.getData('background-color');

            // Se o arrasto veio de outra célula, limpar a célula de origem
            const sourceElement = document.querySelector('.dragging');
            if (sourceElement && sourceElement.tagName === 'TD') {
                sourceElement.textContent = '';
                sourceElement.style.backgroundColor = '';
                sourceElement.style.color = '';
                sourceElement.style.cursor = '';
                sourceElement.style.border = ''; // Remover borda de alerta
                delete sourceElement.dataset.disciplina;
                sourceElement.setAttribute('draggable', 'false');

                // Verificar duplicatas na linha de origem
                verificarDuplicatasLinha(sourceElement);
            } else {
                // Se veio da lista de disciplinas, incrementar o contador
                incrementarContador(disciplina);
            }

            // Atualizar a célula de destino
            cell.textContent = disciplina;
            cell.style.backgroundColor = backgroundColor;
            cell.style.color = 'white';
            cell.style.cursor = 'grab';
            cell.dataset.disciplina = disciplina;
            cell.setAttribute('draggable', 'true');

            // Verificar duplicatas na linha de destino
            if (verificarDuplicatasLinha(cell)) {
                // Opcional: Mostrar alerta
                const rowHeader = cell.parentElement.querySelector('th').textContent;
                const msg = `Atenção: ${disciplina} aparece mais de uma vez no horário ${rowHeader}`;
                
                const toast = document.createElement('div');
                toast.className = 'toast align-items-center text-white bg-danger border-0';
                toast.setAttribute('role', 'alert');
                toast.setAttribute('aria-live', 'assertive');
                toast.setAttribute('aria-atomic', 'true');
                toast.innerHTML = `
                    <div class="d-flex">
                        <div class="toast-body">
                            ${msg}
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                `;
                
                // Adicionar toast ao container
                let toastContainer = document.querySelector('.toast-container');
                if (!toastContainer) {
                    toastContainer = document.createElement('div');
                    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
                    document.body.appendChild(toastContainer);
                }
                toastContainer.appendChild(toast);
                
                // Inicializar e mostrar o toast
                const bsToast = new bootstrap.Toast(toast);
                bsToast.show();
                
                // Remover toast após ser fechado
                toast.addEventListener('hidden.bs.toast', function() {
                    toast.remove();
                });
            }

            // Verificar todas as linhas após a modificação
            verificarTodasLinhas();
        });

        cell.addEventListener('dragstart', function(e) {
            if (!cell.dataset.disciplina) return;
            
            // Criar uma imagem transparente para o drag
            const dragImage = document.createElement('div');
            dragImage.style.opacity = '0';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            
            e.dataTransfer.setData('text/plain', cell.dataset.disciplina);
            e.dataTransfer.setData('background-color', cell.style.backgroundColor);
            cell.classList.add('dragging');
        });

        cell.addEventListener('dragend', function() {
            cell.classList.remove('dragging');
        });

        cell.addEventListener('dblclick', function() {
            if (cell.dataset.disciplina) {
                decrementarContador(cell.dataset.disciplina);
                
                cell.textContent = '';
                cell.style.backgroundColor = '';
                cell.style.color = '';
                cell.style.cursor = '';
                delete cell.dataset.disciplina;
                cell.setAttribute('draggable', 'false');

                // Verificar todas as linhas após a remoção
                verificarTodasLinhas();
            }
        });
    });

    function incrementarContador(disciplina) {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (card.textContent === disciplina) {
                const container = card.closest('.d-flex');
                const contador = container.querySelector('.aula-count');
                const label = container.querySelector('.contador-label');
                const atual = parseInt(label.textContent) || 0;
                const maximo = parseInt(contador.value) || 0;
                
                if (maximo === 0 || atual < maximo) {
                    label.textContent = `${atual + 1}/`;
                    atualizarEstadoCard(contador);
                }
            }
        });
    }

    function decrementarContador(disciplina) {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (card.textContent === disciplina) {
                const container = card.closest('.d-flex');
                const label = container.querySelector('.contador-label');
                const atual = parseInt(label.textContent) || 0;
                
                if (atual > 0) {
                    label.textContent = `${(atual - 1)}/`;
                    atualizarEstadoCard(container.querySelector('.aula-count'));
                }
            }
        });
    }

    function atualizarEstadoCard(contador) {
        const container = contador.closest('.d-flex');
        const card = container.querySelector('.card');
        const label = container.querySelector('.contador-label');
        const atual = parseInt(label.textContent) || 0;
        const maximo = parseInt(contador.value) || 0;

        if (maximo === 0 || (maximo > 0 && atual >= maximo)) {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
            card.setAttribute('draggable', 'false');
            card.style.cursor = 'not-allowed';
        } else {
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            card.setAttribute('draggable', 'true');
            card.style.cursor = 'grab';
        }
    }

    // Atualizar o CSS
    const style = document.createElement('style');
    style.textContent = `
        .dragging {
            opacity: 0.5 !important;
            transform: scale(0.95);
        }
        .drag-over {
            background-color: rgba(253, 126, 20, 0.1) !important;
            outline: 2px dashed #fd7e14 !important;
            outline-offset: -2px;
        }
    `;
    document.head.appendChild(style);

    // Configurar os checkboxes de disciplinas
    const checkboxes = document.querySelectorAll('.disciplina-check');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const disciplina = this.value;
            
            // Desmarcar outros checkboxes
            checkboxes.forEach(cb => {
                if (cb !== this) cb.checked = false;
            });

            // Atualizar visualização
            atualizarVisualizacaoDisciplina(disciplina, this.checked);
        });
    });

    function atualizarVisualizacaoDisciplina(disciplina, checked) {
        // Escurecer/restaurar outros cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (card.textContent === disciplina) {
                // Destacar o card selecionado
                card.style.opacity = '1';
            } else {
                if (checked) {
                    card.style.opacity = '0.3';
                } else {
                    // Verificar se o card deve estar ativo ou inativo
                    const container = card.closest('.d-flex');
                    const contador = container.querySelector('.aula-count');
                    const label = container.querySelector('.contador-label');
                    const atual = parseInt(label.textContent) || 0;
                    const maximo = parseInt(contador.value) || 0;
                    
                    if (maximo === 0 || (maximo > 0 && atual >= maximo)) {
                        card.style.opacity = '0.5';
                    } else {
                        card.style.opacity = '1';
                    }
                }
            }
        });

        // Escurecer/restaurar células da tabela
        const cells = document.querySelectorAll('td');
        cells.forEach(cell => {
            if (cell.textContent === disciplina) {
                // Destacar células da disciplina selecionada
                cell.style.opacity = '1';
            } else if (cell.textContent) {
                cell.style.opacity = checked ? '0.3' : '1';
            }
        });

        // Atualizar contadores de coluna
        if (checked) {
            mostrarContadoresColunas(disciplina);
        } else {
            removerContadoresColunas();
        }
    }

    function mostrarContadoresColunas(disciplina) {
        // Remover contadores existentes
        removerContadoresColunas();

        // Contar ocorrências por coluna
        const table = document.querySelector('table');
        const numColunas = 7; // número de colunas (turmas)
        const contadores = new Array(numColunas).fill(0);

        // Percorrer células e contar ocorrências
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (cell.textContent === disciplina) {
                    contadores[index]++;
                }
            });
        });

        // Criar linha de contadores
        const lastRow = document.createElement('tr');
        lastRow.classList.add('contadores-row');
        
        // Célula vazia para a coluna de horários
        const th = document.createElement('th');
        th.textContent = 'Total';
        th.style.color = '#fd7e14';
        lastRow.appendChild(th);
        
        // Adicionar contadores
        contadores.forEach(count => {
            const td = document.createElement('td');
            td.textContent = count > 0 ? count : '';
            td.style.fontWeight = 'bold';
            td.style.color = '#fd7e14';
            lastRow.appendChild(td);
        });

        // Adicionar linha ao final da tabela
        table.querySelector('tbody').appendChild(lastRow);
    }

    function removerContadoresColunas() {
        document.querySelectorAll('.contadores-row').forEach(row => row.remove());
    }

    function verificarDuplicatasLinha(cell) {
        // Obter a linha atual
        const row = cell.parentElement;
        const disciplina = cell.textContent;
        
        // Se a célula estiver vazia, não precisa verificar
        if (!disciplina) {
            return false;
        }

        let duplicataEncontrada = false;

        // Primeiro, limpar qualquer marcação anterior na linha
        row.classList.remove('linha-duplicada');

        // Verificar todas as células da linha
        const cells = row.querySelectorAll('td');
        let ocorrencias = 0;
        cells.forEach(c => {
            // Só contar se a célula tiver conteúdo e for igual à disciplina que estamos verificando
            if (c.textContent && c.textContent === disciplina) {
                ocorrencias++;
                if (ocorrencias > 1) {
                    // Destacar a linha inteira
                    row.classList.add('linha-duplicada');
                    duplicataEncontrada = true;
                }
            }
        });

        return duplicataEncontrada;
    }

    // Adicionar esta nova função
    function verificarTodasLinhas() {
        const table = document.querySelector('table');
        const rows = table.querySelectorAll('tr');
        
        // Limpar todas as marcações primeiro
        rows.forEach(row => {
            row.classList.remove('linha-duplicada');
        });

        // Verificar cada linha
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return; // Pular linhas sem células

            // Criar um mapa de contagem de disciplinas
            const disciplinas = new Map();
            cells.forEach(cell => {
                if (cell.textContent) {
                    const disc = cell.textContent;
                    disciplinas.set(disc, (disciplinas.get(disc) || 0) + 1);
                }
            });

            // Verificar duplicatas
            disciplinas.forEach((count, disc) => {
                if (count > 1) {
                    row.classList.add('linha-duplicada');
                }
            });
        });
    }
});
