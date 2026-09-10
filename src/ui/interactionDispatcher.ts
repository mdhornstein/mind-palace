import { InteractionIntent, ModalId, Direction } from '../core/types';
import { StateManager } from '../core/state';
import { openLibraryModal } from './libraryModal';
import { openCabinetModal } from './cabinetModal';
import { openWorkshopModal } from './workshopModal';
import { openDuckephantModal } from './duckephantModal';
import { openTelescopeModal } from './telescopeModal';
import { openOrreryModal } from './orreryModal';
import { openStarChartModal } from './starChartModal';
import {
  openWaterfallModal,
  openDrawingHandsModal,
  openMobiusModal,
  openPenroseModal,
} from './escherModals';
import {
  openEscherArtworkModal,
} from './escherArtModal';
import {
  openCoinPressModal,
  openPlinkoModal,
  openWishingWellModal,
  openVaultScaleModal,
  openRingingStoneModal,
} from './coinModals';
import { duckephantEntity } from '../rooms/study/stations/duckephant';

export interface InteractionContext {
  stateManager: StateManager;
  transitionToRoom: (
    roomId: string,
    targetSpawnPoint?: { x: number; y: number; facing: Direction }
  ) => void;
}

export type ModalHandler = (intent: InteractionIntent & { type: 'modal' }, context: InteractionContext) => void;
export type CustomActionHandler = (
  intent: InteractionIntent & { type: 'custom' },
  context: InteractionContext
) => void;

/**
 * Interaction Dispatcher.
 * Presentation layer bridge that receives declarative InteractionIntents
 * and routes them to concrete DOM UI modals or room transitions.
 * Strictly validates parameter contracts and fails loudly on unsupported keys/values.
 */
export class InteractionDispatcher {
  private static modalRegistry: Map<ModalId, ModalHandler> = new Map([
    [
      'library',
      (intent, context) => {
        InteractionDispatcher.validateNoParams('library', intent.params);
        openLibraryModal(context.stateManager);
      },
    ],
    [
      'cabinet',
      (intent, context) => {
        let initialSpecimenId: string | undefined;

        if (intent.params) {
          const allowedKeys = ['initialSpecimenIdSource'];
          for (const key of Object.keys(intent.params)) {
            if (!allowedKeys.includes(key)) {
              throw new Error(
                `[InteractionDispatcher] Unknown parameter "${key}" for modal "cabinet"`
              );
            }
          }

          if (intent.params.initialSpecimenIdSource !== undefined) {
            if (intent.params.initialSpecimenIdSource === 'activePedestal') {
              initialSpecimenId =
                context.stateManager.getState().environment.activePedestalSpecimenId || undefined;
            } else {
              throw new Error(
                `[InteractionDispatcher] Invalid initialSpecimenIdSource "${String(
                  intent.params.initialSpecimenIdSource
                )}" for modal "cabinet"`
              );
            }
          }
        }

        openCabinetModal(context.stateManager, initialSpecimenId);
      },
    ],
    [
      'workshop',
      (intent, context) => {
        InteractionDispatcher.validateNoParams('workshop', intent.params);
        openWorkshopModal(context.stateManager);
      },
    ],
    [
      'duckephant',
      (intent) => {
        InteractionDispatcher.validateNoParams('duckephant', intent.params);
        openDuckephantModal(duckephantEntity);
      },
    ],
    [
      'telescope',
      (intent, context) => {
        InteractionDispatcher.validateNoParams('telescope', intent.params);
        openTelescopeModal(context.stateManager);
      },
    ],
    [
      'orrery',
      (intent, context) => {
        InteractionDispatcher.validateNoParams('orrery', intent.params);
        openOrreryModal(context.stateManager);
      },
    ],
    [
      'star_chart',
      (intent, context) => {
        InteractionDispatcher.validateNoParams('star_chart', intent.params);
        openStarChartModal(context.stateManager);
      },
    ],
    [
      'escher_waterfall',
      (intent, context) => {
        InteractionDispatcher.validateNoParams('escher_waterfall', intent.params);
        openWaterfallModal(context.stateManager);
      },
    ],
    [
      'escher_drawing_hands',
      (intent, context) => {
        InteractionDispatcher.validateNoParams('escher_drawing_hands', intent.params);
        openDrawingHandsModal(context.stateManager);
      },
    ],
    [
      'escher_mobius',
      (intent, context) => {
        InteractionDispatcher.validateNoParams('escher_mobius', intent.params);
        openMobiusModal(context.stateManager);
      },
    ],
    [
      'escher_penrose_stairs',
      (intent, context) => {
        InteractionDispatcher.validateNoParams('escher_penrose_stairs', intent.params);
        openPenroseModal(context.stateManager);
      },
    ],
    [
      'escher_artwork',
      (intent) => {
        let artworkId = 'print_gallery';
        if (intent.params) {
          const allowedKeys = ['artworkId'];
          for (const key of Object.keys(intent.params)) {
            if (!allowedKeys.includes(key)) {
              throw new Error(
                `[InteractionDispatcher] Unknown parameter "${key}" for modal "escher_artwork"`
              );
            }
          }
          if (intent.params.artworkId !== undefined) {
            if (typeof intent.params.artworkId === 'string' && intent.params.artworkId.length > 0) {
              artworkId = intent.params.artworkId;
            } else {
              throw new Error(
                `[InteractionDispatcher] Invalid artworkId "${String(
                  intent.params.artworkId
                )}" for modal "escher_artwork"`
              );
            }
          }
        }
        openEscherArtworkModal(artworkId);
      },
    ],
    [
      'coin_press',
      (intent) => {
        InteractionDispatcher.validateNoParams('coin_press', intent.params);
        openCoinPressModal();
      },
    ],
    [
      'plinko_game',
      (intent) => {
        InteractionDispatcher.validateNoParams('plinko_game', intent.params);
        openPlinkoModal();
      },
    ],
    [
      'vault_wishing_well',
      (intent) => {
        InteractionDispatcher.validateNoParams('vault_wishing_well', intent.params);
        openWishingWellModal();
      },
    ],
    [
      'vault_scale',
      (intent) => {
        InteractionDispatcher.validateNoParams('vault_scale', intent.params);
        openVaultScaleModal();
      },
    ],
    [
      'ringing_stone',
      (intent) => {
        InteractionDispatcher.validateNoParams('ringing_stone', intent.params);
        openRingingStoneModal();
      },
    ],
  ]);

