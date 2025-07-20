// Character Storage Manager
export class CharacterStorage {
    constructor() {
        this.storageKey = 'dnd5e_characters';
        this.versionKey = 'dnd5e_storage_version';
        this.currentVersion = '1.0';
        
        this.checkAndMigrateStorage();
    }
    
    // Check storage version and migrate if needed
    checkAndMigrateStorage() {
        const storedVersion = localStorage.getItem(this.versionKey);
        
        if (!storedVersion) {
            // First time setup
            localStorage.setItem(this.versionKey, this.currentVersion);
        } else if (storedVersion !== this.currentVersion) {
            // Handle future migrations here
            this.migrateStorage(storedVersion, this.currentVersion);
        }
    }
    
    migrateStorage(fromVersion, toVersion) {
        console.log(`Migrating storage from ${fromVersion} to ${toVersion}`);
        // Add migration logic here when needed
        localStorage.setItem(this.versionKey, toVersion);
    }
    
    // Get all characters
    getAll() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading characters:', error);
            return {};
        }
    }
    
    // Get a specific character by ID
    get(id) {
        const characters = this.getAll();
        return characters[id] || null;
    }
    
    // Save a character
    save(character) {
        if (!character.id) {
            throw new Error('Character must have an ID');
        }
        
        const characters = this.getAll();
        characters[character.id] = character;
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(characters));
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please delete some characters to make space.');
            } else {
                console.error('Error saving character:', error);
                alert('Failed to save character. Please try again.');
            }
            return false;
        }
    }
    
    // Delete a character
    delete(id) {
        const characters = this.getAll();
        if (characters[id]) {
            delete characters[id];
            localStorage.setItem(this.storageKey, JSON.stringify(characters));
            return true;
        }
        return false;
    }
    
    // Get list of character summaries (for list view)
    getSummaries() {
        const characters = this.getAll();
        return Object.values(characters).map(char => ({
            id: char.id,
            name: char.metadata?.name || 'Unnamed Character',
            race: char.basic?.race || 'Unknown',
            subrace: char.basic?.subrace || '',
            class: char.basic?.class || 'Unknown',
            level: char.basic?.level || 1,
            created: char.metadata?.created || new Date().toISOString(),
            modified: char.metadata?.modified || new Date().toISOString()
        }));
    }
    
    // Export character as JSON
    exportCharacter(id) {
        const character = this.get(id);
        if (!character) return null;
        
        return JSON.stringify(character, null, 2);
    }
    
    // Import character from JSON
    importCharacter(jsonString, generateNewId = true) {
        try {
            const character = JSON.parse(jsonString);
            
            if (generateNewId) {
                character.id = this.generateId();
            }
            
            if (this.save(character)) {
                return character;
            }
            return null;
        } catch (error) {
            console.error('Error importing character:', error);
            return null;
        }
    }
    
    // Generate unique ID
    generateId() {
        return 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Get storage usage info
    getStorageInfo() {
        const characters = this.getAll();
        const characterCount = Object.keys(characters).length;
        const storageSize = new Blob([JSON.stringify(characters)]).size;
        const storageSizeMB = (storageSize / 1024 / 1024).toFixed(2);
        
        return {
            characterCount,
            storageSize,
            storageSizeMB,
            estimatedMaxCharacters: Math.floor(5 * 1024 * 1024 / (storageSize / characterCount || 1))
        };
    }
    
    // Clear all characters (with confirmation)
    clearAll() {
        if (confirm('This will delete ALL characters. Are you absolutely sure?')) {
            localStorage.removeItem(this.storageKey);
            return true;
        }
        return false;
    }
    
    // Backup all characters
    backupAll() {
        const characters = this.getAll();
        const backup = {
            version: this.currentVersion,
            timestamp: new Date().toISOString(),
            characters: characters
        };
        
        return JSON.stringify(backup, null, 2);
    }
    
    // Restore from backup
    restoreFromBackup(backupString) {
        try {
            const backup = JSON.parse(backupString);
            
            if (!backup.characters) {
                throw new Error('Invalid backup format');
            }
            
            // Clear existing and restore
            localStorage.setItem(this.storageKey, JSON.stringify(backup.characters));
            localStorage.setItem(this.versionKey, backup.version || this.currentVersion);
            
            return true;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    }
}
