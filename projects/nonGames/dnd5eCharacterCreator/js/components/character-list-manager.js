// Character List Manager Component
export class CharacterListManager {
    constructor(app) {
        this.app = app;
    }
    
    refreshCharacterList() {
        const container = document.getElementById('character-list');
        const characters = this.app.storage.getSummaries();
        
        if (characters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No characters yet. Create your first character to get started!</p>
                </div>
            `;
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Create character cards
        characters.forEach(character => {
            const card = this.createCharacterCard(character);
            container.appendChild(card);
        });
    }
    
    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className = 'character-card';
        
        // Format dates
        const createdDate = new Date(character.created).toLocaleDateString();
        const modifiedDate = new Date(character.modified).toLocaleDateString();
        
        // Build race display
        const raceDisplay = character.subrace ? 
            `${character.subrace} ${character.race}` : 
            character.race;
        
        card.innerHTML = `
            <div class="character-actions-mini">
                <button class="action-btn" data-action="view" data-id="${character.id}" title="View">👁️</button>
                <button class="action-btn" data-action="export" data-id="${character.id}" title="Export">📥</button>
                <button class="action-btn" data-action="delete" data-id="${character.id}" title="Delete">🗑️</button>
            </div>
            <h3>${character.name}</h3>
            <div class="character-info">
                Level ${character.level} ${this.capitalize(raceDisplay)} ${this.capitalize(character.class)}
            </div>
            <div class="character-meta">
                Created: ${createdDate} | Modified: ${modifiedDate}
            </div>
        `;
        
        // Add click handler for main card
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on action buttons
            if (!e.target.closest('.character-actions-mini')) {
                const fullCharacter = this.app.storage.get(character.id);
                this.app.viewCharacter(fullCharacter);
            }
        });
        
        // Add handlers for action buttons
        card.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                
                switch (action) {
                    case 'view':
                        const viewChar = this.app.storage.get(id);
                        this.app.viewCharacter(viewChar);
                        break;
                    case 'export':
                        this.exportCharacter(id);
                        break;
                    case 'delete':
                        this.app.deleteCharacter(id);
                        break;
                }
            });
        });
        
        return card;
    }
    
    exportCharacter(id) {
        const character = this.app.storage.get(id);
        if (!character) return;
        
        const jsonString = JSON.stringify(character, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${character.metadata.name.replace(/\s+/g, '-').toLowerCase()}-character.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    capitalize(str) {
        if (!str) return '';
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
