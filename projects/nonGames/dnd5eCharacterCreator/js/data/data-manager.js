// Data Manager for D&D 5e Content
export class DataManager {
    constructor() {
        this.cache = new Map();
        this.dataPath = 'data/dnd5e/';
    }
    
    // Preload core data that's needed immediately
    async preloadCoreData() {
        await Promise.all([
            this.loadRaces(),
            this.loadClasses(),
            this.loadBackgrounds()
        ]);
    }
    
    // Load races data
    async loadRaces() {
        if (!this.cache.has('races')) {
            const races = await this.loadData('races.json');
            this.cache.set('races', races || this.getDefaultRaces());
        }
        return this.cache.get('races');
    }
    
    // Load classes data
    async loadClasses() {
        if (!this.cache.has('classes')) {
            const classes = await this.loadData('classes.json');
            this.cache.set('classes', classes || this.getDefaultClasses());
        }
        return this.cache.get('classes');
    }
    
    // Load backgrounds data
    async loadBackgrounds() {
        if (!this.cache.has('backgrounds')) {
            const backgrounds = await this.loadData('backgrounds.json');
            this.cache.set('backgrounds', backgrounds || this.getDefaultBackgrounds());
        }
        return this.cache.get('backgrounds');
    }
    
    // Load skills data
    async loadSkills() {
        if (!this.cache.has('skills')) {
            const skills = await this.loadData('skills.json');
            this.cache.set('skills', skills || this.getDefaultSkills());
        }
        return this.cache.get('skills');
    }
    
    // Load equipment data
    async loadEquipment() {
        if (!this.cache.has('equipment')) {
            const equipment = await this.loadData('equipment.json');
            this.cache.set('equipment', equipment || this.getDefaultEquipment());
        }
        return this.cache.get('equipment');
    }
    
    // Load spells data
    async loadSpells() {
        if (!this.cache.has('spells')) {
            const spells = await this.loadData('spells.json');
            this.cache.set('spells', spells || this.getDefaultSpells());
        }
        return this.cache.get('spells');
    }
    
