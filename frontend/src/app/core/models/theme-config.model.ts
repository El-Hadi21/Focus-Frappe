import { GameConfig } from './game-config.model';

export type GameSoundEvent =
  | 'correctLetter'
  | 'typingError'
  | 'obstacleACleared'
  | 'obstacleBCleared';

export interface ThemeSoundConfig {
  bgm: string;
  correctLetter: string;
  typingError: string;
  obstacleACleared: string;
  obstacleBCleared: string;
}

export interface ThemeConfig {
  id: GameConfig['theme'];
  label: string;
  subtitle: string;
  previewImage: string;
  groundTile?: string;
  avatarSprite: string;
  obstacleASprite: string;
  obstacleBSprite: string;
  obstacleBSlideSprite?: string;
  obstacleBCarriedSprite: string;
  targetSprite?: string;
  projectileSprite?: string;
  effectSprite?: string;
  sounds: ThemeSoundConfig;
  dictionaries: Record<GameConfig['difficulty'], string[]>;
}

export const THEME_CONFIGS: Record<GameConfig['theme'], ThemeConfig> = {
  Football: {
    id: 'Football',
    label: 'Football',
    subtitle: 'Renvoie le ballon au fond des filets et récupère la balle !',
    previewImage: '/assets/UI/UI-foot.png',
    groundTile: '/assets/theme/foot/Tilesheet/groundGrass_mown.png',
    avatarSprite: '/assets/personnage-foot/blue-player.png',
    obstacleASprite: '/assets/theme/foot/PNG/Equipment/ball_soccer1.png',
    obstacleBSprite: '/assets/personnage-foot/red-player-run.png',
    obstacleBSlideSprite: '/assets/personnage-foot/red-player-tackle.png',
    obstacleBCarriedSprite: '/assets/theme/foot/PNG/Equipment/ball_soccer2.png',
    targetSprite: '/assets/theme/foot/PNG/Elements/element (37).png',
    sounds: {
      bgm: '/assets/sounds/foot/bgm-stadium.mp3',
      correctLetter: '/assets/UI/kenny-game-UIs/Sounds/click-a.ogg',
      typingError: '/assets/UI/kenny-game-UIs/Sounds/tap-b.ogg',
      obstacleACleared: '/assets/sounds/foot/kick-goal.mp3',
      obstacleBCleared: '/assets/sounds/foot/tackle-steal.mp4',
    },
    dictionaries: {
      Facile: [
        'but', 'tir', 'jeu', 'foot', 'club', 'main', 'camp', 'gant', 'coup', 'hors',
        'banc', 'cage', 'coin', 'duel', 'goal', 'lice', 'mur', 'pied', 'plot', 'pont',
        'saut', 'test', 'tour', 'vite', 'axe', 'bleu', 'choc', 'clan', 'don', 'passe',
      ],
      Normal: [
        'ballon', 'gardien', 'arbitre', 'terrain', 'dribble', 'joueur', 'corner', 'stade', 'maillot', 'crampon',
        'attaque', 'brassard', 'buteur', 'centre', 'chrono', 'couloir', 'crochet', 'defense', 'relance', 'gradin',
        'lucarne', 'offensif', 'pelouse', 'penalty', 'poteau', 'sifflet', 'surface', 'tribune', 'fautes', 'filets',
      ],
      Difficile: [
        'defenseur', 'attaquant', 'entraineur', 'championnat', 'coequipier', 'prolongation', 'supporter', 'adversaire', 'alignement', 'amortissement',
        'capitaine', 'classement', 'combinaison', 'competition', 'debordement', 'degagement', 'echauffement', 'elimination', 'engagement', 'interception',
        'partenaire', 'passement', 'preparation', 'remplacant', 'recuperation', 'selectionneur', 'statistique', 'transversale', 'trajectoire', 'victorieux',
      ],
    },
  },
  Espace: {
    id: 'Espace',
    label: 'Espace',
    subtitle: 'Détruis les météorites au laser et récupère les étoiles !',
    previewImage: '/assets/UI/UI-space.png',
    groundTile: '/assets/theme/space/PNG/Sprites/Station/spaceStation_020.png',
    avatarSprite: '/assets/theme/space/PNG/Sprites/Ships/spaceShips_001.png',
    obstacleASprite: '/assets/theme/space/PNG/Sprites/Meteors/spaceMeteors_001.png',
    obstacleBSprite: '/assets/theme/space/PNG/Sprites/Ships/spaceShips_007.png',
    obstacleBCarriedSprite: '/assets/UI/kenny-game-UIs/PNG/Yellow/Default/star.png',
    projectileSprite: '/assets/theme/space/PNG/Sprites/Missiles/spaceMissiles_001.png',
    effectSprite: '/assets/theme/space/PNG/Sprites/Effects/spaceEffects_006.png',
    sounds: {
      bgm: '/assets/sounds/space/bgm-cosmos.mp3',
      correctLetter: '/assets/UI/kenny-game-UIs/Sounds/click-b.ogg',
      typingError: '/assets/UI/kenny-game-UIs/Sounds/tap-b.ogg',
      obstacleACleared: '/assets/sounds/space/laser-explosion.ogg',
      obstacleBCleared: '/assets/sounds/space/star-collect.ogg',
    },
    dictionaries: {
      Facile: [
        'lune', 'mars', 'ciel', 'ovni', 'star', 'vol', 'vide', 'base', 'nuit', 'noir',
        'axe', 'cap', 'char', 'code', 'cone', 'dome', 'echo', 'feux', 'flux', 'gaz',
        'halo', 'ion', 'jet', 'nef', 'nova', 'onde', 'pole', 'orb', 'air', 'sol',
      ],
      Normal: [
        'planete', 'comete', 'galaxie', 'cosmos', 'navette', 'orbite', 'etoile', 'station', 'soleil', 'pilote',
        'anneau', 'antenne', 'capsule', 'cockpit', 'cratere', 'eclipse', 'equipage', 'espace', 'fusee', 'gravite',
        'horizon', 'impact', 'jupiter', 'lumiere', 'mercure', 'meteore', 'mission', 'neptune', 'pulsar', 'saturne',
      ],
      Difficile: [
        'astronaute', 'meteorite', 'apesanteur', 'exploration', 'observatoire', 'constellation', 'telescope', 'acceleration', 'astrophysique', 'atmosphere',
        'atterrissage', 'combinaison', 'communication', 'cosmonaute', 'decollage', 'exoplanete', 'extraterrestre', 'gravitation', 'interstellaire', 'laboratoire',
        'lancement', 'navigation', 'planetaire', 'propulseur', 'rayonnement', 'satellite', 'trajectoire', 'universel', 'astronomie', 'stratosphere',
      ],
    },
  },
};