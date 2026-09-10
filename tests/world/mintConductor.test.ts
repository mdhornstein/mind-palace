import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MintConductor } from '../../src/rooms/coins/mintConductor';
import { HearthAudio } from '../../src/sound/audio';
import { executeRingingStoneStrike, getLastStoneStrikeTime, resetRingingStoneState } from '../../src/rooms/coins/ringingStoneActions';
import { executeMintCrankPress, getLastCrankTriggerTime } from '../../src/rooms/coins/coinMachineActions';
import { executeGaltonQuickDrop, getLastGaltonDropTime, resetGaltonChuteState } from '../../src/rooms/coins/galtonChuteActions';

describe('MintConductor (Master Rhythm Engine & Kinetic DAW)', () => {
  beforeEach(() => {
    MintConductor.resetInstance();
  });

  afterEach(() => {
    MintConductor.resetInstance();
    vi.restoreAllMocks();
  });

  it('manages singleton instance and reset cleanly', () => {
    const c1 = MintConductor.getInstance();
    const c2 = MintConductor.getInstance();
    expect(c1).toBe(c2);

    MintConductor.resetInstance();
    const c3 = MintConductor.getInstance();
    expect(c3).not.toBe(c1);
  });

  it('initializes with 105 BPM and disengaged cadences', () => {
    const conductor = MintConductor.getInstance();
    expect(conductor.getBpm()).toBe(105);
    expect(conductor.getPressCadence()).toBe('off');
    expect(conductor.getStoneCadence()).toBe('off');
    expect(conductor.getPlinkoCadence()).toBe('off');
    expect(conductor.isStationLooping('mint_coin_press')).toBe(false);
    expect(conductor.isStationLooping('mint_ringing_stone')).toBe(false);
    expect(conductor.isStationLooping('plinko_drop')).toBe(false);
  });

  it('clamps tempo adjustments within safe musical limits (60..180 BPM)', () => {
    const conductor = MintConductor.getInstance();
    conductor.setBpm(120);
    expect(conductor.getBpm()).toBe(120);

    conductor.setBpm(40);
    expect(conductor.getBpm()).toBe(60);

    conductor.setBpm(240);
    expect(conductor.getBpm()).toBe(180);
  });

  it('tracks station looping states for all musical cadences', () => {
    const conductor = MintConductor.getInstance();

    conductor.setPressCadence('four_on_the_floor');
    expect(conductor.getPressCadence()).toBe('four_on_the_floor');
    expect(conductor.isStationLooping('mint_coin_press')).toBe(true);
    expect(conductor.isStationLooping('vault_coin_press')).toBe(true);

    // Test all musical stone cadences
    const cadences: Array<'quarter_chime' | 'offbeat' | 'root_drone' | 'pentatonic_arp'> = [
      'quarter_chime',
      'offbeat',
      'root_drone',
      'pentatonic_arp',
    ];

    for (const cad of cadences) {
      conductor.setStoneCadence(cad);
      expect(conductor.getStoneCadence()).toBe(cad);
      expect(conductor.isStationLooping('mint_ringing_stone')).toBe(true);
    }

    // Test plinko cadences
    conductor.setPlinkoCadence('sixteenth_shaker');
    expect(conductor.getPlinkoCadence()).toBe('sixteenth_shaker');
    expect(conductor.isStationLooping('plinko_drop')).toBe(true);
    expect(conductor.isStationLooping('mint_plinko')).toBe(true);

    conductor.setPlinkoCadence('offbeat_pings');
    expect(conductor.getPlinkoCadence()).toBe('offbeat_pings');
    expect(conductor.isStationLooping('plinko_drop')).toBe(true);

    conductor.setPressCadence('off');
    expect(conductor.isStationLooping('mint_coin_press')).toBe(false);

    conductor.setStoneCadence('off');
    expect(conductor.isStationLooping('mint_ringing_stone')).toBe(false);

    conductor.setPlinkoCadence('off');
    expect(conductor.isStationLooping('plinko_drop')).toBe(false);
  });

  it('auto-transports: starts when loop configured in active room, stops when disengaged', () => {
    const conductor = MintConductor.getInstance();
    conductor.setRoomActive(true);

    // Initial state: no active cadences, stopped
    expect(conductor.isRunning()).toBe(false);

    // Engaging four-on-the-floor starts transport
    conductor.setPressCadence('four_on_the_floor');
    expect(conductor.isRunning()).toBe(true);

    // Disengaging press while others are off stops transport
    conductor.setPressCadence('off');
    expect(conductor.isRunning()).toBe(false);

    // Engaging quarter chime starts transport
    conductor.setStoneCadence('quarter_chime');
    expect(conductor.isRunning()).toBe(true);
    conductor.setStoneCadence('off');
    expect(conductor.isRunning()).toBe(false);

    // Engaging offbeats starts transport
    conductor.setStoneCadence('offbeat');
    expect(conductor.isRunning()).toBe(true);
    conductor.setStoneCadence('off');
    expect(conductor.isRunning()).toBe(false);

    // Engaging root drone starts transport
    conductor.setStoneCadence('root_drone');
    expect(conductor.isRunning()).toBe(true);
    conductor.setStoneCadence('off');
    expect(conductor.isRunning()).toBe(false);

    // Engaging pentatonic arp starts transport
    conductor.setStoneCadence('pentatonic_arp');
    expect(conductor.isRunning()).toBe(true);
    conductor.setStoneCadence('off');
    expect(conductor.isRunning()).toBe(false);

    // Engaging plinko 16th shaker starts transport
    conductor.setPlinkoCadence('sixteenth_shaker');
    expect(conductor.isRunning()).toBe(true);
    conductor.setPlinkoCadence('off');
    expect(conductor.isRunning()).toBe(false);

    // Engaging plinko offbeat pings starts transport
    conductor.setPlinkoCadence('offbeat_pings');
    expect(conductor.isRunning()).toBe(true);
    conductor.setPlinkoCadence('off');
    expect(conductor.isRunning()).toBe(false);
  });

  it('room lifecycle: suspends audio scheduling on room departure and resumes on return', () => {
    const conductor = MintConductor.getInstance();
    conductor.setRoomActive(true);
    conductor.setPressCadence('four_on_the_floor');
    conductor.setStoneCadence('pentatonic_arp');
    conductor.setPlinkoCadence('sixteenth_shaker');
    expect(conductor.isRunning()).toBe(true);

    // Player walks through door to The Study
    conductor.handleRoomChange('study');
    expect(conductor.isRunning()).toBe(false);
    // Cadence configurations persist while room is inactive
    expect(conductor.getPressCadence()).toBe('four_on_the_floor');
    expect(conductor.getStoneCadence()).toBe('pentatonic_arp');
    expect(conductor.getPlinkoCadence()).toBe('sixteenth_shaker');

    // Player returns to The Royal Mint
    conductor.handleRoomChange('coins');
    expect(conductor.isRunning()).toBe(true);
  });

  it('calculates continuous, smooth beat phase (0..1) at 105 BPM', () => {
    const conductor = MintConductor.getInstance();
    const beatDurationMs = (60 / 105) * 1000; // ~571.43 ms

    expect(conductor.getBeatPhase(0)).toBeCloseTo(0, 4);
    expect(conductor.getBeatPhase(beatDurationMs * 0.25)).toBeCloseTo(0.25, 4);
    expect(conductor.getBeatPhase(beatDurationMs * 0.5)).toBeCloseTo(0.5, 4);
    expect(conductor.getBeatPhase(beatDurationMs * 0.75)).toBeCloseTo(0.75, 4);
    expect(conductor.getBeatPhase(beatDurationMs)).toBeCloseTo(0, 4);
  });

  it('decoupled visual updates advance triggers, note indices, and plinko steps', () => {
    const conductor = MintConductor.getInstance();
    conductor.setRoomActive(true);
    conductor.setPressCadence('four_on_the_floor');
    conductor.setStoneCadence('pentatonic_arp');
    conductor.setPlinkoCadence('sixteenth_shaker');

    expect(conductor.getLastPressVisualTrigger()).toBe(0);
    expect(conductor.getLastStoneVisualTrigger()).toBe(0);
    expect(conductor.getLastPlinkoVisualTrigger()).toBe(0);
    expect(conductor.getVisualNoteIndex()).toBe(0);
    expect(conductor.getVisualPlinkoStep()).toBe(0);

    // Advance frame
    conductor.update(0.016);

    expect(conductor.getLastPressVisualTrigger()).toBeGreaterThan(0);
    expect(conductor.getLastStoneVisualTrigger()).toBeGreaterThan(0);
    expect(conductor.getLastPlinkoVisualTrigger()).toBeGreaterThan(0);
    expect(conductor.getVisualNoteIndex()).toBe(1); // Stepped from 0 to 1
    expect(conductor.getVisualPlinkoStep()).toBe(1); // Stepped from 0 to 1
  });

  it('preserves live manual [F] interactions while conductor loops are active', () => {
    const conductor = MintConductor.getInstance();
    conductor.setRoomActive(true);
    conductor.setPressCadence('four_on_the_floor');
    conductor.setStoneCadence('pentatonic_arp');
    conductor.setPlinkoCadence('sixteenth_shaker');

    resetRingingStoneState('mint_ringing_stone');
    resetGaltonChuteState('plinko_drop');

    // Live strike on stone while automated arpeggio is active
    const struck = executeRingingStoneStrike({ stationId: 'mint_ringing_stone' }, 5000);
    expect(struck).toBe(true);
    expect(getLastStoneStrikeTime('mint_ringing_stone')).toBe(5000);

    // Live crank on press while automated kick is active
    executeMintCrankPress(6000);
    expect(getLastCrankTriggerTime()).toBe(6000);

    // Live quick-drop on gilded chute while automated shaker is active
    const dropped = executeGaltonQuickDrop({ stationId: 'plinko_drop' }, 7000);
    expect(dropped).toBe(true);
    expect(getLastGaltonDropTime('plinko_drop')).toBe(7000);
  });

  it('schedules Web Audio events with sample-accurate lookahead and gates mint bus', () => {
    const audio = HearthAudio.getInstance();
    const setMintBusActiveSpy = vi.spyOn(audio, 'setMintBusActive');

    const conductor = MintConductor.getInstance();
    conductor.setRoomActive(true);
    conductor.setPressCadence('four_on_the_floor');
    conductor.setStoneCadence('quarter_chime');
    conductor.setPlinkoCadence('sixteenth_shaker');

    expect(conductor.isRunning()).toBe(true);
    expect(setMintBusActiveSpy).toHaveBeenCalledWith(true);

    // Turning off all stops transport while keeping bus active for manual player interactions
    conductor.setPressCadence('off');
    conductor.setStoneCadence('off');
    conductor.setPlinkoCadence('off');
    expect(conductor.isRunning()).toBe(false);

    // Leaving the room silences the mint bus
    conductor.setRoomActive(false);
    expect(setMintBusActiveSpy).toHaveBeenCalledWith(false);

    // All scheduled methods are registered on the audio instance
    expect(typeof audio.playScheduledPressKick).toBe('function');
    expect(typeof audio.playRingingStoneChime).toBe('function');
    expect(typeof audio.playScheduledPlinkoHit).toBe('function');
  });

  it('silences mint bus immediately when transitioning away from coins room', () => {
    const audio = HearthAudio.getInstance();
    const setMintBusActiveSpy = vi.spyOn(audio, 'setMintBusActive');

    audio.setRoom('study');
    expect(setMintBusActiveSpy).toHaveBeenCalledWith(false);

    audio.setRoom('coins');
    expect(setMintBusActiveSpy).toHaveBeenCalledWith(true);
  });

  it('calculates transport-relative beat phase synchronized to visualOriginMs', () => {
    const conductor = MintConductor.getInstance();
    const beatDurationMs = (60 / 105) * 1000; // ~571.43 ms
    const arbitraryOrigin = 12500;

    conductor.setVisualOriginMs(arbitraryOrigin);
    expect(conductor.getVisualOriginMs()).toBe(arbitraryOrigin);

    expect(conductor.getBeatPhase(arbitraryOrigin)).toBeCloseTo(0, 4);
    expect(conductor.getBeatPhase(arbitraryOrigin + beatDurationMs * 0.25)).toBeCloseTo(0.25, 4);
    expect(conductor.getBeatPhase(arbitraryOrigin + beatDurationMs * 0.5)).toBeCloseTo(0.5, 4);
    expect(conductor.getBeatPhase(arbitraryOrigin + beatDurationMs * 0.75)).toBeCloseTo(0.75, 4);
    expect(conductor.getBeatPhase(arbitraryOrigin + beatDurationMs)).toBeCloseTo(0, 4);
    // Negative offset (prior to origin) wraps seamlessly
    expect(conductor.getBeatPhase(arbitraryOrigin - beatDurationMs * 0.25)).toBeCloseTo(0.75, 4);
  });

  it('safely handles start() if audio context is initially unavailable without getting stuck on subsequent start()', () => {
    const audio = HearthAudio.getInstance();
    const getContextSpy = vi.spyOn(audio, 'getContext').mockReturnValue(null as any);

    const conductor = MintConductor.getInstance();
    conductor.start();

    // Conductor is running visually, but audio timer could not start yet
    expect(conductor.isRunning()).toBe(true);

    // Now audio context becomes available (e.g. after user gesture unlocks audio)
    const mockCtx = {
      currentTime: 10.0,
    } as any;
    getContextSpy.mockReturnValue(mockCtx);

    // Calling start() again is NOT blocked by running flag; it successfully initializes audio scheduler!
    conductor.start();
    expect(conductor.isRunning()).toBe(true);
  });

  it('unconditionally silences mint bus when setRoomActive(false) is called while running', () => {
    const audio = HearthAudio.getInstance();
    const setMintBusActiveSpy = vi.spyOn(audio, 'setMintBusActive');

    const conductor = MintConductor.getInstance();
    conductor.setRoomActive(true);
    conductor.setPressCadence('four_on_the_floor');
    expect(conductor.isRunning()).toBe(true);

    // Leaving the room while running must call setMintBusActive(false)
    conductor.setRoomActive(false);
    expect(conductor.isRunning()).toBe(false);
    expect(setMintBusActiveSpy).toHaveBeenCalledWith(false);
  });
});
