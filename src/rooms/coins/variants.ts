import { RoomVariantManager, RoomVariantMeta } from '../variants/roomVariantManager';
import { v1MintConfig } from './variants/v1_mint';
import { v2VaultConfig } from './variants/v2_vault';

export const COIN_ROOM_VARIANTS: RoomVariantMeta[] = [
  {
    id: 'v1_mint',
    roomId: 'coins',
    label: '1. The Mechanical Mint',
    shortName: 'Mechanical Mint',
    description: 'Industrial steam coining press, gear hopper, 2.5D bouncing floor physics, and Galton Plinko chute.',
    year: 1892,
    icon: '⚙️',
    config: v1MintConfig,
  },
  {
    id: 'v2_vault',
    roomId: 'coins',
    label: '2. The Sovereign Vault',
    shortName: 'Sovereign Vault',
    description: 'Vaulted marble treasury with wishing well fountain, balance scales, and glistening bullion heaps.',
    year: 1904,
    icon: '🏛️',
    config: v2VaultConfig,
  },
];

RoomVariantManager.registerVariants('coins', COIN_ROOM_VARIANTS, 'v1_mint');