  private static actionRegistry: Map<string, CustomActionHandler> = new Map();

  public static registerAction(actionId: string, handler: CustomActionHandler): void {
    this.actionRegistry.set(actionId, handler);
  }

  public static unregisterAction(actionId: string): void {
    this.actionRegistry.delete(actionId);
  }

  public static getRegisteredActionIds(): string[] {
    return Array.from(this.actionRegistry.keys());
  }

  private static validateNoParams(
    modalId: ModalId,
    params?: Record<string, string | number | boolean>
  ): void {
    if (params && Object.keys(params).length > 0) {
      throw new Error(
        `[InteractionDispatcher] Modal "${modalId}" does not accept parameters, but received: ${JSON.stringify(
          params
        )}`
      );
    }
  }

  /**
   * Dispatches an interaction intent using the provided application context.
   */
  public static dispatch(intent: InteractionIntent, context: InteractionContext): void {
    if (intent.type === 'door') {
      context.transitionToRoom(intent.targetRoomId, intent.targetSpawnPoint);
      return;
    }

    if (intent.type === 'modal') {
      const handler = this.modalRegistry.get(intent.modalId);
      if (!handler) {
        throw new Error(
          `[InteractionDispatcher] No modal handler registered for modalId "${intent.modalId}"`
        );
      }
      handler(intent, context);
      return;
    }

    if (intent.type === 'custom') {
      const handler = this.actionRegistry.get(intent.actionId);
      if (!handler) {
        console.warn(`[InteractionDispatcher] Unhandled custom interaction: ${intent.actionId}`);
        return;
      }
      handler(intent, context);
      return;
    }
  }

  /**
   * Returns all registered modal IDs for testing and registry completeness validation.
   */
  public static getRegisteredModalIds(): ModalId[] {
    return Array.from(this.modalRegistry.keys());
  }
}
