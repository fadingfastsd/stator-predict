// Stator Physics & Electromagnetic Simulation Engine
// Models permanent magnet motorcycle alternators with arbitrary slot/pole combinations,
// concentrated/distributed windings, winding direction constructive/destructive interference,
// coil resistance, synchronous inductance, diode rectification, and battery/resistive loading.

export const AWG_TABLE = {
  14: { diameter_mm: 1.628, area_mm2: 2.081, ohms_per_m: 0.00828, max_amps: 20 },
  15: { diameter_mm: 1.450, area_mm2: 1.651, ohms_per_m: 0.01044, max_amps: 17 },
  16: { diameter_mm: 1.291, area_mm2: 1.309, ohms_per_m: 0.01317, max_amps: 14 },
  17: { diameter_mm: 1.150, area_mm2: 1.039, ohms_per_m: 0.01661, max_amps: 11.5 },
  18: { diameter_mm: 1.024, area_mm2: 0.823, ohms_per_m: 0.02095, max_amps: 9.5 },
  19: { diameter_mm: 0.912, area_mm2: 0.653, ohms_per_m: 0.02642, max_amps: 7.8 },
  20: { diameter_mm: 0.812, area_mm2: 0.518, ohms_per_m: 0.03331, max_amps: 6.5 },
  21: { diameter_mm: 0.723, area_mm2: 0.410, ohms_per_m: 0.04200, max_amps: 5.2 },
  22: { diameter_mm: 0.644, area_mm2: 0.326, ohms_per_m: 0.05296, max_amps: 4.2 },
  23: { diameter_mm: 0.573, area_mm2: 0.258, ohms_per_m: 0.06679, max_amps: 3.3 },
  24: { diameter_mm: 0.511, area_mm2: 0.205, ohms_per_m: 0.08422, max_amps: 2.6 },
  26: { diameter_mm: 0.405, area_mm2: 0.129, ohms_per_m: 0.1339,  max_amps: 1.6 },
  28: { diameter_mm: 0.321, area_mm2: 0.081, ohms_per_m: 0.2129,  max_amps: 1.0 },
  30: { diameter_mm: 0.255, area_mm2: 0.051, ohms_per_m: 0.3385,  max_amps: 0.6 }
};

export class StatorPhysicsEngine {
  constructor() {
    this.mu0 = 4 * Math.PI * 1e-7; // Vacuum permeability (H/m)
    this.copperResistivity20C = 1.68e-8; // ohm*m
    this.copperTempCoeff = 0.00393; // 1/°C
  }

  /**
   * Calculate tooth and slot geometry from stator outer and inner dimensions.
   */
  calculateGeometry(config) {
    const {
      outerDiameter_mm,
      innerDiameter_mm,
      coreThickness_mm,
      numStatorPoles,
      toothWidth_mm: userToothWidth,
      airGap_mm = 0.8,
      wireAWG,
      turnsPerPole
    } = config;

    const od = outerDiameter_mm;
    const id = innerDiameter_mm;
    const tCore = coreThickness_mm;
    const nPoles = numStatorPoles;

    // Stator yoke (back iron) depth and tooth height estimation
    const totalRadialDepth = (od - id) / 2;
    const yokeThickness_mm = totalRadialDepth * 0.28; // back iron ring
    const shoeHeight_mm = totalRadialDepth * 0.12;   // tooth tip shoe
    const toothHeight_mm = Math.max(2, totalRadialDepth - yokeThickness_mm - shoeHeight_mm);

    // Stator tooth width (default to ~42% of pole pitch at mid-tooth if not overridden)
    const midRadius = id / 2 + yokeThickness_mm + toothHeight_mm / 2;
    const polePitchAtMid_mm = (2 * Math.PI * midRadius) / nPoles;
    const toothWidth_mm = userToothWidth || (polePitchAtMid_mm * 0.45);

    // Tooth cross-sectional area (iron stack area)
    const stackingFactor = 0.95; // Laminated silicon steel
    const toothArea_m2 = (toothWidth_mm * 1e-3) * (tCore * 1e-3) * stackingFactor;

    // Slot cross-sectional area between two teeth available for copper
    const slotPitch_mm = polePitchAtMid_mm - toothWidth_mm;
    const slotArea_mm2 = Math.max(1, slotPitch_mm * toothHeight_mm * 0.85);

    // Wire geometry
    const wireInfo = AWG_TABLE[wireAWG] || AWG_TABLE[18];
    const wireArea_mm2 = wireInfo.area_mm2;
    const insulatedWireDiam_mm = wireInfo.diameter_mm * 1.08; // Enamel insulation
    const insulatedArea_mm2 = Math.PI * Math.pow(insulatedWireDiam_mm / 2, 2);

    // Slot fill factor
    const totalCopperAreaPerSlot = turnsPerPole * insulatedArea_mm2;
    const fillFactor = totalCopperAreaPerSlot / slotArea_mm2;

    // Mean Turn Length (around tooth rectangular perimeter + end turn bulges)
    // Perimeter = 2 * (toothWidth + coreThickness) + corner bend allowances
    const meanTurnLength_m = (2 * (toothWidth_mm + tCore) + Math.PI * (insulatedWireDiam_mm * 5)) * 1e-3;

    return {
      totalRadialDepth_mm: totalRadialDepth,
      yokeThickness_mm,
      shoeHeight_mm,
      toothHeight_mm,
      toothWidth_mm,
      toothArea_m2,
      slotArea_mm2,
      meanTurnLength_m,
      fillFactor,
      wireInfo,
      airGap_mm
    };
  }

