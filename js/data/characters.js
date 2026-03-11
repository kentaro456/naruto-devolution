/* ============================================
   CHARACTER DATA — Full roster from SB3 pack
   ============================================ */

const SB3_SPRITE_MANIFEST = 'assets/organized/shared/sb3/project.json';
const SB3_ASSETS_BASE = 'assets/organized/shared/sb3';
const SB3_MAPPINGS_BASE = 'assets/organized/shared/sb3/mappings';
const SB3_FULLPACK_MANIFEST = 'assets/organized/shared/sb3_fullpack/project.json';
const SB3_FULLPACK_ASSETS_BASE = 'assets/organized/shared/sb3_fullpack';
const MASTER_WHOLE_LOT_MANIFEST = 'assets/organized/shared/sb3_fullpack/project.json';
const MASTER_WHOLE_LOT_ASSETS_BASE = 'assets/organized/shared/sb3_fullpack';
const NARUTO_EXTENDED_PLAN = [
    ['IDLE', 4, 14],
    ['WALK', 4, 10],
    ['JUMP', 2, 12],
    ['ATTACK_LIGHT_1', 5, 6],
    ['ATTACK_LIGHT_2', 5, 6],
    ['ATTACK_LIGHT_3', 5, 6],
    ['ATTACK_HEAVY_1', 6, 7],
    ['ATTACK_HEAVY_2', 6, 7],
    ['SPECIAL_TRANSFORM', 6, 8],
    ['SPECIAL', 8, 8],
    ['BLOCK', 1, 14],
    ['HIT', 2, 8],
    ['KO', 3, 12],
];
const SASUKE_EXTENDED_PLAN = [
    ['IDLE', 4, 14],
    ['WALK', 4, 10],
    ['JUMP', 2, 12],
    ['ATTACK_LIGHT_1', 5, 6],
    ['ATTACK_LIGHT_2', 5, 6],
    ['ATTACK_LIGHT_3', 5, 6],
    ['ATTACK_HEAVY_1', 6, 7],
    ['ATTACK_HEAVY_2', 6, 7],
    ['SPECIAL_TRANSFORM', 8, 8],
    ['SPECIAL', 5, 9],
    ['BLOCK', 1, 14],
    ['HIT', 2, 8],
    ['KO', 3, 12],
];
const LEE_EXTENDED_PLAN = [
    ['IDLE', 4, 14],
    ['WALK', 6, 9],
    ['JUMP', 2, 10],
    ['ATTACK_LIGHT_1', 8, 6],
    ['ATTACK_LIGHT_2', 5, 6],
    ['ATTACK_LIGHT_3', 4, 6],
    ['ATTACK_HEAVY_1', 5, 6],
    ['ATTACK_HEAVY_2', 7, 6],
    ['SPECIAL_TRANSFORM', 3, 8],
    ['SPECIAL', 7, 6],
    ['BLOCK', 4, 10],
    ['HIT', 4, 8],
    ['KO', 10, 9],
    // Legacy states kept for compatibility helpers.
    ['ATTACK_LIGHT', 3, 7],
    ['ATTACK_HEAVY', 4, 8],
];
const SAKURA_EXTENDED_PLAN = [
    ['IDLE', 4, 14],
    ['WALK', 4, 10],
    ['JUMP', 4, 12],
    ['ATTACK_LIGHT_1', 4, 6],
    ['ATTACK_LIGHT_2', 4, 6],
    ['ATTACK_LIGHT_3', 3, 6],
    ['ATTACK_HEAVY_1', 2, 7],
    ['ATTACK_HEAVY_2', 2, 7],
    ['SPECIAL_TRANSFORM', 6, 8],
    ['SPECIAL', 3, 8],
    ['BLOCK', 1, 14],
    ['HIT', 2, 8],
    ['KO', 3, 12],
];
const KAKASHI_EXTENDED_PLAN = [
    ['IDLE', 6, 12],
    ['WALK', 6, 10],
    ['RUN', 6, 8],
    ['CROUCH', 2, 12],
    ['CROUCH_WALK', 6, 10],
    ['CROUCH_ATTACK', 5, 7],
    ['CROUCH_THROW', 4, 7],
    ['JUMP', 4, 10],
    ['TELEPORT', 3, 7],
    ['DASH', 3, 8],
    ['RUN_ATTACK', 6, 6],
    ['THROW', 3, 7],
    ['KOMA_SUPPORT', 3, 7],
    ['ATTACK_LIGHT_1', 4, 6],
    ['ATTACK_LIGHT_2', 4, 6],
    ['ATTACK_LIGHT_3', 5, 8],
    ['ATTACK_HEAVY_1', 3, 6],
    ['ATTACK_HEAVY_2', 2, 6],
    ['CHIDORI_LONG', 26, 5],
    ['SPECIAL', 38, 5],
    ['KAMUI', 20, 6],
    ['TSUKUYOMI', 20, 6],
    ['AMATERASU', 20, 6],
    ['BLOCK', 1, 14],
    ['HIT', 1, 8],
    ['KO', 1, 12],
    ['EFFECT_KUNAI', 1, 10],
    ['EFFECT_SHURIKEN', 1, 6],
    ['EFFECT_KAMUI', 10, 4],
    ['EFFECT_TSUKUYOMI', 4, 6],
    ['EFFECT_AMATERASU', 11, 4],
];

