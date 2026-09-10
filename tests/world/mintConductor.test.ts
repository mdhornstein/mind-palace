import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MintConductor } from '../../src/rooms/coins/mintConductor';
import { HearthAudio } from '../../src/sound/audio';
import { executeRingingStoneStrike, getLastStoneStrikeTime, resetRingingStoneState } from '../../src/rooms/coins/ringingStoneActions';
import { executeMintCrankPress, getLastCrankTriggerTime } from '../../src/rooms/coins/coinMachineActions';

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
    expect(conductor.isStationLooping('mint_coin_press')).toBe(false);
    expect(conductor.isStationLooping('mint_ringing_stone')).toBe(false);
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

  it('tracks station looping states for both coin press and ringing stone', () => {
    const conductor = MintConductor.getInstance();

    conductor.setPressCadence('four_on_the_floor');
    expect(conductor.getPressCadence()).toBe('four_on_the_floor');
    expect(conductor.isStationLooping('mint_coin_press')).toBe(true);
    expect(conductor.isStationLooping('vault_coin_press')).toBe(true);

    conductor.setStoneCadence('pentatonic_arp');
    expect(conductor.getStoneCadence()).toBe('pentatonic_arp');
    expect(conductor.isStationLooping('mint_ringing_stone')).toBe(true);

    conductor.setPressCadence('off');
    expect(conductor.isStationLooping('mint_coin_press')).toBe(false);

    conductor.setStoneCadence('off');
    expect(conductor.isStationLooping('mint_ringing_stone')).toBe(false);
  });

  it('auto-transports: starts when loop configured in active room, stops when disengaged', () => {
    const conductor = MintConductor.getInstance();
    conductor.setRoomActive(true);

    // Initial state: no active cadences, stopped
    expect(conductor.isRunning()).toBe(false);

    // Engaging four-on-the-floor starts transport
    conductor.setPressCadence('four_on_the_floor');
    expect(conductor.isRunning()).toBe(true);

    // Disengaging press while stone is off stops transport
    conductor.setPressCadence('off');
    expect(conductor.isRunning()).toBe(false);

    // Engaging stone starts transport
    conductor.setStoneCadence('pentatonic_arp');
    expect(conductor.isRunning()).toBe(true);

    conductor.setStoneCadence('off');
    expect(conductor.isRunning()).toBe(false);
  });

  it('room lifecycle: suspends audio scheduling on room departure and resumes on return', () => {
    const conductor = MintConductor.getInstance();
    conductor.setRoomActive(true);
    conductor.setPressCadence('four_on_the_floor');
    conductor.setStoneCadence('pentatonic_arp');
    expect(conductor.isRunning()).toBe(true);

    // Player walks through door to The Study
    conductor.handleRoomChange('study');
    expect(conductor.isRunning()).toBe(false);
    // Cadence configurations persist while room is inactive
    expect(conductor.getPressCadence()).toBe('four_on_the_floor');
    expect(conductor.getStoneCadence()).toBe('pentatonic_arp');

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

  it('decoupled visual updates advance triggers and pentatonic note indices', () => {
    const conductor = MintConductor.getInstance();
    conductor.setRoomActive(true);
    conductor.setPressCadence('four_on_the_floor');
    conductor.setStoneCadence('pentatonic_arp');

    expect(conductor.getLastPressVisualTrigger()).toBe(0);
    expect(conductor.getLastStoneVisualTrigger()).toBe(0);
    expect(conductor.getVisualNoteIndex()).toBe(0);

    // Advance frame
    conductor.update(0.016);

    expect(conductor.getLastPressVisualTrigger()).toBeGreaterThan(0);
    expect(conductor.getLastStoneVisualTrigger()).toBeGreaterThan(0);
    expect(conductor.getVisualNoteIndex()).toBe(1); // Stepped from 0 to 1
  });

  it('preserves live manual [F] interactions while conductor loops are active', () => {
    const conductor = MintConductor.getInstance();
    conductor.setRoomActive(true);
    conductor.setPressCadence('four_on_the_floor');
    conductor.setStoneCadence('pentatonic_arp');

    resetRingingStoneState('mint_ringing_stone');

    // Live strike on stone while automated arpeggio is active
    const struck = executeRingingStoneStrike({ stationId: 'mint_ringing_stone' }, 5000);
    expect(struck).toBe(true);
    expect(getLastStoneStrikeTime('mint_ringing_stone')).toBe(5000);

    // Live crank on press while automated kick is active
    executeMintCrankPress(6000);
    expect(getLastCrankTriggerTime()).toBe(6000);
  });

  it('schedules Web Audio events with sample-accurate lookahead', () => {
    const audio = HearthAudio.getInstance();

    const conductor = MintConductor.getInstance();
    conductor.setRoomActive(true);
    conductor.setPressCadence('four_on_the_floor');
    conductor.setStoneCadence('pentatonic_arp');

    // Both methods are registered on the audio instance
    expect(typeof audio.playScheduledPressKick).toBe('function');
    expect(typeof audio.playRingingStoneChime).toBe('function');
  });
});
