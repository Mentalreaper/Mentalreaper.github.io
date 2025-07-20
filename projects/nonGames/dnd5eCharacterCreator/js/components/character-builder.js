// Character Builder Component
export class CharacterBuilder {
    constructor(app) {
        this.app = app;
        this.currentCharacter = null;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Race selection change
        document.getElementById('character-race').addEventListener('change', (e) => {
            this.updateSubraceOptions(e.target.value);
            this.updateAbilityScores();
        });
        
        // Class selection change
        document.getElementById('character-class').addEventListener('change', (e) => {
            this.updateClassFeatures(e.target.value);
            this.updateSkillOptions();
        });
        
        // Level change
        document.getElementById('character-level').addEventListener('change', () => {
            this.updateClassFeatures();
            this.updateProficiencyBonus();
        });
        
        // Ability method change
        document.querySelectorAll('input[name="ability-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.setupAbilityScores(e.target.value);
            });
        });
    }
    
    createNewCharacter() {
        const id = this.app.generateId();
        return {
            id: id,
            metadata: {
                name: '',
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                version: '1.0'
            },
            basic: {
                race: '',
                subrace: '',
                class: '',
                subclass: '',
                level: 1,
                background: '',
                alignment: ''
            },
            abilities: {
                strength: 10,
                dexterity: 10,
                constitution: 10,
                intelligence: 10,
                wisdom: 10,
                charisma: 10,
                method: 'point-buy'
            },
            skills: {},
            equipment: {
                weapons: [],
                armor: [],
                gear: [],
                currency: {
                    gold: 0,
                    silver: 0,
                    copper: 0
                }
            },
            spells: {
                known: [],
                slots: {}
            },
            character: {
                personality: '',
                ideals: '',
                bonds: '',
                flaws: '',
                backstory: '',
                appearance: {
                    age: '',
                    height: '',
                    weight: '',
                    hair: '',
                    eyes: '',
                    skin: ''
                }
            }
        };
    }
    
    async loadCharacterIntoForm(character) {
        this.currentCharacter = character;
        
        // Load basic info
        document.getElementById('character-name').value = character.metadata.name || '';
        document.getElementById('character-race').value = character.basic.race || '';
        document.getElementById('character-class').value = character.basic.class || '';
        document.getElementById('character-level').value = character.basic.level || 1;
        document.getElementById('character-background').value = character.basic.background || '';
        document.getElementById('character-alignment').value = character.basic.alignment || '';
        
        // Load race and class options
        await this.populateSelects();
        
        // Update subrace if applicable
        if (character.basic.race) {
            await this.updateSubraceOptions(character.basic.race);
            document.getElementById('character-subrace').value = character.basic.subrace || '';
        }
        
        // Setup ability scores
        const method = character.abilities.method || 'point-buy';
        document.querySelector(`input[name="ability-method"][value="${method}"]`).checked = true;
        this.setupAbilityScores(method);
        
        // Load ability scores
        Object.keys(character.abilities).forEach(ability => {
            if (ability !== 'method') {
                const input = document.getElementById(`ability-${ability}`);
                if (input) input.value = character.abilities[ability];
            }
        });
        
        // Load skills
        this.loadSkills(character);
        
        // Load equipment
        this.loadEquipment(character);
        
        // Load character details
        this.loadCharacterDetails(character);
    }
    
    async populateSelects() {
        // Populate races
        const races = await this.app.dataManager.loadRaces();
        const raceSelect = document.getElementById('character-race');
        raceSelect.innerHTML = '<option value="">Select a race</option>';
        Object.entries(races).forEach(([key, race]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = race.name;
            raceSelect.appendChild(option);
        });
        
        // Populate classes
        const classes = await this.app.dataManager.loadClasses();
        const classSelect = document.getElementById('character-class');
        classSelect.innerHTML = '<option value="">Select a class</option>';
        Object.entries(classes).forEach(([key, cls]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });
        
        // Populate backgrounds
        const backgrounds = await this.app.dataManager.loadBackgrounds();
        const bgSelect = document.getElementById('character-background');
        bgSelect.innerHTML = '<option value="">Select a background</option>';
        Object.entries(backgrounds).forEach(([key, bg]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = bg.name;
            bgSelect.appendChild(option);
        });
    }
    
    async updateSubraceOptions(raceName) {
        const races = await this.app.dataManager.loadRaces();
        const race = races[raceName];
        const subraceSelect = document.getElementById('character-subrace');
        
        subraceSelect.innerHTML = '<option value="">None</option>';
        
        if (race && race.subraces && Object.keys(race.subraces).length > 0) {
            Object.entries(race.subraces).forEach(([key, subrace]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = subrace.name;
                subraceSelect.appendChild(option);
            });
        }
    }
    
    setupAbilityScores(method) {
        const container = document.getElementById('ability-scores-container');
        container.innerHTML = '';
        
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        if (method === 'point-buy') {
            container.innerHTML = this.createPointBuyInterface(abilities);
        } else if (method === 'standard-array') {
            container.innerHTML = this.createStandardArrayInterface(abilities);
        } else {
            container.innerHTML = this.createManualInterface(abilities);
        }
        
        // Add event listeners for ability score changes
        container.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('change', () => this.updateAbilityModifiers());
        });
    }
    
    createPointBuyInterface(abilities) {
        let html = '<div class="point-buy-info">Points Remaining: <span id="points-remaining">27</span></div>';
        html += '<div class="ability-scores">';
        
        abilities.forEach(ability => {
            html += `
                <div class="ability-score-item">
                    <div class="ability-score-label">${ability.charAt(0).toUpperCase() + ability.slice(1)}</div>
                    <input type="number" id="ability-${ability}" min="8" max="15" value="10" class="ability-score-input">
                    <div class="ability-score-modifier" id="mod-${ability}">+0</div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // Add event listeners after DOM is updated
        setTimeout(() => {
            abilities.forEach(ability => {
                const input = document.getElementById(`ability-${ability}`);
                if (input) {
                    input.addEventListener('change', () => {
                        this.updatePointBuyTotal();
                        this.updateAbilityModifiers();
                    });
                }
            });
            this.updatePointBuyTotal();
        }, 0);
        
        return html;
    }
    
    createStandardArrayInterface(abilities) {
        const standardArray = [15, 14, 13, 12, 10, 8];
        let html = '<div class="standard-array-info">Assign these scores: 15, 14, 13, 12, 10, 8</div>';
        html += '<div class="ability-scores">';
        
        abilities.forEach((ability, index) => {
            html += `
                <div class="ability-score-item">
                    <div class="ability-score-label">${ability.charAt(0).toUpperCase() + ability.slice(1)}</div>
                    <select id="ability-${ability}" class="ability-score-select">
                        <option value="">--</option>
                        ${standardArray.map(score => `<option value="${score}">${score}</option>`).join('')}
                    </select>
                    <div class="ability-score-modifier" id="mod-${ability}">+0</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    createManualInterface(abilities) {
        let html = '<div class="manual-info">Enter ability scores manually (3-18)</div>';
        html += '<div class="ability-scores">';
        
        abilities.forEach(ability => {
            html += `
                <div class="ability-score-item">
                    <div class="ability-score-label">${ability.charAt(0).toUpperCase() + ability.slice(1)}</div>
                    <input type="number" id="ability-${ability}" min="3" max="18" value="10" class="ability-score-input">
                    <div class="ability-score-modifier" id="mod-${ability}">+0</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    updateAbilityModifiers() {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        abilities.forEach(ability => {
            const scoreElement = document.getElementById(`ability-${ability}`);
            const modElement = document.getElementById(`mod-${ability}`);
            
            if (scoreElement && modElement) {
                const score = parseInt(scoreElement.value) || 10;
                const modifier = this.app.dataManager.getAbilityModifier(score);
                modElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            }
        });
    }
    
    updateAbilityScores() {
        // Apply racial bonuses
        // This would be implemented based on selected race
    }
    
    updateClassFeatures() {
        // Update features based on class and level
    }
    
    updateSkillOptions() {
        // Update available skills based on class and background
    }
    
    updateProficiencyBonus() {
        const level = parseInt(document.getElementById('character-level').value) || 1;
        const bonus = this.app.dataManager.getProficiencyBonus(level);
        // Update all proficiency-based calculations
    }
    
    updatePointBuyTotal() {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        const costs = {
            8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
        };
        
        let totalCost = 0;
        abilities.forEach(ability => {
            const input = document.getElementById(`ability-${ability}`);
            if (input) {
                const value = parseInt(input.value) || 10;
                totalCost += costs[value] || 0;
            }
        });
        
        const remainingSpan = document.getElementById('points-remaining');
        if (remainingSpan) {
            const remaining = 27 - totalCost;
            remainingSpan.textContent = remaining;
            remainingSpan.style.color = remaining < 0 ? 'var(--error)' : 'var(--accent-primary)';
        }
    }
    
    async loadSkills(character) {
        const container = document.getElementById('skills-container');
        const skills = await this.app.dataManager.loadSkills();
        const classes = await this.app.dataManager.loadClasses();
        const backgrounds = await this.app.dataManager.loadBackgrounds();
        
        // Get skill choices from class and background
        const selectedClass = document.getElementById('character-class').value;
        const selectedBackground = document.getElementById('character-background').value;
        
        let maxSkills = 0;
        let availableSkills = [];
        
        if (selectedClass && classes[selectedClass]) {
            maxSkills = classes[selectedClass].skillChoices || 0;
            const skillOptions = classes[selectedClass].skillOptions;
            if (skillOptions === 'any') {
                availableSkills = Object.keys(skills);
            } else {
                availableSkills = skillOptions || [];
            }
        }
        
        // Add background skills (these are automatic proficiencies)
        let backgroundSkills = [];
        if (selectedBackground && backgrounds[selectedBackground]) {
            backgroundSkills = backgrounds[selectedBackground].skillProficiencies || [];
        }
        
        let html = `<div class="skills-info">`;
        if (maxSkills > 0) {
            html += `<p>Choose ${maxSkills} skill${maxSkills > 1 ? 's' : ''} from your class.</p>`;
        }
        if (backgroundSkills.length > 0) {
            html += `<p>Background skills (automatic): ${backgroundSkills.map(s => skills[s]?.name || s).join(', ')}</p>`;
        }
        html += `<p class="skill-count">Selected: <span id="selected-skills-count">0</span> / ${maxSkills}</p>`;
        html += `</div>`;
        
        html += '<div class="skills-grid">';
        
        Object.entries(skills).forEach(([key, skill]) => {
            const isProficient = character.skills[key] || false;
            const isFromBackground = backgroundSkills.includes(key);
            const isAvailable = availableSkills.includes(key) || availableSkills.length === 0;
            const ability = skill.ability;
            const abilityMod = this.app.dataManager.getAbilityModifier(character.abilities[ability] || 10);
            const profBonus = this.app.dataManager.getProficiencyBonus(character.basic.level || 1);
            const modifier = isProficient || isFromBackground ? abilityMod + profBonus : abilityMod;
            
            html += `
                <div class="skill-item ${!isAvailable && !isFromBackground ? 'disabled' : ''} ${isFromBackground ? 'background-skill' : ''}">
                    <input type="checkbox" 
                           id="skill-${key}" 
                           class="skill-checkbox ${isFromBackground ? '' : 'class-skill'}"
                           ${isProficient || isFromBackground ? 'checked' : ''}
                           ${isFromBackground ? 'disabled' : ''}
                           ${!isAvailable && !isFromBackground ? 'disabled' : ''}>
                    <label for="skill-${key}" class="skill-name">
                        ${skill.name} 
                        <span class="skill-ability">(${ability.charAt(0).toUpperCase() + ability.slice(1, 3)})</span>
                    </label>
                    <span class="skill-modifier" id="skill-mod-${key}">${modifier >= 0 ? '+' : ''}${modifier}</span>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Add event listeners for skill selection
        this.setupSkillListeners(maxSkills);
        this.updateSkillCount();
    }
    
    setupSkillListeners(maxSkills) {
        const checkboxes = document.querySelectorAll('.skill-checkbox.class-skill:not(:disabled)');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const checkedCount = document.querySelectorAll('.skill-checkbox.class-skill:checked').length;
                
                if (checkedCount > maxSkills) {
                    checkbox.checked = false;
                    alert(`You can only select ${maxSkills} skill${maxSkills > 1 ? 's' : ''} from your class.`);
                }
                
                this.updateSkillCount();
                this.updateSkillModifiers();
            });
        });
    }
    
    updateSkillCount() {
        const countSpan = document.getElementById('selected-skills-count');
        if (countSpan) {
            const checkedCount = document.querySelectorAll('.skill-checkbox.class-skill:checked').length;
            countSpan.textContent = checkedCount;
        }
    }
    
    async updateSkillModifiers() {
        const skills = await this.app.dataManager.loadSkills();
        const level = parseInt(document.getElementById('character-level').value) || 1;
        const profBonus = this.app.dataManager.getProficiencyBonus(level);
        
        Object.entries(skills).forEach(([key, skill]) => {
            const checkbox = document.getElementById(`skill-${key}`);
            const modSpan = document.getElementById(`skill-mod-${key}`);
            
            if (checkbox && modSpan) {
                const ability = skill.ability;
                const abilityScore = parseInt(document.getElementById(`ability-${ability}`)?.value) || 10;
                const abilityMod = this.app.dataManager.getAbilityModifier(abilityScore);
                const isProficient = checkbox.checked;
                const modifier = isProficient ? abilityMod + profBonus : abilityMod;
                
                modSpan.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            }
        });
    }
    
    loadEquipment(character) {
        // Load equipment into the form
        // This would populate the equipment section
    }
    
    loadCharacterDetails(character) {
        // Physical details
        document.getElementById('character-age').value = character.character.appearance.age || '';
        document.getElementById('character-height').value = character.character.appearance.height || '';
        document.getElementById('character-weight').value = character.character.appearance.weight || '';
        document.getElementById('character-eyes').value = character.character.appearance.eyes || '';
        document.getElementById('character-hair').value = character.character.appearance.hair || '';
        document.getElementById('character-skin').value = character.character.appearance.skin || '';
        
        // Personality details
        document.getElementById('character-personality').value = character.character.personality || '';
        document.getElementById('character-ideals').value = character.character.ideals || '';
        document.getElementById('character-bonds').value = character.character.bonds || '';
        document.getElementById('character-flaws').value = character.character.flaws || '';
        document.getElementById('character-backstory').value = character.character.backstory || '';
    }
    
    getCharacterFromForm() {
        const character = this.currentCharacter || this.createNewCharacter();
        
        // Basic info
        character.metadata.name = document.getElementById('character-name').value;
        character.basic.race = document.getElementById('character-race').value;
        character.basic.subrace = document.getElementById('character-subrace').value;
        character.basic.class = document.getElementById('character-class').value;
        character.basic.level = parseInt(document.getElementById('character-level').value) || 1;
        character.basic.background = document.getElementById('character-background').value;
        character.basic.alignment = document.getElementById('character-alignment').value;
        
        // Abilities
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        abilities.forEach(ability => {
            const element = document.getElementById(`ability-${ability}`);
            if (element) {
                character.abilities[ability] = parseInt(element.value) || 10;
            }
        });
        character.abilities.method = document.querySelector('input[name="ability-method"]:checked').value;
        
        // Skills
        document.querySelectorAll('#skills-container input[type="checkbox"]').forEach(checkbox => {
            const skillKey = checkbox.id.replace('skill-', '');
            character.skills[skillKey] = checkbox.checked;
        });
        
        // Character details
        character.character.appearance.age = document.getElementById('character-age').value;
        character.character.appearance.height = document.getElementById('character-height').value;
        character.character.appearance.weight = document.getElementById('character-weight').value;
        character.character.appearance.eyes = document.getElementById('character-eyes').value;
        character.character.appearance.hair = document.getElementById('character-hair').value;
        character.character.appearance.skin = document.getElementById('character-skin').value;
        
        character.character.personality = document.getElementById('character-personality').value;
        character.character.ideals = document.getElementById('character-ideals').value;
        character.character.bonds = document.getElementById('character-bonds').value;
        character.character.flaws = document.getElementById('character-flaws').value;
        character.character.backstory = document.getElementById('character-backstory').value;
        
        // Validate required fields
        if (!character.metadata.name || !character.basic.race || !character.basic.class) {
            return null;
        }
        
        return character;
    }
}