function sb3SpriteConfig(targetName, mappingSlug = null, plan = null, cellSize = null) {
    const slug = (mappingSlug || targetName).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const cfg = {
        mode: 'sb3-target-mapped',
        targetName,
        assetsBasePath: SB3_ASSETS_BASE,
        mappingPath: `${SB3_MAPPINGS_BASE}/${slug}.json`,
    };
    if (cellSize !== null) cfg.cellSize = cellSize;
    if (plan) cfg.plan = plan;
    return cfg;
}

function sb3FullpackSpriteConfig(targetName, plan = null, cellSize = null) {
    const cfg = {
        mode: 'sb3-target',
        targetName,
        assetsBasePath: SB3_FULLPACK_ASSETS_BASE,
    };
    if (cellSize !== null) cfg.cellSize = cellSize;
    if (plan) cfg.plan = plan;
    return cfg;
}

function sb3FullpackMappedSpriteConfig(targetName, mappingSlug, plan = null, cellSize = null) {
    const cfg = {
        mode: 'sb3-target-mapped',
        targetName,
        assetsBasePath: SB3_FULLPACK_ASSETS_BASE,
        mappingPath: `assets/organized/shared/sb3_fullpack/mappings/${mappingSlug}.json`,
    };
    if (cellSize !== null) cfg.cellSize = cellSize;
    if (plan) cfg.plan = plan;
    return cfg;
}

function wholeLotMappedSpriteConfig(targetName, mappingSlug, plan = null, cellSize = null) {
  const cfg = {
    mode: 'sb3-target-mapped',
    targetName,
    assetsBasePath: SB3_FULLPACK_ASSETS_BASE,
    mappingPath: `assets/organized/shared/sb3_fullpack/mappings/${mappingSlug}.json`,
  };
  if (cellSize !== null) cfg.cellSize = cellSize;
    if (plan) cfg.plan = plan;
    return cfg;
}

function superMappedSpriteConfig(targetName, mappingSlug, plan = null, cellSize = null) {
  const cfg = {
    mode: 'sb3-target-mapped',
    targetName,
    assetsBasePath: SB3_FULLPACK_ASSETS_BASE,
    mappingPath: `assets/organized/shared/sb3_fullpack/mappings/${mappingSlug}.json`,
  };
  if (cellSize !== null) cfg.cellSize = cellSize;
    if (plan) cfg.plan = plan;
    return cfg;
}

function narutoSpritesSb3MappedSpriteConfig(targetName, mappingSlug, plan = null, cellSize = null) {
  const cfg = {
    mode: 'sb3-target-mapped',
    targetName,
    assetsBasePath: SB3_ASSETS_BASE,
    mappingPath: `assets/organized/shared/sb3/mappings/${mappingSlug}.json`,
  };
    if (cellSize !== null) {
        cfg.cellSize = cellSize;
    }
    if (plan) cfg.plan = plan;
    return cfg;
}

const FULLPACK_EXTENDED_PLAN = [
    ['IDLE', 4, 12],
    ['WALK', 4, 10],
    ['RUN', 6, 8],
    ['JUMP', 4, 10],
    ['ATTACK_LIGHT_1', 4, 6],
    ['ATTACK_LIGHT_2', 4, 6],
    ['ATTACK_LIGHT_3', 4, 6],
    ['ATTACK_HEAVY_1', 4, 7],
    ['ATTACK_HEAVY_2', 4, 7],
    ['RUN_ATTACK', 4, 6],
    ['THROW', 3, 7],
    ['SPECIAL_TRANSFORM', 5, 7],
    ['SPECIAL', 10, 6],
    ['BLOCK', 1, 12],
    ['HIT', 3, 8],
    ['KO', 3, 10],
    // Legacy compatibility states used in some flows/tools.
    ['ATTACK_LIGHT', 4, 6],
    ['ATTACK_HEAVY', 4, 7],
];

const KIMIMARO_EXTENDED_PLAN = [
    ['IDLE', 6, 12],
    ['WALK', 6, 10],
    ['RUN', 6, 8],
    ['JUMP', 4, 10],
    ['ATTACK_LIGHT_1', 4, 6],
    ['ATTACK_LIGHT_2', 4, 6],
    ['ATTACK_LIGHT_3', 4, 6],
    ['ATTACK_HEAVY_1', 4, 7],
    ['ATTACK_HEAVY_2', 4, 7],
    ['RUN_ATTACK', 4, 6],
    ['THROW', 3, 7],
    ['SPECIAL_TRANSFORM', 8, 7],
    ['SPECIAL', 14, 6],
    ['BLOCK', 1, 12],
    ['HIT', 3, 8],
    ['KO', 4, 10],
    ['ATTACK_LIGHT', 5, 6],
    ['ATTACK_HEAVY', 4, 7],
    ['CS2_IDLE', 5, 12],
    ['CS2_RUN', 4, 8],
    ['CS2_JUMP', 2, 10],
    ['CS2_HIT', 3, 8],
    ['CS2_KO', 3, 10],
    ['CS2_ATTACK_LIGHT_1', 3, 6],
    ['CS2_ATTACK_LIGHT_2', 3, 6],
    ['CS2_ATTACK_HEAVY_1', 4, 7],
    ['CS2_SPECIAL', 13, 6],
];

