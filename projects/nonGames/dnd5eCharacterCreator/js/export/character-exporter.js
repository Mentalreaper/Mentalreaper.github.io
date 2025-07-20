// Character Exporter Module
export class CharacterExporter {
    constructor() {
        this.pdfOptions = {
            margin: 0.5,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
    }
    
    // Export character to JSON file
    exportToJSON(character) {
        if (!character) return;
        
        const jsonString = JSON.stringify(character, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const filename = this.generateFilename(character, 'json');
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    // Export character sheet to PDF
    async exportToPDF(character) {
        if (!character || typeof html2pdf === 'undefined') {
            console.error('html2pdf library not loaded or no character provided');
            return;
        }
        
        // Create a temporary container for the PDF content
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '8.5in';
        tempContainer.className = 'pdf-export-container';
        
        // Render the character sheet in the temp container
        const sheetRenderer = await import('./sheet-renderer.js').then(m => new m.CharacterSheetRenderer());
        tempContainer.innerHTML = sheetRenderer.renderFullSheet(character);
        document.body.appendChild(tempContainer);
        
        const filename = this.generateFilename(character, 'pdf');
        
        const opt = {
            ...this.pdfOptions,
            filename: filename
        };
        
        // Generate PDF
        try {
            await html2pdf().set(opt).from(tempContainer).save();
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            // Clean up
            document.body.removeChild(tempContainer);
        }
    }
    
    // Export to other formats (future expansion)
    exportToRoll20(character) {
        // Convert character data to Roll20 compatible format
        const roll20Data = this.convertToRoll20Format(character);
        this.exportToJSON(roll20Data);
    }
    
    exportToFoundryVTT(character) {
        // Convert character data to Foundry VTT compatible format
        const foundryData = this.convertToFoundryFormat(character);
        this.exportToJSON(foundryData);
    }
    
    // Generate filename based on character name and format
    generateFilename(character, extension) {
        const name = character.metadata?.name || 'character';
        const cleanName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const date = new Date().toISOString().split('T')[0];
        return `${cleanName}-${date}.${extension}`;
    }
    
    // Convert to Roll20 format (basic implementation)
    convertToRoll20Format(character) {
        return {
            name: character.metadata.name,
            bio: character.character.backstory,
            gmnotes: '',
            attributes: {
                strength: character.abilities.strength,
                dexterity: character.abilities.dexterity,
                constitution: character.abilities.constitution,
                intelligence: character.abilities.intelligence,
                wisdom: character.abilities.wisdom,
                charisma: character.abilities.charisma,
                level: character.basic.level,
                class: character.basic.class,
                race: character.basic.race,
                background: character.basic.background,
                alignment: character.basic.alignment,
                hp: this.calculateHP(character),
                ac: this.calculateAC(character)
            }
        };
    }
    
    // Convert to Foundry VTT format (basic implementation)
    convertToFoundryFormat(character) {
        return {
            name: character.metadata.name,
            type: "character",
            data: {
                attributes: {
                    hp: {
                        value: this.calculateHP(character),
                        max: this.calculateHP(character)
                    },
                    ac: {
                        value: this.calculateAC(character)
                    }
                },
                abilities: {
                    str: { value: character.abilities.strength },
                    dex: { value: character.abilities.dexterity },
                    con: { value: character.abilities.constitution },
                    int: { value: character.abilities.intelligence },
                    wis: { value: character.abilities.wisdom },
                    cha: { value: character.abilities.charisma }
                },
                details: {
                    biography: { value: character.character.backstory },
                    class: character.basic.class,
                    level: character.basic.level,
                    race: character.basic.race,
                    background: character.basic.background,
                    alignment: character.basic.alignment
                }
            }
        };
    }
    
    // Helper calculations
    calculateHP(character) {
        // Basic HP calculation - would need class hit dice data
        const level = character.basic.level || 1;
        const conMod = Math.floor((character.abilities.constitution - 10) / 2);
        const baseHP = 10; // Default, should be based on class
        return baseHP + (conMod * level);
    }
    
    calculateAC(character) {
        // Basic AC calculation - would need armor data
        const dexMod = Math.floor((character.abilities.dexterity - 10) / 2);
        return 10 + dexMod; // Base AC without armor
    }
}