  /**
   * Calculate magnetic flux density in air gap and through stator tooth
   */
  calculateMagneticFlux(config, geom) {
    const {
      magnetGauss,
      numRotorPoles,
      numStatorPoles
    } = config;

    // 1 Tesla = 10,000 Gauss
    const Br = magnetGauss / 10000; // Remanence in Tesla (e.g. 8500 G = 0.85 T)
    
    // Airgap flux density accounting for effective permeance and Carter coefficient
    const airgap = geom.airGap_mm;
    const magnetThicknessEst_mm = 3.5; // typical motorcycle flywheel tile magnet thickness
    const leakageFactor = 0.82; // magnetic leakage between adjacent rotor poles
    const carterFactor = 1.15;  // effective slotting factor

    const effectiveAirgap = airgap * carterFactor;
    const Bg_peak = Br * (magnetThicknessEst_mm / (magnetThicknessEst_mm + effectiveAirgap * 1.05)) * leakageFactor;

    // Pole pitch at stator surface
    const rBore = config.outerDiameter_mm / 2; // For outer rotor flywheel
    const tau_p = (2 * Math.PI * (rBore * 1e-3)) / numRotorPoles;
    const poleArea_m2 = tau_p * (config.coreThickness_mm * 1e-3);

    // Peak flux entering a tooth
    // Tooth concentration factor: flux concentrates into tooth tip
    const toothSurfaceArea_m2 = (geom.toothWidth_mm * 1.35 * 1e-3) * (config.coreThickness_mm * 1e-3);
    const fluxPeak_Weber = Math.min(
      Bg_peak * Math.min(poleArea_m2 * 0.75, toothSurfaceArea_m2),
      // Tooth saturation clamp: Silicon steel saturates at ~1.75 - 1.85 Tesla
      1.80 * geom.toothArea_m2
    );

    return {
      Br_Tesla: Br,
      Bg_peak_Tesla: Bg_peak,
      fluxPeak_Weber
    };
  }

