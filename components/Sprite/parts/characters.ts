// SNES Street Fighter style sprites — 12 wide × 20 tall
// Color tokens:
//   '.' transparent     'O' dark outline (#1a1a2e)
//   'P' primary         'p' primary shadow
//   'S' secondary       's' secondary shadow
//   'K' skin            'k' skin shadow     'L' skin light
//   'H' hair            'h' hair shadow
//   'W' white           'w' light gray
//   'B' black
// Each cell → PIXEL_SIZE × PIXEL_SIZE SVG rect

export const PIXEL_SIZE = 4

export type PixelChar = string[]

// ─── HEADS 12×7 ───────────────────────────────────────────────────────────────

export const HEADS: PixelChar[] = [
  // 0 Fighter (Ryu-style) — short dark hair, clean face
  [
    '.HHHHHHHHHH..',  // hair top
    'HHOkKKKKkOH..',  // forehead sides
    'HHOKkWKWkOH..',  // eyes (W=white of eye)
    'HHOkKKKKkOH..',  // cheeks
    'HHOk.KKk.OH..',  // mouth
    'HHOKKkKkKOH..',  // chin
    '.HOOOOOOOO...',  // jaw line
  ],
  // 1 Military (Guile-style) — flat-top hair, strong jaw
  [
    'HHHHHHHHHHHH.',  // flat top hair
    'HHOKkKKKkKOH.',  // forehead
    'HHOKkWKWkKO..',  // eyes
    'HHOkKKKKkKO..',  // cheeks
    'HHOk.KKk.KO..',  // mouth
    'HHOKKKKKkKO..',  // strong jaw
    'HHOOOOOOOO...',  // jaw base
  ],
  // 2 Ninja — full face mask
  [
    'SSSSSSSSSSSS.',  // mask top
    'SSOOOOOOOOSS.',  // mask face
    'SSOKKKKKOSS..',  // skin strip (eyes)
    'SSOKkWKWkOSS.',  // eyes
    'SSOKKKKKOSS..',  // lower mask
    'SSOKKKKKOSS..',  // mask chin
    'SSOOOOOOOOSS.',  // mask base
  ],
  // 3 Heavy warrior — full helmet
  [
    'SSSSSSSSSSSS.',  // helmet top
    'SSwSSSSSSSwS.',  // visor glint (w=light gray)
    'SSOkKKKkOSS..',  // face slot
    'SSOKkWKWkOSS.',  // eyes through visor
    'SSOkKKKkOSS..',  // cheeks
    'SSOkK.KkKOSS.',  // mouth area
    'SSOOOOOOOO...',  // helmet bottom
  ],
  // 4 Mage — deep hood
  [
    'SSSSSSSSSSS..',  // hood peak
    'SSSOOOOOOSSS.',  // hood shadow opening
    'SSOKKKKKOSS..',  // face in shadow
    'SSOKkWKWkOSS.',  // eyes
    'SSOkKKKkOSS..',  // cheeks
    'SSOk.KKk.OSS.',  // mouth
    'SSSOOOOOOSSS.',  // hood bottom
  ],
]

// ─── BODIES 12×8 ──────────────────────────────────────────────────────────────