const LEE_GATES_EXTENDED_PLAN = [
    ['IDLE', 6, 12],
    ['WALK', 10, 10],
    ['RUN', 6, 8],
    ['JUMP', 8, 10],
    ['ATTACK_LIGHT_1', 4, 6],
    ['ATTACK_LIGHT_2', 4, 6],
    ['ATTACK_LIGHT_3', 4, 6],
    ['ATTACK_HEAVY_1', 4, 7],
    ['ATTACK_HEAVY_2', 3, 7],
    ['RUN_ATTACK', 4, 6],
    ['THROW', 3, 7],
    ['SPECIAL_TRANSFORM', 10, 7],
    ['SPECIAL', 8, 6],
    ['BLOCK', 1, 12],
    ['HIT', 2, 8],
    ['KO', 3, 10],
    ['ATTACK_LIGHT', 6, 6],
    ['ATTACK_HEAVY', 6, 7],
    ['GATE_IDLE', 4, 10],
    ['GATE_WALK', 6, 8],
    ['GATE_RUN', 6, 7],
    ['GATE_JUMP', 3, 9],
    ['GATE_ATTACK_LIGHT_1', 4, 5],
    ['GATE_ATTACK_LIGHT_2', 4, 5],
    ['GATE_ATTACK_LIGHT_3', 4, 5],
    ['GATE_ATTACK_HEAVY_1', 4, 5],
    ['GATE_ATTACK_HEAVY_2', 4, 5],
    ['GATE_RUN_ATTACK', 4, 5],
    ['GATE_THROW', 3, 6],
    ['GATE_SPECIAL', 7, 5],
    ['GATE_HIT', 3, 7],
    ['GATE_KO', 4, 8],
];

