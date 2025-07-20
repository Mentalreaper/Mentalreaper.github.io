// Character Sheet Renderer Module
export class CharacterSheetRenderer {
    constructor() {
        this.dataManager = null;
    }
    
    // Render the full character sheet
    renderFullSheet(character) {
        if (!character) return '<div class="error">No character data</div>';
        
        return `
            <div class="character-sheet dnd-sheet">
                <div class="sheet-page page-1">
                    ${this.renderPageHeader(character)}
                    <div class="sheet-main-content">
                        <div class="sheet-left-column">
                            ${this.renderAbilityScores(character)}
                            ${this.renderProficiencyBonus(character)}
                            ${this.renderSavingThrows(character)}
                            ${this.renderSkills(character)}
                        </div>
                        <div class="sheet-center-column">
                            ${this.renderCombatStats(character)}
                            ${this.renderAttacksAndSpellcasting(character)}
                            ${this.renderEquipment(character)}
                        </div>
                        <div class="sheet-right-column">
                            ${this.renderPersonalityTraits(character)}
                            ${this.renderFeaturesAndTraits(character)}
                        </div>
                    </div>
                </div>
                <div class="sheet-page page-2">
                    ${this.renderCharacterDetails(character)}
                    ${this.renderBackstory(character)}
                    ${this.renderAlliesAndOrganizations(character)}
                    ${this.renderAdditionalFeatures(character)}
                </div>
            </div>
        `;
    }
    