export const BODIES: PixelChar[] = [
  // 0 Fighter — gi top, raised guard
  [
    '.OKKPPPPKKo.',  // neck + collar open
    'OKKPPpPPPKKO',  // chest with shading
    'PPPKPpPpPKPP',  // arms extended (K=hands/wrists)
    'PpPPPpPpPPpP',  // gi chest folds
    'PPSSSSSSSSpP',  // belt (S=secondary color)
    'PPPpPPPPpPPP',  // lower gi
    '.PPP....PPP.',  // legs start
    '.PPP....PPP.',  // upper legs
  ],
  // 1 Military — vest + dog tags
  [
    '.OSSSSSSSsO.',  // vest collar
    'OSSKSsSsKSSO',  // chest + neck (K=skin at collar)
    'SSSsSSSSSsSS',  // vest body
    'SSsPPPPPPsSS',  // badge/medals area
    'SSOPPPPPPOsS',  // belt buckle
    'SSSsSSSSSsSS',  // lower vest
    '.SSs....sSS.',  // legs
    '.SSs....sSS.',  // thigh area
  ],
  // 2 Ninja — tight bodysuit, sash
  [
    '....OPKPO...',  // slim neck/shoulders
    '...OPKKKPpO.',  // upper body
    '..OPpKKKpPO.',  // chest
    '..OPPPPPPpO.',  // torso
    '..OSSSSSsSO.',  // sash belt
    '..OPPPPPPpO.',  // lower torso
    '..OP....PpO.',  // hips
    '..OP....PpO.',  // thigh split
  ],
  // 3 Heavy warrior — full plate armor
  [
    '.OSSSSSSSSO.',  // shoulder plates
    'OSSsSSSSsSsO',  // pauldrons (shoulder armor)
    'OSSpSSSSSSSO',  // chest plate
    'OSSpSSSSSSSO',  // breast plate with shading
    'OSSpSSSSSSSO',  // stomach plate
    'OSSsSSSSsSSO',  // waist plate
    '.OSSsSSSsO..',  // hip armor
    '.OSSsSSsSO..',  // upper legs armor
  ],
  // 4 Mage — flowing robe
  [
    '...OSSSSO...',  // collar
    '..OSSPPSsO..',  // upper robe
    '.OSSsPPPsSO.',  // robe spread
    'OSSSsPPPsSSOO',  // wide robe (13 chars OK, renderer clips)
    'OSSSSSSSSsSO',  // flowing sides
    'OSSSSSSSSsSO',  // robe belly
    '.OSSSSSSsSO.',  // lower robe
    '.OSSSSSSsSO.',  // robe hem
  ],
]

// ─── LEGS 12×5 ────────────────────────────────────────────────────────────────

export const LEGS: PixelChar[] = [
  // 0 Fighter — wide fighting stance, bare feet
  [
    '.OPP....PPO.',  // thighs spread
    'OPPp....pPPO',  // knees
    'OPP......PPO',  // shins
    'SPP......PPS',  // ankles (S=secondary)
    'SO.......OO.',  // feet
  ],
  // 1 Military — combat boots
  [
    '.OSS....SSO.',  // pants
    'OSS......SSO',  // pants lower
    'OSS......SSO',  // shins
    'OOO......OOO',  // boot tops
    'OO.......OOO',  // boot soles
  ],
  // 2 Ninja — crouching stance
  [
    '.OPP..PPO...',  // bent knees
    '.OPPp.pPPO..',  // inner knees
    '..OPP.PPO...',  // lower legs
    '..OPP.PPOO..',  // ankles
    '..OO...OO...',  // feet
  ],
  // 3 Heavy warrior — armored greaves
  [
    '.OSS....SSO.',  // upper greave
    'OSS......SSO',  // shin plate
    'OSSSsSSSsSO.',  // armored shin
    'OSSSsSSSsSO.',  // boot plate
    'OSSO....OSO.',  // armored foot
  ],
  // 4 Mage — robe base
  [
    '.OSSSSSSSSO.',  // robe bottom
    'OSSSSSSSSSO.',  // robe hem
    'OSSSSSSSSSO.',  // robe feet area
    'OSSSSSSSSSO.',  // robe base
    '.OSSSSSSSSO.',  // floor line
  ],
]

// ─── ACCESSORIES 12×7 (overlaid on head area) ────────────────────────────────

export const ACCESSORIES: (PixelChar | null)[] = [
  null,
  // 1 Corona
  [
    '.P.P.P.P.P..',
    'PPPPPPPPPP..',
    '.PPPPPPPP...',
    '............',
    '............',
    '............',
    '............',
  ],
  // 2 Antifaz
  [
    '............',
    '............',
    '............',
    'SSSOOOOOOSS.',
    '.SSSOOOSSS..',
    '............',
    '............',
  ],
  // 3 Lentes de sol
  [
    '............',
    '............',
    '..OOOOOOOO..',
    '.OWWOOOWWO..',
    '..OOOOOOOO..',
    '............',
    '............',
  ],
  // 4 Diadema
  [
    '.PPPPPPPPPP.',
    '.pppppppppp.',
    '............',
    '............',
    '............',
    '............',
    '............',
  ],
]

export const ACCESSORY_NAMES = ['Ninguno', 'Corona', 'Antifaz', 'Lentes', 'Diadema']
export const HEAD_NAMES = ['Guerrero', 'Militar', 'Ninja', 'Armado', 'Mago']
export const BODY_NAMES = ['Gi', 'Chaleco', 'Bodysuit', 'Armadura', 'Túnica']
