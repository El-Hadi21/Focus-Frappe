import { GameConfig } from './game-config.model';

export interface ThemeConfig {
  id: GameConfig['theme'];
  label: string;
  subtitle: string;
  previewImage: string;
  groundTile?: string;
  avatarSprite: string;
  obstacleASprite: string;
  obstacleBSprite: string;
  obstacleBCarriedSprite: string;
  targetSprite?: string;
  projectileSprite?: string;
  effectSprite?: string;
  dictionaries: Record<GameConfig['difficulty'], string[]>;
}

export const THEME_CONFIGS: Record<GameConfig['theme'], ThemeConfig> = {
  Football: {
    id: 'Football',
    label: 'Football',
    subtitle: 'Renvoie le ballon au fond des filets et récupère la balle !',
    previewImage: '/assets/UI/UI-foot.png',
    groundTile: '/assets/theme/foot/Tilesheet/groundGrass_mown.png',
    avatarSprite: '/assets/theme/foot/PNG/Blue/characterBlue (1).png',
    obstacleASprite: '/assets/theme/foot/PNG/Equipment/ball_soccer1.png',
    obstacleBSprite: '/assets/theme/foot/PNG/Red/characterRed (1).png',
    obstacleBCarriedSprite: '/assets/theme/foot/PNG/Equipment/ball_soccer2.png',
    targetSprite: '/assets/theme/foot/PNG/Elements/element (37).png',
    dictionaries: {
      Facile: ['but', 'tir', 'jeu', 'foot', 'vite', 'main', 'club', 'pass', 'coup', 'filet'],
      Normal: ['ballon', 'gardien', 'arbitre', 'terrain', 'dribble', 'joueur', ' tribune', 'corner'].map((w) =>
        w.trim(),
      ),
      Difficile: [
        'defenseur',
        'attaquant',
        'entraineur',
        'championnat',
        'coequipier',
        'prolongation',
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
    dictionaries: {
      Facile: ['lune', 'mars', 'ciel', 'ovni', 'star', 'orb', 'vol', 'vide', 'code', 'base'],
      Normal: ['planete', 'comete', 'galaxie', 'cosmos', 'navette', 'orbite', 'etoile', 'station'],
      Difficile: [
        'astronaute',
        'meteorite',
        'constellation',
        'apesanteur',
        'exploration',
        'observatoire',
      ],
    },
  },
};