    // Render page header with character info
    renderPageHeader(character) {
        const race = character.basic.subrace ? 
            `${this.capitalize(character.basic.subrace)} ${this.capitalize(character.basic.race)}` : 
            this.capitalize(character.basic.race);
            
        return `
            <div class="sheet-header-box">
                <div class="character-name-section">
                    <input type="text" class="character-name-input" value="${character.metadata.name || ''}" readonly>
                    <label>Character Name</label>
                </div>
                <div class="character-info-boxes">
                    <div class="info-box">
                        <span>${this.capitalize(character.basic.class)} ${character.basic.level || 1}</span>
                        <label>Class & Level</label>
                    </div>
                    <div class="info-box">
                        <span>${this.capitalize(character.basic.background)}</span>
                        <label>Background</label>
                    </div>
                    <div class="info-box">
                        <span>Player Name</span>
                        <label>Player Name</label>
                    </div>
                    <div class="info-box">
                        <span>${race}</span>
                        <label>Race</label>
                    </div>
                    <div class="info-box">
                        <span>${this.formatAlignment(character.basic.alignment)}</span>
                        <label>Alignment</label>
                    </div>
                    <div class="info-box">
                        <span>0</span>
                        <label>Experience Points</label>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render character header with basic info
    renderHeader(character) {
        const race = character.basic.subrace ? 
            `${this.capitalize(character.basic.subrace)} ${this.capitalize(character.basic.race)}` : 
            this.capitalize(character.basic.race);
        
        return `
            <div class="sheet-section sheet-header-info">
                <div>
                    <h1 class="character-name">${character.metadata.name || 'Unnamed Character'}</h1>
                    <div class="character-basics">
                        Level ${character.basic.level} ${race} ${this.capitalize(character.basic.class)}<br>
                        ${this.capitalize(character.basic.background)} • ${this.formatAlignment(character.basic.alignment)}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render ability scores section
    renderAbilityScores(character) {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        return `
            <div class="sheet-section">
                <h2>Ability Scores</h2>
                <div class="ability-scores-print">
                    ${abilities.map(ability => {
                        const score = character.abilities[ability] || 10;
                        const modifier = this.getAbilityModifier(score);
                        const modString = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                        
                        return `
                            <div class="ability-score-box">
                                <div class="ability-score-name">${ability.toUpperCase().substr(0, 3)}</div>
                                <div class="ability-score-value">${score}</div>
                                <div class="ability-score-modifier">${modString}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Render combat statistics
    renderCombatStats(character) {
        const level = character.basic.level || 1;
        const profBonus = Math.ceil(level / 4) + 1;
        const conMod = this.getAbilityModifier(character.abilities.constitution || 10);
        const dexMod = this.getAbilityModifier(character.abilities.dexterity || 10);
        
        // Basic calculations - would be enhanced with class data
        const hp = 10 + (conMod * level); // Placeholder calculation
        const ac = 10 + dexMod; // Base AC without armor
        const initiative = dexMod;
        const speed = 30; // Default, should come from race
        
        return `
            <div class="sheet-section">
                <h2>Combat Statistics</h2>
                <div class="combat-stats">
                    <div class="stat-box">
                        <div class="stat-label">Armor Class</div>
                        <div class="stat-value">${ac}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Initiative</div>
                        <div class="stat-value">${initiative >= 0 ? '+' : ''}${initiative}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Speed</div>
                        <div class="stat-value">${speed} ft</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Hit Points</div>
                        <div class="stat-value">${hp}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Hit Dice</div>
                        <div class="stat-value">${level}d10</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Prof. Bonus</div>
                        <div class="stat-value">+${profBonus}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render skills section
    renderSkills(character) {
        const skills = {
            'acrobatics': 'dexterity',
            'animalHandling': 'wisdom',
            'arcana': 'intelligence',
            'athletics': 'strength',
            'deception': 'charisma',
            'history': 'intelligence',
            'insight': 'wisdom',
            'intimidation': 'charisma',
            'investigation': 'intelligence',
            'medicine': 'wisdom',
            'nature': 'intelligence',
            'perception': 'wisdom',
            'performance': 'charisma',
            'persuasion': 'charisma',
            'religion': 'intelligence',
            'sleightOfHand': 'dexterity',
            'stealth': 'dexterity',
            'survival': 'wisdom'
        };
        
        const profBonus = Math.ceil((character.basic.level || 1) / 4) + 1;
        
        return `
            <div class="sheet-section">
                <h2>Skills</h2>
                <div class="skills-print">
                    ${Object.entries(skills).map(([skill, ability]) => {
                        const isProficient = character.skills[skill] || false;
                        const abilityMod = this.getAbilityModifier(character.abilities[ability] || 10);
                        const bonus = isProficient ? abilityMod + profBonus : abilityMod;
                        const bonusStr = bonus >= 0 ? `+${bonus}` : `${bonus}`;
                        
                        return `
                            <div class="skill-print-item">
                                <span class="${isProficient ? 'skill-proficiency' : ''}">
                                    ${isProficient ? '● ' : '○ '}${this.formatSkillName(skill)}
                                </span>
                                <span>${bonusStr}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Render features and traits
    renderFeatures(character) {
        // This would be populated from class/race features
        return `
            <div class="sheet-section features-traits">
                <h2>Features & Traits</h2>
                <div class="feature-list">
                    ${this.getRaceFeatures(character)}
                    ${this.getClassFeatures(character)}
                    ${this.getBackgroundFeature(character)}
                </div>
            </div>
        `;
    }
    
    // Render equipment section
    renderEquipment(character) {
        return `
            <div class="sheet-section equipment-print">
                <h2>Equipment</h2>
                ${this.renderEquipmentCategory('Weapons', character.equipment.weapons)}
                ${this.renderEquipmentCategory('Armor', character.equipment.armor)}
                ${this.renderEquipmentCategory('Other Gear', character.equipment.gear)}
                <div class="equipment-category">
                    <div class="equipment-category-title">Currency</div>
                    <div class="equipment-list-print">
                        ${character.equipment.currency.gold || 0} gp, 
                        ${character.equipment.currency.silver || 0} sp, 
                        ${character.equipment.currency.copper || 0} cp
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render character details
    renderCharacterDetails(character) {
        const appearance = character.character.appearance;
        
        return `
            <div class="sheet-section character-details-print">
                <h2>Character Details</h2>
                <div class="detail-row">
                    <span class="detail-label">Age:</span>
                    <span>${appearance.age || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Height:</span>
                    <span>${appearance.height || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Weight:</span>
                    <span>${appearance.weight || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Eyes:</span>
                    <span>${appearance.eyes || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Hair:</span>
                    <span>${appearance.hair || '—'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Skin:</span>
                    <span>${appearance.skin || '—'}</span>
                </div>
            </div>
        `;
    }
    
    // Render backstory and personality
    renderBackstory(character) {
        return `
            <div class="sheet-section backstory-print page-break">
                <h2>Backstory & Personality</h2>
                
                ${character.character.personality ? `
                    <h3>Personality Traits</h3>
                    <div class="backstory-text">${character.character.personality}</div>
                ` : ''}
                
                ${character.character.ideals ? `
                    <h3>Ideals</h3>
                    <div class="backstory-text">${character.character.ideals}</div>
                ` : ''}
                
                ${character.character.bonds ? `
                    <h3>Bonds</h3>
                    <div class="backstory-text">${character.character.bonds}</div>
                ` : ''}
                
                ${character.character.flaws ? `
                    <h3>Flaws</h3>
                    <div class="backstory-text">${character.character.flaws}</div>
                ` : ''}
                
                ${character.character.backstory ? `
                    <h3>Backstory</h3>
                    <div class="backstory-text">${character.character.backstory}</div>
                ` : ''}
            </div>
        `;
    }
    
    // Helper methods
    getAbilityModifier(score) {
        return Math.floor((score - 10) / 2);
    }
    
    capitalize(str) {
        if (!str) return '';
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    formatAlignment(alignment) {
        if (!alignment) return 'Unaligned';
        return alignment.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    formatSkillName(skill) {
        // Convert camelCase to Title Case
        return skill
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
    
    renderEquipmentCategory(title, items) {
        if (!items || items.length === 0) return '';
        
        return `
            <div class="equipment-category">
                <div class="equipment-category-title">${title}</div>
                <div class="equipment-list-print">
                    ${items.map(item => `• ${item}`).join('<br>')}
                </div>
            </div>
        `;
    }
    
    getRaceFeatures(character) {
        // This would pull from race data
        const features = [];
        if (character.basic.race === 'elf') {
            features.push('Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance');
        } else if (character.basic.race === 'dwarf') {
            features.push('Darkvision', 'Dwarven Resilience', 'Stonecunning');
        }
        
        return features.map(f => `<div class="feature-item">• ${f}</div>`).join('');
    }
    
    getClassFeatures(character) {
        // This would pull from class data based on level
        const features = [];
        if (character.basic.class === 'fighter' && character.basic.level >= 1) {
            features.push('Fighting Style', 'Second Wind');
        }
        if (character.basic.class === 'fighter' && character.basic.level >= 2) {
            features.push('Action Surge');
        }
        
        return features.map(f => `<div class="feature-item">• ${f}</div>`).join('');
    }
    
    getBackgroundFeature(character) {
        // This would pull from background data
        const bgFeatures = {
            'acolyte': 'Shelter of the Faithful',
            'criminal': 'Criminal Contact',
            'folk-hero': 'Rustic Hospitality',
            'noble': 'Position of Privilege',
            'sage': 'Researcher',
            'soldier': 'Military Rank'
        };
        
        const feature = bgFeatures[character.basic.background];
        return feature ? `<div class="feature-item">• ${feature}</div>` : '';
    }
    
    renderProficiencyBonus(character) {
        const level = character.basic.level || 1;
        const profBonus = Math.ceil(level / 4) + 1;
        
        return `
            <div class="proficiency-bonus-box">
                <div class="bonus-circle">+${profBonus}</div>
                <label>Proficiency Bonus</label>
            </div>
        `;
    }
    
    renderSavingThrows(character) {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        const level = character.basic.level || 1;
        const profBonus = Math.ceil(level / 4) + 1;
        
        // Get class saving throw proficiencies
        const classSaves = this.getClassSavingThrows(character.basic.class);
        
        return `
            <div class="sheet-section saving-throws">
                <h3>Saving Throws</h3>
                ${abilities.map(ability => {
                    const abilityMod = this.getAbilityModifier(character.abilities[ability] || 10);
                    const isProficient = classSaves.includes(ability);
                    const bonus = isProficient ? abilityMod + profBonus : abilityMod;
                    const bonusStr = bonus >= 0 ? `+${bonus}` : `${bonus}`;
                    
                    return `
                        <div class="save-item">
                            <span class="${isProficient ? 'proficient' : ''}">
                                ${isProficient ? '● ' : '○ '}${bonusStr}
                            </span>
                            <span>${this.capitalize(ability)}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    getClassSavingThrows(className) {
        const classSaves = {
            'barbarian': ['strength', 'constitution'],
            'bard': ['dexterity', 'charisma'],
            'cleric': ['wisdom', 'charisma'],
            'druid': ['intelligence', 'wisdom'],
            'fighter': ['strength', 'constitution'],
            'monk': ['strength', 'dexterity'],
            'paladin': ['wisdom', 'charisma'],
            'ranger': ['strength', 'dexterity'],
            'rogue': ['dexterity', 'intelligence'],
            'sorcerer': ['constitution', 'charisma'],
            'warlock': ['wisdom', 'charisma'],
            'wizard': ['intelligence', 'wisdom']
        };
        
        return classSaves[className] || [];
    }
    
    renderAttacksAndSpellcasting(character) {
        return `
            <div class="sheet-section attacks-spellcasting">
                <h3>Attacks & Spellcasting</h3>
                <div class="attacks-table">
                    <div class="attack-header">
                        <span>Name</span>
                        <span>Atk Bonus</span>
                        <span>Damage/Type</span>
                    </div>
                    <div class="attack-row">
                        <input type="text" placeholder="Weapon/Spell">
                        <input type="text" placeholder="+0">
                        <input type="text" placeholder="1d6 + 0">
                    </div>
                    <div class="attack-row">
                        <input type="text" placeholder="Weapon/Spell">
                        <input type="text" placeholder="+0">
                        <input type="text" placeholder="1d6 + 0">
                    </div>
                    <div class="attack-row">
                        <input type="text" placeholder="Weapon/Spell">
                        <input type="text" placeholder="+0">
                        <input type="text" placeholder="1d6 + 0">
                    </div>
                </div>
                <div class="attacks-text-area">
                    <textarea placeholder="Additional attack notes"></textarea>
                </div>
            </div>
        `;
    }
    
    renderPersonalityTraits(character) {
        return `
            <div class="sheet-section personality-traits">
                <div class="trait-box">
                    <label>Personality Traits</label>
                    <div class="trait-content">${character.character.personality || ''}</div>
                </div>
                <div class="trait-box">
                    <label>Ideals</label>
                    <div class="trait-content">${character.character.ideals || ''}</div>
                </div>
                <div class="trait-box">
                    <label>Bonds</label>
                    <div class="trait-content">${character.character.bonds || ''}</div>
                </div>
                <div class="trait-box">
                    <label>Flaws</label>
                    <div class="trait-content">${character.character.flaws || ''}</div>
                </div>
            </div>
        `;
    }
    
    renderFeaturesAndTraits(character) {
        return `
            <div class="sheet-section features-traits-box">
                <label>Features & Traits</label>
                <div class="features-content">
                    ${this.getRaceFeatures(character)}
                    ${this.getClassFeatures(character)}
                    ${this.getBackgroundFeature(character)}
                </div>
            </div>
        `;
    }
    
    renderAlliesAndOrganizations(character) {
        return `
            <div class="sheet-section allies-organizations">
                <h3>Allies & Organizations</h3>
                <div class="allies-content">
                    <p>List any allies, organizations, or groups your character is affiliated with.</p>
                </div>
            </div>
        `;
    }
    
    renderAdditionalFeatures(character) {
        return `
            <div class="sheet-section additional-features">
                <h3>Additional Features & Traits</h3>
                <div class="additional-content">
                    <p>Any additional features, racial traits, or abilities not covered elsewhere.</p>
                </div>
            </div>
        `;
    }
}
