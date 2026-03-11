/* ============================================
   INPUT HANDLER — Keyboard + Gamepad
   ============================================ */

class InputManager {
    constructor() {
        this.keys = {};
        this.prevKeys = {};
        this.gamepads = [null, null];
        this.frameIndex = 0;
        this.doubleTapWindow = 10;
        this.lastDirectionalTap = {
            left: -999,
            right: -999,
        };

        // Solo controls only: arrows + QSDEG + Shift for dash.
        this.playerMap = {
            up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
            block: 'q',
            light: 's',
            heavy: 'd',
            special: 'f',
            projectile: 'e',
            transform: 'g',
            dash: 'Shift',
        };

        // Input buffer: stores recent button presses for 6 frames
        // so attacks chain smoothly even if pressed slightly early.
        this._inputBuffer = [];
        this._bufferWindow = 6;

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onBlur = this._onBlur.bind(this);

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        window.addEventListener('blur', this._onBlur);
    }

    _normalizeKey(key) {
        if (typeof key !== 'string' || !key.length) return key;
        // Keep non-character keys intact (ArrowUp, Escape, Shift...), normalize characters for stable matching.
        return key.length === 1 ? key.toLowerCase() : key;
    }

    _onKeyDown(e) {
        const key = this._normalizeKey(e.key);
        if (!this.keys[key]) {
            // New press — add to input buffer
            this._inputBuffer.push({ key, frame: this.frameIndex });
        }
        this.keys[key] = true;
        // Prevent scrolling with arrow keys and space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
            e.preventDefault();
        }
    }

    _onKeyUp(e) {
        const key = this._normalizeKey(e.key);
        this.keys[key] = false;
    }

    _onBlur() {
        // Avoid sticky inputs after alt-tab/window focus loss.
        this.keys = {};
        this.prevKeys = {};
        this._inputBuffer = [];
        this.lastDirectionalTap.left = -999;
        this.lastDirectionalTap.right = -999;
    }

    // Check if a key is currently held
    isDown(key) {
        const normalized = this._normalizeKey(key);
        return !!this.keys[normalized];
    }

    // Check if a key was just pressed this frame
    justPressed(key) {
        const normalized = this._normalizeKey(key);
        return !!this.keys[normalized] && !this.prevKeys[normalized];
    }

    // Check if a key was pressed within the buffer window (for chaining attacks)
    bufferedPress(key) {
        const normalized = this._normalizeKey(key);
        // First check normal justPressed
        if (this.justPressed(normalized)) return true;
        // Then check buffer
        const cutoff = this.frameIndex - this._bufferWindow;
        return this._inputBuffer.some(
            (entry) => entry.key === normalized && entry.frame >= cutoff && entry.frame < this.frameIndex
        );
    }

    _consumeDirectionalDash(leftPressed, rightPressed) {
        let dash = false;

        if (leftPressed) {
            dash = (this.frameIndex - this.lastDirectionalTap.left) <= this.doubleTapWindow;
            this.lastDirectionalTap.left = this.frameIndex;
        }

        if (rightPressed) {
            dash = dash || ((this.frameIndex - this.lastDirectionalTap.right) <= this.doubleTapWindow);
            this.lastDirectionalTap.right = this.frameIndex;
        }

        return dash;
    }

    // Get normalized input for the local player.
    getPlayerInput(_player = 1) {
        const map = this.playerMap;
        const leftPressed = this.justPressed(map.left);
        const rightPressed = this.justPressed(map.right);
        const doubleTapDash = this._consumeDirectionalDash(leftPressed, rightPressed);

        // Dash = Shift key OR double-tap direction
        const dashPressed = this.isDown(map.dash) || doubleTapDash;

        const input = {
            up: this.isDown(map.up),
            down: this.isDown(map.down),
            left: this.isDown(map.left),
            right: this.isDown(map.right),
            light: this.bufferedPress(map.light),
            heavy: this.bufferedPress(map.heavy),
            special: this.bufferedPress(map.special),
            projectile: this.bufferedPress(map.projectile),
            transform: this.justPressed(map.transform),
            block: this.isDown(map.block),
            dash: dashPressed,
        };

        return input;
    }

    // Call at end of frame to track "just pressed"
    endFrame() {
        this.frameIndex += 1;
        this.prevKeys = { ...this.keys };
        // Prune old buffer entries
        const cutoff = this.frameIndex - this._bufferWindow;
        this._inputBuffer = this._inputBuffer.filter((entry) => entry.frame >= cutoff);
    }

    // Check if any key was just pressed (for menus)
    anyKeyJustPressed() {
        for (const key in this.keys) {
            if (this.keys[key] && !this.prevKeys[key]) return key;
        }
        return null;
    }
}