  /**
   * Compute per-phase electrical parameters:
   * Induced open-circuit EMF phasor, resistance R, and synchronous inductance L
   */
  analyzeWindingPhases(poles, config, geom, mag) {
    const {
      numStatorPoles,
      numRotorPoles,
      turnsPerPole,
      windingTopology = 'wye', // 'wye', 'delta', 'single_phase', 'custom'
      temperature_C = 65 // Operating temp of stator in hot engine oil
    } = config;

    const rotorPolePairs = numRotorPoles / 2;
    const copperResistivity = this.copperResistivity20C * (1 + this.copperTempCoeff * (temperature_C - 20));

    // Group poles by assigned phase ('A', 'B', 'C', 'AUX', etc.)
    const phaseGroups = {};

    poles.forEach((pole, idx) => {
      if (!pole.enabled || pole.phase === 'NONE' || pole.phase === 'GROUND') return;
      const ph = pole.phase || 'A';
      if (!phaseGroups[ph]) phaseGroups[ph] = [];

      // Mechanical angle of this tooth
      const theta_mech = (idx * 2 * Math.PI) / numStatorPoles;
      // Electrical angle seen by rotor magnet field
      const theta_elec = rotorPolePairs * theta_mech;

      // Turns and direction (+1 CW, -1 CCW)
      const turns = pole.turns || turnsPerPole;
      const direction = pole.direction === 'CCW' ? -1 : 1;

      phaseGroups[ph].push({
        index: idx,
        turns,
        direction,
        theta_mech,
        theta_elec,
        seriesOrder: pole.seriesOrder ?? idx
      });
    });

    const phaseResults = {};

    // Analyze each phase group
    for (const [phaseKey, coilList] of Object.entries(phaseGroups)) {
      if (coilList.length === 0) continue;

      let totalTurns = 0;
      let totalLength_m = 0;

      // Compute phasor sum of induced back-EMF unit vectors:
      // E_phasor = sum( direction_k * turns_k * e^(j * theta_elec_k) )
      let sumReal = 0;
      let sumImag = 0;

      for (const coil of coilList) {
        totalTurns += coil.turns;
        const coilLength = coil.turns * geom.meanTurnLength_m;
        totalLength_m += coilLength;

        // Effective direction includes tooth spatial electrical phase
        const angle = coil.theta_elec;
        const weight = coil.direction * coil.turns;
        sumReal += weight * Math.cos(angle);
        sumImag += weight * Math.sin(angle);
      }

      // Resultant effective turns & winding factor
      const effectiveTurnsPhasorMag = Math.hypot(sumReal, sumImag);
      const phaseAngle_rad = Math.atan2(sumImag, sumReal);
      const windingFactor = totalTurns > 0 ? (effectiveTurnsPhasorMag / totalTurns) : 0;

      // Phase winding resistance
      const wireArea_m2 = geom.wireInfo.area_mm2 * 1e-6;
      const resistance_ohms = (copperResistivity * totalLength_m) / wireArea_m2;

      // Synchronous Inductance (Leakage + Magnetizing inductance per phase)
      // L = N_eff^2 * mu0 * A_tooth / effective_gap + slot leakage
      const effectiveGap_m = (geom.airGap_mm * 1.5) * 1e-3;
      const coilCount = coilList.length;
      const perCoilTurns = totalTurns / (coilCount || 1);
      const selfInductancePerTooth = (Math.pow(perCoilTurns, 2) * this.mu0 * geom.toothArea_m2) / effectiveGap_m;
      // Slot leakage and tooth tip leakage
      const slotLeakageFactor = 1.35;
      const inductance_H = (selfInductancePerTooth * coilCount * slotLeakageFactor);

      // Back-EMF constant Ke (Peak Volts per electrical rad/s)
      // e(t) = -N * dPhi/dt -> E_peak = omega_e * effectiveTurns * fluxPeak
      const Ke_peak_per_elec_rad_sec = effectiveTurnsPhasorMag * mag.fluxPeak_Weber;

      phaseResults[phaseKey] = {
        phase: phaseKey,
        numCoils: coilList.length,
        totalTurns,
        effectiveTurns: effectiveTurnsPhasorMag,
        windingFactor,
        phaseAngle_rad,
        phaseAngle_deg: (phaseAngle_rad * 180 / Math.PI) % 360,
        resistance_ohms,
        inductance_H,
        inductance_mH: inductance_H * 1000,
        totalWireLength_m: totalLength_m,
        Ke_peak_per_elec_rad_sec
      };
    }

    return {
      phaseGroups,
      phaseResults,
      topology: windingTopology
    };
  }