const CHARACTER_ROSTER = [
    /* ═══════════════════════════════════════════
       NARUTO — Best: Fullpack (195 frames, 20 states)
       ═══════════════════════════════════════════ */
    {
        id: 'naruto',
        targetName: 'Naruto',
        name: 'NARUTO',
        fullName: 'Naruto Uzumaki',
        description: 'Ninja imprévisible, combos explosifs, Rasengan et transformation Kyuubi.',
        special: 'Transformation Kyuubi',
        FighterClass: 'NarutoFighter',
        narutoFamily: 'kid',
        narutoForm: 'base',
        color: '#FF8C00',
        thumbnail: 'assets/organized/shared/sb3/naruto__costume_001__narutostd.png',
        sprite: SB3_SPRITE_MANIFEST,
        spriteConfig: sb3SpriteConfig('Naruto', 'naruto_kid', NARUTO_EXTENDED_PLAN),
        preserveSpriteSource: true,
        stats: { speed: 8, power: 8, defense: 6, chakra: 8 },
    },
    {
        id: 'naruto_kyuubi',
        targetName: 'Naruto',
        name: 'NARUTO KYUUBI',
        fullName: 'Naruto Uzumaki (Kyuubi)',
        description: 'Forme démon, agressif et rapide.',
        special: 'Kyuubi Rasengan',
        FighterClass: 'NarutoFighter',
        narutoFamily: 'kid',
        narutoForm: 'kyuubi',
        selectable: false,
        color: '#D84315',
        thumbnail: 'assets/organized/shared/sb3/naruto__costume_058__kyubistd.png',
        sprite: SB3_SPRITE_MANIFEST,
        spriteConfig: sb3SpriteConfig('Naruto', 'naruto_kid_kyuubi', NARUTO_EXTENDED_PLAN),
        preserveSpriteSource: true,
        stats: { speed: 9, power: 9, defense: 5, chakra: 6 },
    },
    {
        id: 'naruto_shippuden',
        targetName: 'Naruto',
        name: 'NARUTO SHIPPUDEN',
        fullName: 'Naruto Uzumaki (Shippuden)',
        description: 'Version Shippuden avec transformation Kyuubi liée.',
        special: 'Transformation Kyuubi',
        FighterClass: 'NarutoFighter',
        narutoFamily: 'shippuden',
        narutoForm: 'base',
        color: '#F59E0B',
        thumbnail: 'assets/organized/characters/naruto/thumbnail.png',
        sprite: 'assets/organized/characters/naruto/source_project.json',
        spriteConfig: {
            mode: 'sb3-target-mapped',
            targetName: 'Naruto',
            assetsBasePath: 'assets/organized/characters/naruto/frames',
            mappingPath: 'assets/organized/characters/naruto/mapping.json',
            cellSize: null,
            plan: NARUTO_EXTENDED_PLAN,
        },
        preserveSpriteSource: true,
        stats: { speed: 9, power: 9, defense: 6, chakra: 8 },
    },
    {
        id: 'naruto_shippuden_kyuubi',
        targetName: 'Naruto',
        name: 'NARUTO SHIPPUDEN KYUUBI',
        fullName: 'Naruto Uzumaki (Shippuden Kyuubi)',
        description: 'Forme Kyuubi de Naruto Shippuden.',
        special: 'Kyuubi Rasengan',
        FighterClass: 'NarutoFighter',
        narutoFamily: 'shippuden',
        narutoForm: 'kyuubi',
        selectable: false,
        color: '#DC2626',
        thumbnail: 'assets/organized/characters/naruto_kyuubi/thumbnail.png',
        sprite: 'assets/organized/characters/naruto_kyuubi/source_project.json',
        spriteConfig: {
            mode: 'sb3-target-mapped',
            targetName: 'Naruto',
            assetsBasePath: 'assets/organized/characters/naruto_kyuubi/frames',
            mappingPath: 'assets/organized/characters/naruto_kyuubi/mapping.json',
            cellSize: null,
            plan: NARUTO_EXTENDED_PLAN,
        },
        preserveSpriteSource: true,
        stats: { speed: 10, power: 10, defense: 6, chakra: 8 },
    },

    /* ═══════════════════════════════════════════
       SASUKE — Best: SB3 Original (227 frames, 15 states)
       ═══════════════════════════════════════════ */
    {
        id: 'sasuke',
        targetName: 'Sasuke',
        name: 'SASUKE',
        fullName: 'Sasuke Uchiha',
        description: 'Combo long avec transformation intégrée en CS2.',
        special: 'Transformation CS2',
        FighterClass: 'SasukeFighter',
        sasukeForm: 'base',
        color: '#1A237E',
        thumbnail: 'assets/organized/shared/sb3/sasuke__costume_001__sasuke.png',
        sprite: SB3_SPRITE_MANIFEST,
        spriteConfig: superMappedSpriteConfig('sasuke_mega', 'sasuke_mega', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 8, power: 9, defense: 6, chakra: 8 },
    },
    {
        id: 'sasuke_cs2',
        targetName: 'Sasuke',
        name: 'SASUKE CS2',
        fullName: 'Sasuke Uchiha (Curse Seal 2)',
        description: 'Forme maudite niveau 2, puissance brute.',
        special: 'Dark Chidori',
        FighterClass: 'SasukeFighter',
        sasukeForm: 'cs2',
        selectable: false,
        color: '#4A148C',
        thumbnail: 'assets/organized/shared/sb3/sasuke__costume_002__sasuke_cs2.png',
        sprite: SB3_SPRITE_MANIFEST,
        spriteConfig: sb3SpriteConfig('Sasuke', 'sasuke_cs2', SASUKE_EXTENDED_PLAN),
        stats: { speed: 9, power: 10, defense: 5, chakra: 7 },
    },

    /* ═══════════════════════════════════════════
       KAKASHI — Best: Fullpack (207 frames, 20 states)
       ═══════════════════════════════════════════ */
    {
        id: 'kakashi',
        targetName: 'Kakashi',
        name: 'KAKASHI',
        fullName: 'Kakashi Hatake',
        description: 'Ninja copieur polyvalent avec Raikiri.',
        special: 'Raikiri Route',
        FighterClass: 'KakashiFighter',
        color: '#7F8C8D',
        thumbnail: 'assets/organized/shared/sb3_fullpack/kakashi__stand1.png',
        sprite: SB3_FULLPACK_MANIFEST,
        spriteConfig: superMappedSpriteConfig('kakashi_mega', 'kakashi_mega', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 8, power: 8, defense: 6, chakra: 8 },
    },

    /* ═══════════════════════════════════════════
       ITACHI — Best: Fullpack AI (131 frames, 20 states)
       ═══════════════════════════════════════════ */
    {
        id: 'itachi',
        targetName: 'Itachi(AI)',
        name: 'ITACHI',
        fullName: 'Itachi Uchiha',
        description: 'Génie du Sharingan, combos et genjutsu.',
        special: 'Mangekyo Assault',
        FighterClass: 'ItachiFighter',
        color: '#A61B29',
        thumbnail: 'assets/organized/shared/sb3_fullpack/itachiai__stance.png',
        sprite: SB3_FULLPACK_MANIFEST,
        spriteConfig: superMappedSpriteConfig('itachi_mega', 'itachi_mega', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 8, power: 9, defense: 5, chakra: 8 },
    },

    /* ═══════════════════════════════════════════
       KISAME — Best: Whole Lot (166 frames, 18 states)
       ═══════════════════════════════════════════ */
    {
        id: 'kisame',
        targetName: 'Kisame',
        name: 'KISAME',
        fullName: 'Kisame Hoshigaki',
        description: 'Épéiste brutal, jutsu aquatiques dévastateurs.',
        special: 'Goshokuzame',
        FighterClass: 'KisameFighter',
        color: '#1565C0',
        thumbnail: `${MASTER_WHOLE_LOT_ASSETS_BASE}/kisame__kis_stance.png`,
        sprite: MASTER_WHOLE_LOT_MANIFEST,
        spriteConfig: superMappedSpriteConfig('kisame_mega', 'kisame_mega', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 6, power: 10, defense: 8, chakra: 7 },
    },

    /* ═══════════════════════════════════════════
       KIMIMARO — Best: SB3 Original (99 frames, 15 states)
       ═══════════════════════════════════════════ */
    {
        id: 'kimimaro',
        targetName: 'Kimimaro',
        name: 'KIMIMARO',
        fullName: 'Kimimaro Kaguya',
        description: 'Maître des os avec combos longs et mortels.',
        special: 'Bracken Dance',
        FighterClass: 'KimimaroFighter',
        color: '#B0BEC5',
        thumbnail: 'assets/organized/shared/sb3/kimimaro__costume_001__kimimaro_combo_1.png',
        sprite: SB3_SPRITE_MANIFEST,
        spriteConfig: superMappedSpriteConfig('kimimaro_mega', 'kimimaro_mega', KIMIMARO_EXTENDED_PLAN),
        stats: { speed: 7, power: 9, defense: 7, chakra: 7 },
    },

    /* ═══════════════════════════════════════════
       LEE — Best: SB3 Original (88 frames, 15 states)
       ═══════════════════════════════════════════ */
    {
        id: 'lee',
        targetName: 'Lee',
        name: 'LEE',
        fullName: 'Rock Lee',
        description: 'Taijutsu pur, combo rapide et ouverture des portes.',
        special: 'Gate Opening',
        FighterClass: 'LeeFighter',
        color: '#2E7D32',
        thumbnail: 'assets/organized/shared/sb3/lee__costume_001__s1.png',
        sprite: SB3_SPRITE_MANIFEST,
        spriteConfig: superMappedSpriteConfig('lee_mega', 'lee_mega', LEE_GATES_EXTENDED_PLAN),
        stats: { speed: 10, power: 8, defense: 5, chakra: 4 },
    },

    /* ═══════════════════════════════════════════
       SAKURA — Best: Fullpack (136 frames, 20 states)
       ═══════════════════════════════════════════ */
    {
        id: 'sakura',
        targetName: 'Sakura',
        name: 'SAKURA',
        fullName: 'Sakura Haruno',
        description: 'Force brute et guérison, combo équilibré.',
        special: 'Cherry Power',
        FighterClass: 'SakuraFighter',
        color: '#E91E63',
        thumbnail: 'assets/organized/shared/sb3_fullpack/sakura__stance.png',
        sprite: SB3_FULLPACK_MANIFEST,
        spriteConfig: superMappedSpriteConfig('sakura_mega', 'sakura_mega', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 8, defense: 7, chakra: 7 },
    },

    /* ═══════════════════════════════════════════
       HINATA — Best: SB3 Original (131 frames, 15 states)
       ═══════════════════════════════════════════ */
    {
        id: 'hinata',
        targetName: 'Hinata',
        name: 'HINATA',
        fullName: 'Hinata Hyuga',
        description: 'Poing souple, héritière des Hyuga.',
        special: 'Gentle Fist',
        FighterClass: 'HinataFighter',
        color: '#7986CB',
        thumbnail: 'assets/organized/shared/sb3/sprite10__costume_001__costume1.png',
        sprite: SB3_SPRITE_MANIFEST,
        spriteConfig: superMappedSpriteConfig('hinata_mega', 'hinata_mega', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 6, defense: 7, chakra: 8 },
    },

    /* ═══════════════════════════════════════════
       SASORI — Best: Whole Lot (139 frames, 18 states)
       ═══════════════════════════════════════════ */
    {
        id: 'sasori',
        targetName: 'Sasori',
        name: 'SASORI',
        fullName: 'Sasori',
        description: 'Maître marionnettiste de l\'Akatsuki.',
        special: 'Puppet Assault',
        FighterClass: 'SasoriFighter',
        color: '#8D6E63',
        thumbnail: `${MASTER_WHOLE_LOT_ASSETS_BASE}/sasori__stance_5.png`,
        sprite: MASTER_WHOLE_LOT_MANIFEST,
        spriteConfig: superMappedSpriteConfig('sasori_mega', 'sasori_mega', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 8, defense: 6, chakra: 8 },
    },

    /* ═══════════════════════════════════════════
       OROCHIMARU — Best: Whole Lot (79 frames, 18 states)
       ═══════════════════════════════════════════ */
    {
        id: 'orochimaru',
        targetName: 'Orochimaru',
        name: 'OROCHIMARU',
        fullName: 'Orochimaru',
        description: 'Sannin légendaire avec attaques serpent.',
        special: 'Hidden Shadow Snake',
        FighterClass: 'OrochimaruFighter',
        color: '#9C27B0',
        thumbnail: `${MASTER_WHOLE_LOT_ASSETS_BASE}/orochimaru__o_stance.png`,
        sprite: MASTER_WHOLE_LOT_MANIFEST,
        spriteConfig: superMappedSpriteConfig('orochimaru_mega', 'orochimaru_mega', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 9, defense: 7, chakra: 9 },
    },

    /* ═══════════════════════════════════════════
       GAARA — Whole Lot (55 costumes)
       ═══════════════════════════════════════════ */
    {
        id: 'gaara',
        targetName: 'Gaara',
        name: 'GAARA',
        fullName: 'Gaara du Sable',
        description: 'Zoner sable avec contrôle d\'espace.',
        special: 'Sand Burial',
        FighterClass: 'GaaraFighter',
        color: '#C19A6B',
        displayScale: 0.94,
        thumbnail: `${MASTER_WHOLE_LOT_ASSETS_BASE}/gaara__gaara_ll.png`,
        sprite: MASTER_WHOLE_LOT_MANIFEST,
        spriteConfig: superMappedSpriteConfig('gaara_mega', 'gaara_mega', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 6, power: 9, defense: 8, chakra: 8 },
    },

    /* ═══════════════════════════════════════════
       GAI — Whole Lot (58 costumes)
       ═══════════════════════════════════════════ */


    /* ═══════════════════════════════════════════
       MINATO — Fullpack
       ═══════════════════════════════════════════ */
    {
        id: 'minato',
        targetName: 'Minato',
        name: 'MINATO',
        fullName: 'Minato Namikaze',
        description: 'Style rapide avec téléport et enchaînements éclairs.',
        special: 'Flying Thunder God',
        FighterClass: 'MinatoFighter',
        color: '#F7C948',
        thumbnail: 'assets/organized/shared/sb3_fullpack/minato__stand1.png',
        sprite: SB3_FULLPACK_MANIFEST,
        spriteConfig: sb3FullpackMappedSpriteConfig('Minato', 'minato', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 9, power: 8, defense: 5, chakra: 8 },
    },

    /* ═══════════════════════════════════════════
       MADARA — Fullpack
       ═══════════════════════════════════════════ */
    {
        id: 'madara',
        targetName: 'Madara',
        name: 'MADARA',
        fullName: 'Madara Uchiha',
        description: 'Pression offensive et gros enchaînements jutsu.',
        special: 'Uchiha Devastation',
        FighterClass: 'MadaraFighter',
        color: '#5B1E1E',
        thumbnail: 'assets/organized/shared/sb3_fullpack/madara__stance.png',
        sprite: SB3_FULLPACK_MANIFEST,
        spriteConfig: sb3FullpackMappedSpriteConfig('Madara', 'madara', FULLPACK_EXTENDED_PLAN, null),
        stats: { speed: 7, power: 10, defense: 6, chakra: 9 },
        displayScale: 0.31, // Compensate for dynamic cell size maintaining large true resolution
    },

    /* ═══════════════════════════════════════════
       PEIN — SB3 Original
       ═══════════════════════════════════════════ */
    {
        id: 'pein',
        targetName: 'Pein',
        name: 'PEIN',
        fullName: 'Pain (Tendo)',
        description: 'Leader d\'Akatsuki, sixième chemin de la douleur.',
        special: 'Shinra Tensei',
        color: '#FF6F00',
        thumbnail: 'assets/organized/shared/sb3/pein__costume_001__costume1.png',
        sprite: SB3_SPRITE_MANIFEST,
        spriteConfig: superMappedSpriteConfig('pein_mega', 'pein_mega', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 10, defense: 7, chakra: 10 },
    },

    /* ═══════════════════════════════════════════
       DEIDARA — Whole Lot (45 costumes)
       ═══════════════════════════════════════════ */
    {
        id: 'deidara',
        targetName: 'clay guy',
        name: 'DEIDARA',
        fullName: 'Deidara',
        description: 'Artiste explosif avec combos rapides.',
        special: 'C1 Detonation',
        FighterClass: 'DeidaraFighter',
        color: '#FFD54F',
        thumbnail: `${MASTER_WHOLE_LOT_ASSETS_BASE}/clay_guy__stancer.png`,
        sprite: MASTER_WHOLE_LOT_MANIFEST,
        spriteConfig: wholeLotMappedSpriteConfig('clay guy', 'clay_guy_wh', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 8, power: 8, defense: 5, chakra: 9 },
    },

    /* ═══════════════════════════════════════════
       NEJI — Whole Lot
       ═══════════════════════════════════════════ */
    {
        id: 'neji',
        targetName: 'neji',
        name: 'NEJI',
        fullName: 'Neji Hyuga',
        description: 'Génie des Hyuga, poing souple.',
        special: '8 Trigrams 64 Palms',
        FighterClass: 'NejiFighter',
        color: '#B39DDB',
        thumbnail: `${MASTER_WHOLE_LOT_ASSETS_BASE}/neji__neji.png`,
        sprite: MASTER_WHOLE_LOT_MANIFEST,
        spriteConfig: wholeLotMappedSpriteConfig('neji', 'neji_wh', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 8, power: 8, defense: 7, chakra: 7 },
    },

    /* ═══════════════════════════════════════════
       KANKURO — Whole Lot
       ═══════════════════════════════════════════ */
    {
        id: 'kankuro',
        targetName: 'Kankuro',
        name: 'KANKURO',
        fullName: 'Kankuro',
        description: 'Marionnettiste de Suna.',
        special: 'Puppet Attack',
        FighterClass: 'KankuroFighter',
        color: '#795548',
        thumbnail: `${MASTER_WHOLE_LOT_ASSETS_BASE}/kankuro__costume1.png`,
        sprite: MASTER_WHOLE_LOT_MANIFEST,
        spriteConfig: wholeLotMappedSpriteConfig('Kankuro', 'kankuro_wh', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 6, power: 7, defense: 7, chakra: 7 },
    },

    /* ═══════════════════════════════════════════
       JIROBO — Whole Lot
       ═══════════════════════════════════════════ */
    {
        id: 'jirobo',
        targetName: 'Jirobo',
        name: 'JIROBO',
        fullName: 'Jirobo',
        description: 'Colosse du quartet du son.',
        special: 'Earth Dome Prison',
        FighterClass: 'JiroboFighter',
        color: '#EF6C00',
        thumbnail: `${MASTER_WHOLE_LOT_ASSETS_BASE}/jirobo__jirobo.png`,
        sprite: MASTER_WHOLE_LOT_MANIFEST,
        spriteConfig: wholeLotMappedSpriteConfig('Jirobo', 'jirobo_wh', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 4, power: 10, defense: 10, chakra: 5 },
    },

    {
        id: 'jiraiya_new',
        targetName: 'Jiraiya',
        name: 'JIRAIYA',
        fullName: 'Jiraiya',
        description: "Sannin légendaire aux invocations de crapauds.",
        special: 'Special Attack',
        FighterClass: 'JiraiyaFighter',
        color: '#607D8B',
        thumbnail: 'assets/organized/characters/jiraiya_new/thumbnail.png',
        sprite: 'assets/organized/characters/jiraiya_new/source_project.json',
        spriteConfig: narutoSpritesSb3MappedSpriteConfig('Jiraiya', 'jiraiya_new', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 7, defense: 7, chakra: 7 },
    },
    {
        id: 'sasuke_ems',
        targetName: 'Sasuke Eternal',
        name: 'SASUKE EMS',
        fullName: 'Sasuke Uchiha (EMS)',
        description: "Mangekyou Sharingan Éternel, puissance du Susanoo.",
        special: 'Special Attack',
        FighterClass: 'SasukeEMSFighter',
        color: '#607D8B',
        thumbnail: 'assets/organized/characters/sasuke_ems/thumbnail.png',
        sprite: 'assets/organized/characters/sasuke_ems/source_project.json',
        spriteConfig: narutoSpritesSb3MappedSpriteConfig('Sasuke Eternal', 'sasuke_ems', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 7, defense: 7, chakra: 7 },
    },
    {
        id: 'boruto',
        targetName: 'Boruto',
        name: 'BORUTO',
        fullName: 'Boruto Uzumaki',
        description: "Prodige de la nouvelle génération.",
        special: 'Special Attack',
        FighterClass: 'BorutoFighter',
        color: '#607D8B',
        thumbnail: 'assets/organized/characters/boruto/thumbnail.png',
        sprite: 'assets/organized/characters/boruto/source_project.json',
        spriteConfig: narutoSpritesSb3MappedSpriteConfig('Boruto', 'boruto', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 7, defense: 7, chakra: 7 },
    },
    {
        id: 'teen_kakashi',
        targetName: 'teen kakashi',
        name: 'KAKASHI (JEUNE)',
        fullName: 'Kakashi Hatake (Jeune)',
        description: "Génie prodige avec son épée de chakra blanc.",
        special: 'Special Attack',
        FighterClass: 'TeenKakashiFighter',
        color: '#607D8B',
        thumbnail: 'assets/organized/characters/teen_kakashi/thumbnail.png',
        sprite: 'assets/organized/characters/teen_kakashi/source_project.json',
        spriteConfig: narutoSpritesSb3MappedSpriteConfig('teen kakashi', 'teen_kakashi', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 7, defense: 7, chakra: 7 },
    },
    {
        id: 'shikamaru_shippuden_alt',
        targetName: 'Sprite5',
        name: 'SHIKAMARU SHIPPUDEN (ALT)',
        fullName: 'Shikamaru Nara (Shippuden - Sprite5)',
        description: 'Version Shippuden orientee Kagemane et controle.',
        special: 'Kagemane',
        color: '#607D8B',
        thumbnail: 'assets/organized/characters/shikamaru_shippuden_alt/thumbnail.png',
        sprite: 'assets/organized/characters/shikamaru_shippuden_alt/source_project.json',
        spriteConfig: narutoSpritesSb3MappedSpriteConfig('Sprite5', 'ns_sprite5', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 7, defense: 7, chakra: 7 },
    },

    {
        id: 'gaara_grand_alt',
        targetName: 'Sprite8',
        name: 'GAARA GRAND (ALT)',
        fullName: 'Gaara (Grande version - Sprite8)',
        description: 'Version grand format de Gaara.',
        special: 'Sable Special',
        FighterClass: 'GaaraFighter',
        color: '#607D8B',
        thumbnail: 'assets/organized/characters/gaara_grand_alt/thumbnail.png',
        sprite: 'assets/organized/characters/gaara_grand_alt/source_project.json',
        spriteConfig: narutoSpritesSb3MappedSpriteConfig('Sprite8', 'ns_sprite8', FULLPACK_EXTENDED_PLAN, null),
        stats: { speed: 7, power: 7, defense: 7, chakra: 7 },
        displayScale: 0.40,
    },

    {
        id: 'hinata_grande_alt',
        targetName: 'Sprite10',
        name: 'HINATA GRANDE (ALT)',
        fullName: 'Hinata (Grande version - Sprite10)',
        description: 'Version grand format de Hinata.',
        special: 'Hakke Strike',
        color: '#607D8B',
        thumbnail: 'assets/organized/characters/hinata_grande_alt/thumbnail.png',
        sprite: 'assets/organized/characters/hinata_grande_alt/source_project.json',
        spriteConfig: narutoSpritesSb3MappedSpriteConfig('Sprite10', 'ns_sprite10', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 7, defense: 7, chakra: 7 },
        displayScale: 0.92,
    },

    {
        id: 'ns_mashu_ti',
        targetName: 'Mashū (Ti)',
        name: 'MASHU',
        fullName: 'Mashu (Ti)',
        description: 'Personnage additionnel du pack Naruto sprites.',
        special: 'Special Attack',
        color: '#607D8B',
        thumbnail: 'assets/organized/characters/ns_mashu_ti/thumbnail.png',
        sprite: 'assets/organized/characters/ns_mashu_ti/source_project.json',
        spriteConfig: narutoSpritesSb3MappedSpriteConfig('Mashū (Ti)', 'ns_mashu_ti', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 7, defense: 7, chakra: 7 },
    },
    {
        id: 'ns_kimimaro',
        targetName: 'kimimaro',
        name: 'KIMIMARO (NS)',
        fullName: 'Kimimaro (Naruto Sprites Pack)',
        description: 'Version alternative du pack Naruto sprites.',
        special: 'Special Attack',
        FighterClass: 'KimimaroFighter',
        color: '#607D8B',
        thumbnail: 'assets/organized/characters/ns_kimimaro/thumbnail.png',
        sprite: 'assets/organized/characters/ns_kimimaro/source_project.json',
        spriteConfig: narutoSpritesSb3MappedSpriteConfig('kimimaro', 'ns_kimimaro', KIMIMARO_EXTENDED_PLAN),
        stats: { speed: 7, power: 7, defense: 7, chakra: 7 },
    },
    {
        id: 'ns_lee_young',
        targetName: 'Lee (young)',
        name: 'LEE (YOUNG NS)',
        fullName: 'Rock Lee (Young, Naruto Sprites Pack)',
        description: 'Version alternative du pack Naruto sprites.',
        special: 'Special Attack',
        FighterClass: 'LeeFighter',
        selectable: false,
        color: '#607D8B',
        thumbnail: 'assets/organized/characters/ns_lee_young/thumbnail.png',
        sprite: 'assets/organized/characters/ns_lee_young/source_project.json',
        spriteConfig: narutoSpritesSb3MappedSpriteConfig('Lee (young)', 'ns_lee_young', FULLPACK_EXTENDED_PLAN),
        stats: { speed: 7, power: 7, defense: 7, chakra: 7 },
    },
];

