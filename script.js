document.addEventListener('DOMContentLoaded', function() {
    // Dados de exemplo
    let campaigns = JSON.parse(localStorage.getItem('campaigns')) || [];
    let characters = JSON.parse(localStorage.getItem('characters')) || [];
    let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
    let settings = JSON.parse(localStorage.getItem('settings')) || { theme: 'light' };

    // Elementos do DOM
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    const activeCampaignsEl = document.getElementById('active-campaigns');
    const nextSessionEl = document.getElementById('next-session');
    const totalCharactersEl = document.getElementById('total-characters');
    const campaignsListEl = document.getElementById('campaigns-list');
    const newCampaignBtn = document.getElementById('new-campaign-btn');
    const campaignModal = document.getElementById('campaign-modal');
    const campaignForm = document.getElementById('campaign-form');
    const charactersListEl = document.getElementById('characters-list');
    const newCharacterBtn = document.getElementById('new-character-btn');
    const characterModal = document.getElementById('character-modal');
    const characterForm = document.getElementById('character-form');
    const sessionsListEl = document.getElementById('sessions-list');
    const newSessionBtn = document.getElementById('new-session-btn');
    const sessionModal = document.getElementById('session-modal');
    const sessionForm = document.getElementById('session-form');
    const sessionCampaignSelect = document.getElementById('session-campaign');
    const settingsForm = document.getElementById('settings-form');
    const themeSelect = document.getElementById('theme');

    // Inicialização
    applyTheme(settings.theme);
    updateDashboard();
    renderCampaigns();
    renderCharacters();
    renderSessions();
    themeSelect.value = settings.theme;

    // Navegação
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Atualiza a seção ativa
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            
            // Atualiza o link ativo
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Modal de Campanha
    newCampaignBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Nova Campanha';
        document.getElementById('campaign-id').value = '';
        campaignForm.reset();
        campaignModal.style.display = 'block';
    });

    // Modal de Personagem
    newCharacterBtn.addEventListener('click', () => {
        document.getElementById('character-modal-title').textContent = 'Novo Personagem';
        document.getElementById('character-id').value = '';
        characterForm.reset();
        characterModal.style.display = 'block';
    });

    // Modal de Sessão
    newSessionBtn.addEventListener('click', () => {
        document.getElementById('session-modal-title').textContent = 'Nova Sessão';
        document.getElementById('session-id').value = '';
        sessionForm.reset();
        
        // Preencher dropdown de campanhas
        sessionCampaignSelect.innerHTML = '<option value="">Selecione uma campanha</option>';
        campaigns.forEach(campaign => {
            const option = document.createElement('option');
            option.value = campaign.id;
            option.textContent = campaign.name;
            sessionCampaignSelect.appendChild(option);
        });
        
        // Definir data padrão para próximo sábado às 14:00
        const nextSaturday = getNextDayOfWeek(6); // 6 = Sábado
        nextSaturday.setHours(14, 0, 0, 0);
        document.getElementById('session-date').valueAsNumber = nextSaturday.getTime() - (nextSaturday.getTimezoneOffset() * 60000);
        
        sessionModal.style.display = 'block';
    });

    // Fechar modais ao clicar no X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Formulário de Campanha
    campaignForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const campaignId = document.getElementById('campaign-id').value;
        const campaignData = {
            name: document.getElementById('campaign-name').value,
            system: document.getElementById('campaign-system').value,
            description: document.getElementById('campaign-desc').value,
            createdAt: new Date().toISOString()
        };
        
        if (campaignId) {
            // Editar campanha existente
            const index = campaigns.findIndex(c => c.id === campaignId);
            if (index !== -1) {
                campaigns[index] = { ...campaigns[index], ...campaignData };
            }
        } else {
            // Nova campanha
            campaignData.id = Date.now().toString();
            campaigns.push(campaignData);
        }
        
        saveData();
        renderCampaigns();
        updateDashboard();
        campaignModal.style.display = 'none';
    });

    // Formulário de Personagem
    characterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const characterId = document.getElementById('character-id').value;
        const characterData = {
            name: document.getElementById('character-name').value,
            player: document.getElementById('character-player').value,
            class: document.getElementById('character-class').value,
            level: parseInt(document.getElementById('character-level').value),
            race: document.getElementById('character-race').value,
            background: document.getElementById('character-background').value,
            createdAt: new Date().toISOString()
        };
        
        if (characterId) {
            // Editar personagem existente
            const index = characters.findIndex(c => c.id === characterId);
            if (index !== -1) {
                characters[index] = { ...characters[index], ...characterData };
            }
        } else {
            // Novo personagem
            characterData.id = Date.now().toString();
            characters.push(characterData);
        }
        
        saveData();
        renderCharacters();
        updateDashboard();
        characterModal.style.display = 'none';
    });

    // Formulário de Sessão
    sessionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const sessionId = document.getElementById('session-id').value;
        const sessionData = {
            title: document.getElementById('session-title').value,
            campaignId: document.getElementById('session-campaign').value,
            date: document.getElementById('session-date').value,
            location: document.getElementById('session-location').value,
            notes: document.getElementById('session-notes').value,
            createdAt: new Date().toISOString()
        };
        
        if (sessionId) {
            // Editar sessão existente
            const index = sessions.findIndex(s => s.id === sessionId);
            if (index !== -1) {
                sessions[index] = { ...sessions[index], ...sessionData };
            }
        } else {
            // Nova sessão
            sessionData.id = Date.now().toString();
            sessions.push(sessionData);
        }
        
        saveData();
        renderSessions();
        updateDashboard();
        sessionModal.style.display = 'none';
    });

    // Configurações
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        settings.theme = themeSelect.value;
        saveData();
        applyTheme(settings.theme);
        alert('Configurações salvas!');
    });

    // Funções auxiliares
    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }

    function getNextDayOfWeek(dayOfWeek) {
        const today = new Date();
        const result = new Date(today);
        result.setDate(today.getDate() + ((7 + dayOfWeek - today.getDay()) % 7));
        return result;
    }

    function updateDashboard() {
        activeCampaignsEl.textContent = campaigns.length;
        totalCharactersEl.textContent = characters.length;
        
        if (sessions.length > 0) {
            const nextSession = sessions
                .filter(s => new Date(s.date) > new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
            
            if (nextSession) {
                const date = new Date(nextSession.date).toLocaleDateString();
                const time = new Date(nextSession.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                nextSessionEl.textContent = `${nextSession.title} - ${date} às ${time}`;
            } else {
                nextSessionEl.textContent = 'Nenhuma agendada';
            }
        } else {
            nextSessionEl.textContent = 'Nenhuma agendada';
        }
    }

    function renderCampaigns() {
        campaignsListEl.innerHTML = '';
        
        if (campaigns.length === 0) {
            campaignsListEl.innerHTML = '<p>Nenhuma campanha encontrada. Crie uma nova campanha para começar!</p>';
            return;
        }
        
        campaigns.forEach(campaign => {
            const campaignEl = document.createElement('div');
            campaignEl.className = 'card';
            campaignEl.innerHTML = `
                <h3>${campaign.name}</h3>
                <p><strong>Sistema:</strong> ${campaign.system}</p>
                <p>${campaign.description || 'Sem descrição'}</p>
                <div class="actions">
                    <button onclick="editCampaign('${campaign.id}')" class="btn-primary">Editar</button>
                    <button onclick="deleteCampaign('${campaign.id}')" class="btn-danger">Excluir</button>
                </div>
            `;
            campaignsListEl.appendChild(campaignEl);
        });
    }

    function renderCharacters() {
        charactersListEl.innerHTML = '';
        
        if (characters.length === 0) {
            charactersListEl.innerHTML = '<p>Nenhum personagem criado ainda.</p>';
            return;
        }
        
        characters.forEach(character => {
            const characterEl = document.createElement('div');
            characterEl.className = 'card';
            characterEl.innerHTML = `
                <h3>${character.name}</h3>
                <p><strong>Jogador:</strong> ${character.player}</p>
                <p><strong>Nível ${character.level} ${character.race} ${character.class}</strong></p>
                <p>${character.background || 'Sem história definida'}</p>
                <div class="actions">
                    <button onclick="editCharacter('${character.id}')" class="btn-primary">Editar</button>
                    <button onclick="deleteCharacter('${character.id}')" class="btn-danger">Excluir</button>
                </div>
            `;
            charactersListEl.appendChild(characterEl);
        });
    }

    function renderSessions() {
        sessionsListEl.innerHTML = '';
        
        if (sessions.length === 0) {
            sessionsListEl.innerHTML = '<p>Nenhuma sessão agendada.</p>';
            return;
        }
        
        // Ordenar sessões: futuras primeiro, depois passadas
        const now = new Date();
        const upcomingSessions = sessions.filter(s => new Date(s.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        const pastSessions = sessions.filter(s => new Date(s.date) < now)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (upcomingSessions.length > 0) {
            const upcomingHeader = document.createElement('h3');
            upcomingHeader.textContent = 'Próximas Sessões';
            sessionsListEl.appendChild(upcomingHeader);
            
            upcomingSessions.forEach(session => {
                sessionsListEl.appendChild(createSessionCard(session, true));
            });
        }
        
        if (pastSessions.length > 0) {
            const pastHeader = document.createElement('h3');
            pastHeader.textContent = 'Sessões Anteriores';
            sessionsListEl.appendChild(pastHeader);
            
            pastSessions.forEach(session => {
                sessionsListEl.appendChild(createSessionCard(session, false));
            });
        }
    }

    function createSessionCard(session, isUpcoming) {
        const sessionDate = new Date(session.date);
        const sessionEl = document.createElement('div');
        sessionEl.className = `card session-card ${isUpcoming ? 'upcoming-session' : ''}`;
        
        sessionEl.innerHTML = `
            <h3>${session.title}</h3>
            <div class="session-meta">
                <span><strong>Campanha:</strong> ${getCampaignName(session.campaignId)}</span>
                <span>${sessionDate.toLocaleDateString()} às ${sessionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            ${session.location ? `<p><strong>Local:</strong> ${session.location}</p>` : ''}
            ${session.notes ? `<p>${session.notes}</p>` : ''}
            <div class="actions">
                <button onclick="editSession('${session.id}')" class="btn-primary">Editar</button>
                <button onclick="deleteSession('${session.id}')" class="btn-danger">Excluir</button>
            </div>
        `;
        
        return sessionEl;
    }

    function getCampaignName(id) {
        const campaign = campaigns.find(c => c.id === id);
        return campaign ? campaign.name : 'Campanha não encontrada';
    }

    function saveData() {
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
        localStorage.setItem('characters', JSON.stringify(characters));
        localStorage.setItem('sessions', JSON.stringify(sessions));
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    // Funções globais para os botões
    window.editCampaign = function(id) {
        const campaign = campaigns.find(c => c.id === id);
        if (campaign) {
            document.getElementById('modal-title').textContent = 'Editar Campanha';
            document.getElementById('campaign-id').value = campaign.id;
            document.getElementById('campaign-name').value = campaign.name;
            document.getElementById('campaign-system').value = campaign.system;
            document.getElementById('campaign-desc').value = campaign.description || '';
            campaignModal.style.display = 'block';
        }
    };

    window.deleteCampaign = function(id) {
        if (confirm('Tem certeza que deseja excluir esta campanha?')) {
            campaigns = campaigns.filter(c => c.id !== id);
            // Também remove sessões e personagens relacionados
            sessions = sessions.filter(s => s.campaignId !== id);
            characters = characters.filter(c => c.campaignId !== id);
            saveData();
            renderCampaigns();
            renderSessions();
            renderCharacters();
            updateDashboard();
        }
    };

    window.editCharacter = function(id) {
        const character = characters.find(c => c.id === id);
        if (character) {
            document.getElementById('character-modal-title').textContent = 'Editar Personagem';
            document.getElementById('character-id').value = character.id;
            document.getElementById('character-name').value = character.name;
            document.getElementById('character-player').value = character.player;
            document.getElementById('character-class').value = character.class;
            document.getElementById('character-level').value = character.level;
            document.getElementById('character-race').value = character.race || '';
            document.getElementById('character-background').value = character.background || '';
            characterModal.style.display = 'block';
        }
    };

    window.deleteCharacter = function(id) {
        if (confirm('Tem certeza que deseja excluir este personagem?')) {
            characters = characters.filter(c => c.id !== id);
            saveData();
            renderCharacters();
            updateDashboard();
        }
    };

    window.editSession = function(id) {
        const session = sessions.find(s => s.id === id);
        if (session) {
            document.getElementById('session-modal-title').textContent = 'Editar Sessão';
            document.getElementById('session-id').value = session.id;
            document.getElementById('session-title').value = session.title;
            
            // Preencher dropdown de campanhas
            sessionCampaignSelect.innerHTML = '<option value="">Selecione uma campanha</option>';
            campaigns.forEach(campaign => {
                const option = document.createElement('option');
                option.value = campaign.id;
                option.textContent = campaign.name;
                option.selected = campaign.id === session.campaignId;
                sessionCampaignSelect.appendChild(option);
            });
            
            document.getElementById('session-date').value = session.date;
            document.getElementById('session-location').value = session.location || '';
            document.getElementById('session-notes').value = session.notes || '';
            sessionModal.style.display = 'block';
        }
    };

    window.deleteSession = function(id) {
        if (confirm('Tem certeza que deseja excluir esta sessão?')) {
            sessions = sessions.filter(s => s.id !== id);
            saveData();
            renderSessions();
            updateDashboard();
        }
    };
});