  /**
   * Simulate a single operating point at a specified RPM.
   */
  calculateOperatingPoint(rpm, config, geom, mag, winding) {
    const {
      numRotorPoles,
      loadType = 'battery_14v', // 'battery_14v', 'resistive', 'open_circuit', 'custom'
      loadResistance = 2.5,
      batteryVoltage = 14.4,
      diodeDrop_V = 0.7, // Diode forward voltage drop (silicon = ~0.7V, schottky = ~0.4V)
      windingTopology = 'wye'
    } = config;

    const rotorPolePairs = numRotorPoles / 2;
    const omega_mech = (rpm * 2 * Math.PI) / 60; // rad/s mechanical
    const omega_elec = omega_mech * rotorPolePairs; // rad/s electrical
    const electricalFrequency_Hz = omega_elec / (2 * Math.PI);

    const phases = winding.phaseResults;
    const phaseKeys = Object.keys(phases);

    if (phaseKeys.length === 0) {
      return this.emptyResult(rpm, omega_elec, electricalFrequency_Hz);
    }

    // Check if system is balanced 3-phase (Phases A, B, C)
    const hasThreePhase = phases['A'] && phases['B'] && phases['C'];

    if (hasThreePhase && (windingTopology === 'wye' || windingTopology === 'delta')) {
      return this.simulateThreePhaseSystem({
        rpm,
        omega_elec,
        electricalFrequency_Hz,
        phases,
        topology: windingTopology,
        loadType,
        loadResistance,
        batteryVoltage,
        diodeDrop_V
      });
    } else {
      // Single-phase or arbitrary composite phase simulation
      return this.simulateSingleOrCustomSystem({
        rpm,
        omega_elec,
        electricalFrequency_Hz,
        phases,
        loadType,
        loadResistance,
        batteryVoltage,
        diodeDrop_V
      });
    }
  }

  /**
   * 3-Phase Alternator with Diode Bridge Rectifier and Battery/Load
   */
  simulateThreePhaseSystem(params) {
    const {
      rpm,
      omega_elec,
      electricalFrequency_Hz,
      phases,
      topology,
      loadType,
      loadResistance,
      batteryVoltage,
      diodeDrop_V
    } = params;

    const phA = phases['A'];
    const phB = phases['B'];
    const phC = phases['C'];

    // Average phase parameters
    const Rs_phase = (phA.resistance_ohms + phB.resistance_ohms + phC.resistance_ohms) / 3;
    const Ls_phase = (phA.inductance_H + phB.inductance_H + phC.inductance_H) / 3;
    const Ke_phase = (phA.Ke_peak_per_elec_rad_sec + phB.Ke_peak_per_elec_rad_sec + phC.Ke_peak_per_elec_rad_sec) / 3;

    // Phase peak & RMS open circuit EMF
    const E_phase_peak = omega_elec * Ke_phase;
    const E_phase_rms = E_phase_peak / Math.SQRT2;

    // Line-to-line open circuit voltage
    let E_ll_rms;
    let Rs_equiv;
    let Xs_equiv;

    const Xs_phase = omega_elec * Ls_phase;

    if (topology === 'delta') {
      // In Delta, line voltage is phase voltage, but equivalent source impedance is 1/3 of phase
      E_ll_rms = E_phase_rms;
      Rs_equiv = Rs_phase / 3;
      Xs_equiv = Xs_phase / 3;
    } else {
      // Wye (Star): E_ll = sqrt(3) * E_phase, source impedance is 2 phases in series during rectification
      E_ll_rms = Math.sqrt(3) * E_phase_rms;
      Rs_equiv = 2 * Rs_phase;
      Xs_equiv = 2 * Xs_phase;
    }

    const Zs_equiv = Math.hypot(Rs_equiv, Xs_equiv);

    // Diode bridge rectifier model:
    // Peak line-to-line voltage
    const V_ll_peak = E_ll_rms * Math.SQRT2;
    // Rectifier voltage drop = 2 conducting diodes in bridge
    const V_rectifier_drop = 2 * diodeDrop_V;

    // Open circuit DC voltage after bridge
    const V_dc_oc = Math.max(0, (3 / Math.PI) * V_ll_peak - V_rectifier_drop);

    let V_load = 0;
    let I_load = 0;
    let P_out_watts = 0;
    let P_copper_loss = 0;

    if (loadType === 'open_circuit') {
      V_load = V_dc_oc;
      I_load = 0;
      P_out_watts = 0;
      P_copper_loss = 0;
    } else if (loadType === 'battery_14v') {
      // 14.4V charging system with shunt/series regulator
      const V_bat = batteryVoltage;
      // Stator only charges battery when open-circuit rectifier voltage exceeds battery voltage
      if (V_dc_oc > V_bat) {
        // Effective voltage driving current through stator impedance
        const V_drive = V_dc_oc - V_bat;
        // Current is limited by stator resistance and synchronous reactance (inductive limit!)
        const I_dc = V_drive / Math.max(0.1, Zs_equiv);
        
        I_load = I_dc;
        V_load = V_bat;
        P_out_watts = V_load * I_load;

        // Copper losses in 3 phases (I_rms per phase ~ I_dc * sqrt(2/3))
        const I_phase_rms = I_dc * Math.sqrt(2 / 3);
        P_copper_loss = 3 * Math.pow(I_phase_rms, 2) * Rs_phase;
      } else {
        V_load = V_dc_oc;
        I_load = 0;
        P_out_watts = 0;
        P_copper_loss = 0;
      }
    } else {
      // Resistive or Matched Load
      const R_L = Math.max(0.01, loadResistance);
      // DC equivalent impedance calculation
      const Z_total = Math.hypot(Rs_equiv + R_L, Xs_equiv);
      const I_dc = Math.max(0, (V_dc_oc) / Math.max(0.05, Z_total));
      I_load = I_dc;
      V_load = I_dc * R_L;
      P_out_watts = Math.pow(I_dc, 2) * R_L;

      const I_phase_rms = I_dc * Math.sqrt(2 / 3);
      P_copper_loss = 3 * Math.pow(I_phase_rms, 2) * Rs_phase;
    }

    // Iron core losses estimation (Eddy current + Hysteresis ~ f^1.5 * B^2)
    const freqNorm = electricalFrequency_Hz / 100;
    const P_iron_loss = 2.5 * Math.pow(freqNorm, 1.5);

    const total_input_power = P_out_watts + P_copper_loss + P_iron_loss;
    const efficiency = total_input_power > 0 ? (P_out_watts / total_input_power) * 100 : 0;

    return {
      rpm,
      omega_elec,
      electricalFrequency_Hz,
      E_phase_rms,
      E_ll_rms,
      V_dc_oc,
      V_load,
      I_load,
      P_out_watts,
      P_copper_loss,
      P_iron_loss,
      efficiency,
      Rs_phase,
      Xs_phase,
      Zs_equiv,
      topology
    };
  }