// Prefer the clean organized asset tree generated in assets/organized.
// This keeps gameplay paths stable while allowing old folders to be removed later.
function _applyOrganizedCharacterAssets() {
    CHARACTER_ROSTER.forEach((entry) => {
        if (!entry || !entry.id) return;
        if (entry.preserveSpriteSource) return;
        const base = `assets/organized/characters/${entry.id}`;
        if (entry.spriteConfig && typeof entry.spriteConfig === 'object') {
            entry.spriteConfig.mappingPath = `${base}/mapping.json`;
            entry.spriteConfig.assetsBasePath = `${base}/frames`;
        }
        entry.sprite = `${base}/source_project.json`;
        const thumbExtMatch = String(entry.thumbnail || '').match(/(\.[a-z0-9]+)$/i);
        const thumbExt = thumbExtMatch ? thumbExtMatch[1] : '.png';
        entry.thumbnail = `${base}/thumbnail${thumbExt}`;
    });
}
_applyOrganizedCharacterAssets();

function _statsToFighterConfig(stats = {}) {
    const speed = 2.2 + (stats.speed || 6) * 0.22;
    const attackPower = 5 + (stats.power || 6) * 1.35;
    const defense = 0.5 + (stats.defense || 6) * 0.18;
    const maxHealth = 80 + (stats.defense || 6) * 4;
    const maxChakra = 70 + (stats.chakra || 6) * 8;
    const chakraRegen = 0.05 + (stats.chakra || 6) * 0.006;
    const maxStamina = 72 + (stats.speed || 6) * 4 + (stats.defense || 6) * 2;
    const staminaRegen = 0.13 + (stats.speed || 6) * 0.012;
    return {
        speed,
        attackPower,
        defense,
        maxHealth,
        maxChakra,
        chakraRegen,
        maxStamina,
        staminaRegen,
    };
}

