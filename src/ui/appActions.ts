import { InteractionDispatcher } from './interactionDispatcher';
import { executeMintCrankPress, MintCrankParams } from '../rooms/coins/coinMachineActions';

/**
 * Registers application gameplay action handlers with the generic InteractionDispatcher.
 * Maintained in the application/composition layer so that room modules remain purely
 * declarative and free of UI imports.
 */
export function registerApplicationActions(): void {
  InteractionDispatcher.registerAction('mint_crank_press', (intent) => {
    executeMintCrankPress(intent.params as MintCrankParams | undefined);
  });
}
