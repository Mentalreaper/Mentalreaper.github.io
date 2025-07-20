// Wizard Manager Component
export class WizardManager {
    constructor(app) {
        this.app = app;
        this.currentStep = 1;
        this.totalSteps = 5;
    }
    
    reset() {
        this.currentStep = 1;
        this.updateStepDisplay();
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            // Validate current step before proceeding
            if (this.validateCurrentStep()) {
                this.currentStep++;
                this.updateStepDisplay();
            } else {
                alert('Please fill in all required fields before proceeding.');
            }
        } else {
            // Final step - save character
            this.app.saveCurrentCharacter();
        }
    }
    
    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }
    
    goToStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
            // Only go to step if all previous steps are valid
            let canNavigate = true;
            for (let i = 1; i < stepNumber; i++) {
                if (!this.validateStep(i)) {
                    canNavigate = false;
                    break;
                }
            }
            
            if (canNavigate) {
                this.currentStep = stepNumber;
                this.updateStepDisplay();
            } else {
                alert('Please complete the previous steps first.');
            }
        }
    }
    
    updateStepDisplay() {
        // Update step indicators
        document.querySelectorAll('.wizard-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === this.currentStep);
            step.classList.toggle('completed', stepNum < this.currentStep);
        });
        
        // Update panels
        document.querySelectorAll('.wizard-panel').forEach(panel => {
            const panelNum = parseInt(panel.dataset.panel);
            panel.classList.toggle('active', panelNum === this.currentStep);
        });
        
        // Update navigation buttons
        const prevBtn = document.getElementById('wizard-prev');
        const nextBtn = document.getElementById('wizard-next');
        
        prevBtn.disabled = this.currentStep === 1;
        
        // Change next button text on last step
        if (this.currentStep === this.totalSteps) {
            nextBtn.textContent = 'Save Character';
            nextBtn.classList.add('save-character');
        } else {
            nextBtn.textContent = 'Next';
            nextBtn.classList.remove('save-character');
        }
    }
    
    validateCurrentStep() {
        return this.validateStep(this.currentStep);
    }
    
    validateStep(stepNumber) {
        switch (stepNumber) {
            case 1: // Basic Info
                return this.validateBasicInfo();
            case 2: // Ability Scores
                return this.validateAbilityScores();
            case 3: // Skills
                return true; // Skills are optional
            case 4: // Equipment
                return true; // Equipment is optional
            case 5: // Details
                return true; // Details are optional
            default:
                return true;
        }
    }
    
    validateBasicInfo() {
        const name = document.getElementById('character-name').value.trim();
        const race = document.getElementById('character-race').value;
        const cls = document.getElementById('character-class').value;
        const level = document.getElementById('character-level').value;
        const background = document.getElementById('character-background').value;
        
        return name && race && cls && level && background;
    }
    
    validateAbilityScores() {
        const method = document.querySelector('input[name="ability-method"]:checked').value;
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        
        if (method === 'standard-array') {
            // Check that all abilities have been assigned
            const assignedValues = new Set();
            for (const ability of abilities) {
                const select = document.getElementById(`ability-${ability}`);
                if (!select || !select.value) return false;
                assignedValues.add(select.value);
            }
            // Make sure all 6 values are unique
            return assignedValues.size === 6;
        } else {
            // For point buy and manual, just check that all have values
            for (const ability of abilities) {
                const input = document.getElementById(`ability-${ability}`);
                if (!input || !input.value) return false;
                
                const value = parseInt(input.value);
                if (method === 'point-buy') {
                    if (value < 8 || value > 15) return false;
                } else { // manual
                    if (value < 3 || value > 18) return false;
                }
            }
            
            // For point buy, also validate total points
            if (method === 'point-buy') {
                return this.validatePointBuyTotal();
            }
        }
        
        return true;
    }
    
    validatePointBuyTotal() {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        let totalCost = 0;
        
        const costs = {
            8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
        };
        
        for (const ability of abilities) {
            const input = document.getElementById(`ability-${ability}`);
            const value = parseInt(input.value) || 10;
            totalCost += costs[value] || 0;
        }
        
        // Update points remaining display
        const remainingSpan = document.getElementById('points-remaining');
        if (remainingSpan) {
            remainingSpan.textContent = 27 - totalCost;
            remainingSpan.style.color = totalCost > 27 ? 'red' : '';
        }
        
        return totalCost <= 27;
    }
}