// Helper to create a fighter from roster data
function createFighter(charId, config) {
    const data = CHARACTER_ROSTER.find(c => c.id === charId);
    if (!data) return new Fighter(config);

    const classes = {
        NarutoFighter,
        SasukeFighter,
        LeeFighter,
        SakuraFighter,
        KakashiFighter,
        KisameFighter,
        MinatoFighter,
        ItachiFighter,
        MadaraFighter,
        SasoriFighter,
        GaaraFighter,
        GaiFighter,
        KimimaroFighter,
        OrochimaruFighter,
        DeidaraFighter,
        HinataFighter,
        ShikamaruFighter,
        NejiFighter,
        KankuroFighter,
        TemariFighter,
        KabutoFighter,
        JiroboFighter,
        SakonFighter,
        JiraiyaFighter,
        SasukeEMSFighter,
        BorutoFighter,
        TeenKakashiFighter,
        TentenFighter,

    };

    const Cls = classes[data.FighterClass] || Fighter;
    const extraCfg = {};
    if (data.displayScale != null) extraCfg.displayScale = data.displayScale;
    if (Cls !== Fighter) {
        return new Cls({
            charId: data.id,
            name: data.name,
            color: data.color,
            narutoFamily: data.narutoFamily,
            narutoForm: data.narutoForm,
            sasukeForm: data.sasukeForm,
            ..._statsToFighterConfig(data.stats),
            ...extraCfg,
            ...config,
        });
    }

    return new Fighter({
        charId: data.id,
        name: data.name,
        color: data.color,
        ..._statsToFighterConfig(data.stats),
        ...extraCfg,
        ...config,
    });
}

// Expose roster for non-module pages (e.g. Mapper Studio) that read from window.
if (typeof window !== 'undefined') {
    window.CHARACTER_ROSTER = CHARACTER_ROSTER;
    window.createFighter = createFighter;
}