    // Generic data loader
    async loadData(filename) {
        try {
            const response = await fetch(this.dataPath + filename);
            if (!response.ok) {
                console.warn(`Failed to load ${filename}, using defaults`);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return null;
        }
    }
    
    // Get specific race data
    getRace(raceName) {
        const races = this.cache.get('races');
        return races ? races[raceName] : null;
    }
    
    // Get specific class data
    getClass(className) {
        const classes = this.cache.get('classes');
        return classes ? classes[className] : null;
    }
    
    // Get class features for a specific level
    getClassFeatures(className, level) {
        const classData = this.getClass(className);
        if (!classData) return [];
        
        return classData.features.filter(f => f.level <= level);
    }
    
    // Calculate proficiency bonus
    getProficiencyBonus(level) {
        return Math.ceil(level / 4) + 1;
    }
    
    // Calculate ability modifier
    getAbilityModifier(score) {
        return Math.floor((score - 10) / 2);
    }
    
    // Default data (fallback when JSON files aren't available)
    getDefaultRaces() {
        return {
            "human": {
                "name": "Human",
                "size": "Medium",
                "speed": 30,
                "traits": ["Extra Language", "Extra Skill"],
                "abilityScoreIncrease": {
                    "all": 1
                },
                "languages": ["Common"],
                "subraces": {}
            },
            "elf": {
                "name": "Elf",
                "size": "Medium",
                "speed": 30,
                "traits": ["Darkvision", "Keen Senses", "Fey Ancestry", "Trance"],
                "abilityScoreIncrease": {
                    "dexterity": 2
                },
                "languages": ["Common", "Elvish"],
                "subraces": {
                    "high": {
                        "name": "High Elf",
                        "abilityScoreIncrease": {
                            "intelligence": 1
                        },
                        "traits": ["Cantrip"]
                    }
                }
            },
            "dwarf": {
                "name": "Dwarf",
                "size": "Medium",
                "speed": 25,
                "traits": ["Darkvision", "Dwarven Resilience", "Dwarven Combat Training", "Stonecunning"],
                "abilityScoreIncrease": {
                    "constitution": 2
                },
                "languages": ["Common", "Dwarvish"],
                "subraces": {
                    "mountain": {
                        "name": "Mountain Dwarf",
                        "abilityScoreIncrease": {
                            "strength": 2
                        },
                        "traits": ["Dwarven Armor Training"]
                    }
                }
            },
            "halfling": {
                "name": "Halfling",
                "size": "Small",
                "speed": 25,
                "traits": ["Lucky", "Brave", "Halfling Nimbleness"],
                "abilityScoreIncrease": {
                    "dexterity": 2
                },
                "languages": ["Common", "Halfling"],
                "subraces": {
                    "lightfoot": {
                        "name": "Lightfoot",
                        "abilityScoreIncrease": {
                            "charisma": 1
                        },
                        "traits": ["Naturally Stealthy"]
                    }
                }
            }
        };
    }
    
    getDefaultClasses() {
        return {
            "fighter": {
                "name": "Fighter",
                "hitDice": 10,
                "primaryAbility": "Strength or Dexterity",
                "savingThrows": ["Strength", "Constitution"],
                "skillChoices": 2,
                "skillOptions": ["Acrobatics", "Animal Handling", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"],
                "features": [
                    {"level": 1, "name": "Fighting Style"},
                    {"level": 1, "name": "Second Wind"},
                    {"level": 2, "name": "Action Surge"},
                    {"level": 3, "name": "Martial Archetype"}
                ],
                "subclasses": ["Champion", "Battle Master", "Eldritch Knight"]
            },
            "wizard": {
                "name": "Wizard",
                "hitDice": 6,
                "primaryAbility": "Intelligence",
                "savingThrows": ["Intelligence", "Wisdom"],
                "skillChoices": 2,
                "skillOptions": ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"],
                "features": [
                    {"level": 1, "name": "Spellcasting"},
                    {"level": 1, "name": "Arcane Recovery"},
                    {"level": 2, "name": "Arcane Tradition"}
                ],
                "subclasses": ["School of Evocation", "School of Abjuration", "School of Divination"],
                "spellcaster": true,
                "spellcastingAbility": "Intelligence"
            },
            "rogue": {
                "name": "Rogue",
                "hitDice": 8,
                "primaryAbility": "Dexterity",
                "savingThrows": ["Dexterity", "Intelligence"],
                "skillChoices": 4,
                "skillOptions": ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight of Hand", "Stealth"],
                "features": [
                    {"level": 1, "name": "Expertise"},
                    {"level": 1, "name": "Sneak Attack"},
                    {"level": 1, "name": "Thieves' Cant"},
                    {"level": 2, "name": "Cunning Action"}
                ],
                "subclasses": ["Thief", "Assassin", "Arcane Trickster"]
            },
            "cleric": {
                "name": "Cleric",
                "hitDice": 8,
                "primaryAbility": "Wisdom",
                "savingThrows": ["Wisdom", "Charisma"],
                "skillChoices": 2,
                "skillOptions": ["History", "Insight", "Medicine", "Persuasion", "Religion"],
                "features": [
                    {"level": 1, "name": "Spellcasting"},
                    {"level": 1, "name": "Divine Domain"}
                ],
                "subclasses": ["Life Domain", "Light Domain", "War Domain"],
                "spellcaster": true,
                "spellcastingAbility": "Wisdom"
            }
        };
    }
    
    getDefaultBackgrounds() {
        return {
            "acolyte": {
                "name": "Acolyte",
                "skillProficiencies": ["Insight", "Religion"],
                "languages": 2,
                "equipment": ["Holy symbol", "Prayer book", "5 sticks of incense", "Vestments", "Common clothes", "Belt pouch with 15 gp"],
                "feature": "Shelter of the Faithful"
            },
            "criminal": {
                "name": "Criminal",
                "skillProficiencies": ["Deception", "Stealth"],
                "toolProficiencies": ["Thieves' tools", "Gaming set"],
                "equipment": ["Crowbar", "Dark common clothes with hood", "Belt pouch with 15 gp"],
                "feature": "Criminal Contact"
            },
            "folk-hero": {
                "name": "Folk Hero",
                "skillProficiencies": ["Animal Handling", "Survival"],
                "toolProficiencies": ["One type of artisan's tools", "Vehicles (land)"],
                "equipment": ["Artisan's tools", "Shovel", "Iron pot", "Common clothes", "Belt pouch with 10 gp"],
                "feature": "Rustic Hospitality"
            },
            "noble": {
                "name": "Noble",
                "skillProficiencies": ["History", "Persuasion"],
                "toolProficiencies": ["Gaming set"],
                "languages": 1,
                "equipment": ["Fine clothes", "Signet ring", "Scroll of pedigree", "Purse with 25 gp"],
                "feature": "Position of Privilege"
            },
            "sage": {
                "name": "Sage",
                "skillProficiencies": ["Arcana", "History"],
                "languages": 2,
                "equipment": ["Bottle of black ink", "Quill", "Small knife", "Letter from colleague", "Common clothes", "Belt pouch with 10 gp"],
                "feature": "Researcher"
            },
            "soldier": {
                "name": "Soldier",
                "skillProficiencies": ["Athletics", "Intimidation"],
                "toolProficiencies": ["Gaming set", "Vehicles (land)"],
                "equipment": ["Insignia of rank", "Trophy", "Deck of cards", "Common clothes", "Belt pouch with 10 gp"],
                "feature": "Military Rank"
            }
        };
    }
    
    getDefaultSkills() {
        return {
            "acrobatics": { "name": "Acrobatics", "ability": "dexterity" },
            "animalHandling": { "name": "Animal Handling", "ability": "wisdom" },
            "arcana": { "name": "Arcana", "ability": "intelligence" },
            "athletics": { "name": "Athletics", "ability": "strength" },
            "deception": { "name": "Deception", "ability": "charisma" },
            "history": { "name": "History", "ability": "intelligence" },
            "insight": { "name": "Insight", "ability": "wisdom" },
            "intimidation": { "name": "Intimidation", "ability": "charisma" },
            "investigation": { "name": "Investigation", "ability": "intelligence" },
            "medicine": { "name": "Medicine", "ability": "wisdom" },
            "nature": { "name": "Nature", "ability": "intelligence" },
            "perception": { "name": "Perception", "ability": "wisdom" },
            "performance": { "name": "Performance", "ability": "charisma" },
            "persuasion": { "name": "Persuasion", "ability": "charisma" },
            "religion": { "name": "Religion", "ability": "intelligence" },
            "sleightOfHand": { "name": "Sleight of Hand", "ability": "dexterity" },
            "stealth": { "name": "Stealth", "ability": "dexterity" },
            "survival": { "name": "Survival", "ability": "wisdom" }
        };
    }
    
    getDefaultEquipment() {
        return {
            "weapons": {
                "simple": ["Club", "Dagger", "Greatclub", "Handaxe", "Javelin", "Light hammer", "Mace", "Quarterstaff", "Sickle", "Spear"],
                "martial": ["Battleaxe", "Flail", "Glaive", "Greataxe", "Greatsword", "Halberd", "Lance", "Longsword", "Maul", "Morningstar", "Pike", "Rapier", "Scimitar", "Shortsword", "Trident", "War pick", "Warhammer", "Whip"]
            },
            "armor": {
                "light": ["Padded", "Leather", "Studded leather"],
                "medium": ["Hide", "Chain shirt", "Scale mail", "Breastplate", "Half plate"],
                "heavy": ["Ring mail", "Chain mail", "Splint", "Plate"]
            },
            "gear": ["Backpack", "Bedroll", "Mess kit", "Tinderbox", "Torch", "Rations", "Waterskin", "Rope"]
        };
    }
    
    getDefaultSpells() {
        return {
            "cantrips": [],
            "level1": [],
            "level2": [],
            "level3": [],
            "level4": [],
            "level5": [],
            "level6": [],
            "level7": [],
            "level8": [],
            "level9": []
        };
    }
}
