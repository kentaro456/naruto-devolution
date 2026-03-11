class TeenKakashiFighter extends Fighter {
    constructor(config) {
        super(config);
        
        // Character-specific offsets
        this.baseConfig = {
            hitboxWidth: 26,
            hitboxHeight: 48,
            bodyOffset: { x: 0, y: 0 },
            projectileOffset: { x: 20, y: -20 },
        };
        
        Object.assign(this, this.baseConfig);
        
        this.specialName = 'Chidori';
    }

    _defineAnimations() {
        super._defineAnimations();
        
        // Add character-specific animation tweaks here
        if (this.animData.SPECIAL) {
            this.animData.SPECIAL.frameDuration = 5;
            this.animData.SPECIAL.loop = false;
        }
    }
}

if (typeof window !== 'undefined') {
    window.TeenKakashiFighter = TeenKakashiFighter;
}
