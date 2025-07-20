// D&D 5e Character Creator - Main Application
import { CharacterBuilder } from './components/character-builder.js';
import { CharacterStorage } from './data/character-storage.js';
import { DataManager } from './data/data-manager.js';
import { CharacterListManager } from './components/character-list-manager.js';
import { WizardManager } from './components/wizard-manager.js';
import { CharacterExporter } from './export/character-exporter.js';
import { CharacterSheetRenderer } from './export/sheet-renderer.js';

class DnDCharacterCreatorApp {
    constructor() {
        this.views = {
            list: document.getElementById('character-list-view'),
            builder: document.getElementById('character-builder-view'),
            sheet: document.getElementById('character-sheet-view')
        };
        
        this.currentView = 'list';
        this.currentCharacter = null;
        this.isEditing = false;
        
        // Initialize managers
        this.dataManager = new DataManager();
        this.storage = new CharacterStorage();
        this.listManager = new CharacterListManager(this);
        this.wizardManager = new WizardManager(this);
        this.characterBuilder = new CharacterBuilder(this);
        this.sheetRenderer = new CharacterSheetRenderer();
        this.exporter = new CharacterExporter();
        
        this.init();
    }
    
    async init() {
        // Load initial data
        await this.dataManager.preloadCoreData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load and display character list
        this.listManager.refreshCharacterList();
        
        // Show initial view
        this.showView('list');
    }
    
    setupEventListeners() {
        // Character list view buttons
        document.getElementById('new-character-btn').addEventListener('click', () => {
            this.createNewCharacter();
        });
        
        document.getElementById('import-character-btn').addEventListener('click', () => {
            this.importCharacter();
        });
        
        // Character builder view buttons
        document.getElementById('back-to-list').addEventListener('click', () => {
            this.confirmAndReturnToList();
        });
        
        document.getElementById('save-character').addEventListener('click', () => {
            this.saveCurrentCharacter();
        });
        
        document.getElementById('export-character').addEventListener('click', () => {
            this.exportCurrentCharacter();
        });
        
        // Character sheet view buttons
        document.getElementById('back-from-sheet').addEventListener('click', () => {
            this.showView('list');
        });
        
        document.getElementById('edit-character').addEventListener('click', () => {
            this.editCharacter(this.currentCharacter);
        });
        
        document.getElementById('print-sheet').addEventListener('click', () => {
            window.print();
        });
        
        document.getElementById('export-sheet-pdf').addEventListener('click', () => {
            this.exportCharacterPDF();
        });
        
        // Import file input
        document.getElementById('import-file-input').addEventListener('change', (e) => {
            this.handleImportFile(e);
        });
        
        // Wizard navigation
        document.getElementById('wizard-prev').addEventListener('click', () => {
            this.wizardManager.previousStep();
        });
        
        document.getElementById('wizard-next').addEventListener('click', () => {
            this.wizardManager.nextStep();
        });
        
        // Wizard step clicks
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNumber = parseInt(e.currentTarget.dataset.step);
                this.wizardManager.goToStep(stepNumber);
            });
        });
    }
    
    showView(viewName) {
        // Hide all views
        Object.values(this.views).forEach(view => {
            view.classList.remove('active');
        });
        
        // Show selected view
        if (this.views[viewName]) {
            this.views[viewName].classList.add('active');
            this.currentView = viewName;
        }
        
        // Update content based on view
        if (viewName === 'list') {
            this.listManager.refreshCharacterList();
        } else if (viewName === 'sheet' && this.currentCharacter) {
            this.renderCharacterSheet();
        }
    }
    
    createNewCharacter() {
        this.currentCharacter = this.characterBuilder.createNewCharacter();
        this.isEditing = false;
        this.wizardManager.reset();
        this.showView('builder');
        this.characterBuilder.loadCharacterIntoForm(this.currentCharacter);
    }
    
    editCharacter(character) {
        this.currentCharacter = character;
        this.isEditing = true;
        this.wizardManager.reset();
        this.showView('builder');
        this.characterBuilder.loadCharacterIntoForm(character);
    }
    
    viewCharacter(character) {
        this.currentCharacter = character;
        this.showView('sheet');
    }
    
    deleteCharacter(characterId) {
        if (confirm('Are you sure you want to delete this character?')) {
            this.storage.delete(characterId);
            this.listManager.refreshCharacterList();
        }
    }
    
    saveCurrentCharacter() {
        const character = this.characterBuilder.getCharacterFromForm();
        if (!character) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Update existing character or save new one
        if (this.isEditing) {
            character.id = this.currentCharacter.id;
            character.metadata.created = this.currentCharacter.metadata.created;
        }
        
        character.metadata.modified = new Date().toISOString();
        
        this.storage.save(character);
        this.currentCharacter = character;
        
        alert('Character saved successfully!');
        this.showView('list');
    }
    
    confirmAndReturnToList() {
        if (confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
            this.showView('list');
        }
    }
    
    exportCurrentCharacter() {
        if (!this.currentCharacter) return;
        this.exporter.exportToJSON(this.currentCharacter);
    }
    
    importCharacter() {
        document.getElementById('import-file-input').click();
    }
    
    async handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const character = JSON.parse(text);
            
            // Validate character structure
            if (!character.id || !character.metadata || !character.basic) {
                throw new Error('Invalid character file format');
            }
            
            // Generate new ID to avoid conflicts
            character.id = this.generateId();
            character.metadata.imported = new Date().toISOString();
            
            // Save imported character
            this.storage.save(character);
            this.listManager.refreshCharacterList();
            
            alert('Character imported successfully!');
        } catch (error) {
            alert('Failed to import character: ' + error.message);
        }
        
        // Reset file input
        event.target.value = '';
    }
    
    renderCharacterSheet() {
        const container = document.getElementById('character-sheet-content');
        const sheetHTML = this.sheetRenderer.renderFullSheet(this.currentCharacter);
        container.innerHTML = sheetHTML;
    }
    
    async exportCharacterPDF() {
        if (!this.currentCharacter) return;
        
        // Check if html2pdf is available
        if (typeof html2pdf === 'undefined') {
            // Load html2pdf dynamically
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => {
                this.exporter.exportToPDF(this.currentCharacter);
            };
            document.head.appendChild(script);
        } else {
            this.exporter.exportToPDF(this.currentCharacter);
        }
    }
    
    generateId() {
        return 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dndApp = new DnDCharacterCreatorApp();
});