  /**
   * Single-phase or non-standard wound stators (e.g. vintage 8-pole dirt bikes)
   */
  simulateSingleOrCustomSystem(params) {
    const {
      rpm,
      omega_elec,
      electricalFrequency_Hz,
      phases,
      loadType,
      loadResistance,
      batteryVoltage,
      diodeDrop_V
    } = params;

    // Sum all active phases into single circuit or take main active phase
    let primaryPhase = phases['A'] || Object.values(phases)[0];

    const Rs = primaryPhase.resistance_ohms;
    const Ls = primaryPhase.inductance_H;
    const Ke = primaryPhase.Ke_peak_per_elec_rad_sec;

    const Xs = omega_elec * Ls;
    const Zs = Math.hypot(Rs, Xs);

    const E_peak = omega_elec * Ke;
    const E_rms = E_peak / Math.SQRT2;

    // Full-wave bridge rectifier (2 diode drops)
    const V_rectifier_drop = 2 * diodeDrop_V;
    const V_dc_oc = Math.max(0, (2 / Math.PI) * E_peak - V_rectifier_drop);

    let V_load = 0;
    let I_load = 0;
    let P_out_watts = 0;
    let P_copper_loss = 0;

    if (loadType === 'open_circuit') {
      V_load = V_dc_oc;
      I_load = 0;
      P_out_watts = 0;
    } else if (loadType === 'battery_14v') {
      const V_bat = batteryVoltage;
      if (V_dc_oc > V_bat) {
        const V_drive = V_dc_oc - V_bat;
        I_load = V_drive / Math.max(0.1, Zs);
        V_load = V_bat;
        P_out_watts = V_load * I_load;
        P_copper_loss = Math.pow(I_load, 2) * Rs;
      } else {
        V_load = V_dc_oc;
        I_load = 0;
        P_out_watts = 0;
      }
    } else {
      const R_L = Math.max(0.01, loadResistance);
      const Z_total = Math.hypot(Rs + R_L, Xs);
      I_load = Math.max(0, V_dc_oc / Math.max(0.05, Z_total));
      V_load = I_load * R_L;
      P_out_watts = Math.pow(I_load, 2) * R_L;
      P_copper_loss = Math.pow(I_load, 2) * Rs;
    }

    const freqNorm = electricalFrequency_Hz / 100;
    const P_iron_loss = 1.5 * Math.pow(freqNorm, 1.5);
    const total_input_power = P_out_watts + P_copper_loss + P_iron_loss;
    const efficiency = total_input_power > 0 ? (P_out_watts / total_input_power) * 100 : 0;

    return {
      rpm,
      omega_elec,
      electricalFrequency_Hz,
      E_phase_rms: E_rms,
      E_ll_rms: E_rms,
      V_dc_oc,
      V_load,
      I_load,
      P_out_watts,
      P_copper_loss,
      P_iron_loss,
      efficiency,
      Rs_phase: Rs,
      Xs_phase: Xs,
      Zs_equiv: Zs,
      topology: 'single_phase'
    };
  }

