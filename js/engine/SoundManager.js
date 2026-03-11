/* ============================================
   SOUND MANAGER — Lightweight global SFX player
   ============================================ */

window.SoundManager = (function createSoundManager() {
    const cache = new Map();
    const volumeById = {
        kakashi_teleport: 0.95,
        kakashi_handsign: 0.9,
        kakashi_swish: 0.86,
        kakashi_kunai_throw: 0.9,
        kakashi_kunai_explosion: 0.95,
        kakashi_kamui: 0.9,
        kakashi_tsukuyomi: 0.9,
        kakashi_tsukuyomi_alt1: 0.82,
        kakashi_tsukuyomi_alt2: 0.82,
        kakashi_amaterasu: 0.92,
        kakashi_sharingan: 0.8,
        kakashi_sample1: 0.72,
        kakashi_sample4: 0.72,
        fight: 0.85,
        ko: 0.9,
        block: 0.72,
        projectile_hit: 0.8,
        projectile_clash: 0.78,
        hit_light: 0.74,
        hit_heavy: 0.82,
        round_start: 0.72,
        time_up: 0.78,
        perfect: 0.82,
        victory: 0.75,
        dramatic_finish: 0.9,
        timer_tick: 0.55,
        perfect_block: 0.78,
        clash: 0.86,
        wall_bounce: 0.8,
        ground_bounce: 0.76,
        combo_milestone: 0.78,
        land: 0.55,
        sb3_pop: 0.75,
        sb3_meow: 0.8,
        bgm_main_theme: 0.4,
        bgm_battle: 0.3,
        bgm_select: 0.4,
        bgm_nvs_need_to_be_strong: 0.3,
        bgm_nvs_battle: 0.3,
        bgm_nvs_kokuten: 0.3,
        bgm_nvs_nankou_furaku: 0.3,
        bgm_nvs_swirling_hot_air: 0.3,
        bgm_nng_madlibs: 0.26,
    };

    const soundMap = {
        kakashi_teleport: 'assets/organized/shared/sb3/kakashi_new/kakashi__snd_teleporting.wav',
        kakashi_handsign: 'assets/organized/shared/sb3/kakashi_new/kakashi__snd_hand_sign.wav',
        kakashi_swish: 'assets/organized/shared/sb3/kakashi_new/kakashi__snd_swish_effect.wav',
        kakashi_kunai_throw: 'assets/organized/shared/sb3/kakashi_new/kunai__snd_kunai_effect.wav',
        kakashi_kunai_explosion: 'assets/organized/shared/sb3/kakashi_new/kunai__snd_explosion_effect.wav',
        kakashi_kamui: 'assets/organized/shared/sb3/kakashi_new/kamui__snd_effects.wav',
        kakashi_tsukuyomi: 'assets/organized/shared/sb3/kakashi_new/tsukuyomi__snd_effects.wav',
        kakashi_tsukuyomi_alt1: 'assets/organized/shared/sb3/kakashi_new/tsukuyomi__snd_effects1.wav',
        kakashi_tsukuyomi_alt2: 'assets/organized/shared/sb3/kakashi_new/tsukuyomi__snd_effects2.wav',
        kakashi_amaterasu: 'assets/organized/shared/sb3/kakashi_new/amaterasu__snd_amaterasu_effect.wav',
        kakashi_sharingan: 'assets/organized/shared/sb3/kakashi_new/kakashi__snd_sharingan.wav',
        kakashi_sample1: 'assets/organized/shared/sb3/kakashi_new/kakashi__snd_sample1.wav',
        kakashi_sample4: 'assets/organized/shared/sb3/kakashi_new/kakashi__snd_sample4.wav',
        block: 'assets/organized/shared/sb3/kakashi_new/kakashi__snd_combo_effect.wav',
        projectile_hit: 'assets/organized/shared/sb3/kakashi_new/kunai__snd_kunai_effect.wav',
        projectile_clash: 'assets/organized/shared/sb3/kakashi_new/kunai__snd_explosion_effect.wav',
        hit_light: 'assets/organized/shared/sb3/kakashi_new/kakashi__snd_combo_effect.wav',
        hit_heavy: 'assets/organized/shared/sb3/kakashi_new/kakashi__snd_combo_effect.wav',
        round_start: 'assets/organized/shared/sb3/stage__sound_001__pop.wav',
        time_up: 'assets/organized/shared/sb3_fullpack/stage_bg__snd_saltar.wav',
        perfect: 'assets/organized/shared/sb3_fullpack/itachiai__snd_seal_effect.wav',
        victory: 'assets/organized/shared/sb3_fullpack/stage_bg__snd_select.wav',
        dramatic_finish: 'assets/organized/shared/sb3_fullpack/sasuke__snd_lightning.wav',
        timer_tick: 'assets/organized/shared/sb3/stage__sound_001__pop.wav',
        perfect_block: 'assets/organized/shared/sb3_fullpack/sasuke__snd_lightning.wav',
        clash: 'assets/organized/shared/sb3_fullpack/naruto__snd_rasengan.wav',
        wall_bounce: 'assets/organized/shared/sb3_fullpack/itachi__snd_knockback.wav',
        ground_bounce: 'assets/organized/shared/sb3_fullpack/itachi__snd_up_hurt.wav',
        combo_milestone: 'assets/organized/shared/sb3_fullpack/naruto__snd_combo_effect.wav',
        land: 'assets/organized/shared/sb3_fullpack/naruto__snd_kick_effect.wav',
        ko: 'assets/organized/shared/sb3_fullpack/itachi__snd_hurt.wav',
        fight: 'assets/organized/shared/sb3/stage__sound_001__pop.wav',
        sb3_pop: 'assets/organized/shared/sb3/kakashi_new/stage_bg__snd_pop.wav',
        sb3_meow: 'assets/organized/shared/sb3/kakashi_new/kakashi__snd_sample2.wav',
        bgm_main_theme: 'assets/organized/shared/sb3_fullpack/stage_bg__snd_naruto_main_theme.wav',
        bgm_battle: 'assets/organized/shared/sb3_fullpack/stage_bg__snd_battlesoundtrack.wav',
        bgm_select: 'assets/organized/shared/sb3_fullpack/stage_bg__snd_select.wav',
        bgm_nvs_need_to_be_strong: 'assets/organized/shared/sb3_nvs/stage__snd_need_to_be_strong.wav',
        bgm_nvs_battle: 'assets/organized/shared/sb3_nvs/stage__snd_battle.wav',
        bgm_nvs_kokuten: 'assets/organized/shared/sb3_nvs/stage__snd_kokuten.mp3',
        bgm_nvs_nankou_furaku: 'assets/organized/shared/sb3_nvs/stage__snd_nankou_furaku.mp3',
        bgm_nvs_swirling_hot_air: 'assets/organized/shared/sb3_nvs/stage__snd_swirling_hot_air.mp3',
        bgm_nng_madlibs: 'assets/organized/shared/sb3_nng/stage__snd_madlibs.wav',
    };

    const PACK_SOUND_MANIFEST = 'assets/organized/shared/sb3_fullpack/project.json';
    const PACK_SOUND_BASE = 'assets/organized/shared/sb3_fullpack';
    const packSoundIds = [];
    let packSoundCursor = 0;

    let currentBgm = null;
    let currentBgmId = null;
    let muted = false;
    const activeSfx = new Set();
    const lastPlayedAtById = new Map();
    let lastGlobalSfxAt = 0;
    const sfxPolicy = {
        maxSimultaneous: 8,
        globalMinIntervalMs: 12,
    };
    const sfxCooldownById = {
        timer_tick: 180,
        land: 60,
        block: 40,
        hit_light: 24,
        hit_heavy: 36,
        projectile_hit: 30,
        projectile_clash: 60,
        combo_milestone: 160,
        wall_bounce: 110,
        ground_bounce: 110,
    };
    const musicIdRegex = /^bgm_/i;
    const packMusicNameRegex = /(bgm|theme|music|soundtrack|opening|ending|ost|menu|battle)/i;
    const maxPackSfxSeconds = 6;

    function load(path) {
        if (!path) return null;
        if (cache.has(path)) return cache.get(path);
        const a = new Audio(path);
        a.preload = 'auto';
        cache.set(path, a);
        return a;
    }

    function canPlaySfx(id, now) {
        if (activeSfx.size >= sfxPolicy.maxSimultaneous) return false;
        if ((now - lastGlobalSfxAt) < sfxPolicy.globalMinIntervalMs) return false;
        const perIdCooldown = sfxCooldownById[id] ?? 0;
        const lastById = lastPlayedAtById.get(id) ?? -Infinity;
        return (now - lastById) >= perIdCooldown;
    }

    function trackSfx(audio) {
        activeSfx.add(audio);
        const cleanup = () => activeSfx.delete(audio);
        audio.addEventListener('ended', cleanup, { once: true });
        audio.addEventListener('error', cleanup, { once: true });
    }

    function isBgmId(id) {
        return typeof id === 'string' && musicIdRegex.test(id);
    }

    function stopAllSfx() {
        Array.from(activeSfx).forEach((audio) => {
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch (e) {
                // ignore cleanup failures
            }
            activeSfx.delete(audio);
        });
    }

    function play(id, volume = 1) {
        if (muted) return;
        if (isBgmId(id)) {
            playBgm(id, volume);
            return;
        }
        if (id === 'ns_pack_next') {
            if (!packSoundIds.length) return;
            const nextId = packSoundIds[packSoundCursor % packSoundIds.length];
            packSoundCursor += 1;
            return play(nextId, volume);
        }
        const path = soundMap[id];
        if (!path) return;
        const now = performance.now();
        if (!canPlaySfx(id, now)) return;
        const base = load(path);
        if (!base) return;
        const audio = base.cloneNode();
        trackSfx(audio);
        lastGlobalSfxAt = now;
        lastPlayedAtById.set(id, now);
        const gv = volumeById[id] ?? 1.0;
        audio.volume = Math.max(0, Math.min(1, gv * (Number(volume) || 1)));
        audio.play().catch(() => {
            activeSfx.delete(audio);
        });
    }

    function playBgm(id, volume = 1) {
        if (muted) return;
        if (currentBgmId === id && currentBgm) return; // Already playing

        stopBgm();

        const path = soundMap[id];
        if (!path) return;

        const audio = new Audio(path);
        audio.loop = true;
        const gv = volumeById[id] ?? 1.0;
        audio.volume = Math.max(0, Math.min(1, gv * (Number(volume) || 1)));
        audio.play().catch(() => { });

        currentBgm = audio;
        currentBgmId = id;
    }

    function setMuted(nextMuted = true) {
        muted = !!nextMuted;
        if (muted) {
            stopBgm();
            stopAllSfx();
        }
        return muted;
    }

    function stopBgm() {
        if (currentBgm) {
            currentBgm.pause();
            currentBgm.currentTime = 0;
            currentBgm = null;
            currentBgmId = null;
        }
    }

    async function registerNarutoSpritesPackSounds() {
        try {
            const response = await fetch(PACK_SOUND_MANIFEST);
            if (!response.ok) return;
            const project = await response.json();
            const unique = new Set();

            const shouldIncludePackSound = (sound) => {
                const md5ext = typeof sound?.md5ext === 'string' ? sound.md5ext.trim() : '';
                if (!md5ext) return false;

                const name = String(sound?.name || '').trim();
                if (name && packMusicNameRegex.test(name)) return false;

                const rate = Number(sound?.rate);
                const sampleCount = Number(sound?.sampleCount);
                if (Number.isFinite(rate) && rate > 0 && Number.isFinite(sampleCount) && sampleCount > 0) {
                    const durationSec = sampleCount / rate;
                    if (durationSec > maxPackSfxSeconds) return false;
                }
                return true;
            };

            (project.targets || []).forEach((target) => {
                (target.sounds || []).forEach((sound) => {
                    if (!shouldIncludePackSound(sound)) return;
                    unique.add(sound.md5ext.trim());
                });
            });

            let index = 1;
            unique.forEach((md5ext) => {
                const id = `ns_pack_${String(index).padStart(3, '0')}`;
                if (!soundMap[id]) {
                    soundMap[id] = `${PACK_SOUND_BASE}/${md5ext}`;
                    volumeById[id] = 0.8;
                    packSoundIds.push(id);
                    index += 1;
                }
            });
        } catch (e) {
            // silent: pack sounds are optional enrichment
        }
    }

    registerNarutoSpritesPackSounds();

    return {
        play,
        playBgm,
        stopBgm,
        setMuted,
        isMuted: () => muted,
        setSfxPolicy: (next = {}) => {
            if (Number.isFinite(next.maxSimultaneous)) {
                sfxPolicy.maxSimultaneous = Math.max(1, Math.floor(next.maxSimultaneous));
            }
            if (Number.isFinite(next.globalMinIntervalMs)) {
                sfxPolicy.globalMinIntervalMs = Math.max(0, Math.floor(next.globalMinIntervalMs));
            }
        },
        getSfxStats: () => ({
            activeCount: activeSfx.size,
            maxSimultaneous: sfxPolicy.maxSimultaneous,
            globalMinIntervalMs: sfxPolicy.globalMinIntervalMs,
        }),
        getPackSoundCount: () => packSoundIds.length,
    };
})();