  emptyResult(rpm, omega_elec, electricalFrequency_Hz) {
    return {
      rpm,
      omega_elec,
      electricalFrequency_Hz,
      E_phase_rms: 0,
      E_ll_rms: 0,
      V_dc_oc: 0,
      V_load: 0,
      I_load: 0,
      P_out_watts: 0,
      P_copper_loss: 0,
      P_iron_loss: 0,
      efficiency: 0,
      Rs_phase: 0,
      Xs_phase: 0,
      Zs_equiv: 0,
      topology: 'none'
    };
  }

  /**
   * Run full RPM sweep from startRpm (500) to endRpm (10,000)
   */
  runRpmSweep(poles, config, startRpm = 500, endRpm = 10000, stepRpm = 250) {
    const geom = this.calculateGeometry(config);
    const mag = this.calculateMagneticFlux(config, geom);
    const winding = this.analyzeWindingPhases(poles, config, geom, mag);

    const points = [];
    let maxPower = 0;
    let peakPowerRpm = 0;
    let cutInRpm = null; // RPM where power starts flowing (>1W)

    for (let rpm = startRpm; rpm <= endRpm; rpm += stepRpm) {
      const pt = this.calculateOperatingPoint(rpm, config, geom, mag, winding);
      points.push(pt);

      if (pt.P_out_watts > maxPower) {
        maxPower = pt.P_out_watts;
        peakPowerRpm = rpm;
      }

      if (cutInRpm === null && pt.P_out_watts >= 1.0) {
        cutInRpm = rpm;
      }
    }

    return {
      geometry: geom,
      magnetic: mag,
      winding,
      points,
      peakPower_W: maxPower,
      peakPowerRpm,
      cutInRpm: cutInRpm || startRpm
    };
  }

  /**
   * Generate instantaneous waveforms for oscilloscope (e.g. at current RPM)
   */
  generateWaveforms(rpm, config, winding, numSamples = 120) {
    const rotorPolePairs = config.numRotorPoles / 2;
    const omega_mech = (rpm * 2 * Math.PI) / 60;
    const omega_elec = omega_mech * rotorPolePairs;

    const timePerRev = (2 * Math.PI) / omega_mech;
    const dt = timePerRev / numSamples;

    const waveforms = {
      time: [],
      phaseA: [],
      phaseB: [],
      phaseC: [],
      rectifiedDc: []
    };

    const phA = winding.phaseResults['A'];
    const phB = winding.phaseResults['B'];
    const phC = winding.phaseResults['C'];

    for (let i = 0; i < numSamples; i++) {
      const t = i * dt;
      const theta_m = omega_mech * t;
      const theta_e = rotorPolePairs * theta_m;

      waveforms.time.push(t * 1000); // ms

      const vA = phA ? omega_elec * phA.Ke_peak_per_elec_rad_sec * Math.sin(theta_e + phA.phaseAngle_rad) : 0;
      const vB = phB ? omega_elec * phB.Ke_peak_per_elec_rad_sec * Math.sin(theta_e + phB.phaseAngle_rad) : 0;
      const vC = phC ? omega_elec * phC.Ke_peak_per_elec_rad_sec * Math.sin(theta_e + phC.phaseAngle_rad) : 0;

      waveforms.phaseA.push(vA);
      waveforms.phaseB.push(vB);
      waveforms.phaseC.push(vC);

      // Rectified DC envelope
      const vMax = Math.max(vA, vB, vC);
      const vMin = Math.min(vA, vB, vC);
      const vDc = Math.max(0, (vMax - vMin) - 1.4);
      waveforms.rectifiedDc.push(vDc);
    }

    return waveforms;
  }
}
