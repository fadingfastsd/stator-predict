// Stator Predict - Complete Unified Engine & Application Bundle
// Zero-dependency, file:// safe, works in any browser without web server or compilation.

(function() {
  'use strict';

  // ==========================================
  // 1. WIRE AWG TABLE
  // ==========================================
  const AWG_TABLE = {
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

  // ==========================================
  // 2. MOTORCYCLE PRESETS
  // ==========================================
  const PRESETS = {
    "12p_14m_wye": {
      name: "Modern 12-Pole / 14-Magnet (3-Phase Wye)",
      description: "Standard OEM configuration for modern sportbikes and streetbikes (e.g. Honda CBR, Suzuki SV650, Yamaha MT-07). High efficiency, smooth 3-phase output.",
      outerDiameter_mm: 115,
      innerDiameter_mm: 54,
      coreThickness_mm: 22,
      numStatorPoles: 12,
      numRotorPoles: 14,
      magnetGauss: 8500,
      wireAWG: 18,
      turnsPerPole: 38,
      windingTopology: "wye",
      loadType: "battery_14v",
      batteryVoltage: 14.4,
      loadResistance: 2.5,
      airGap_mm: 0.8,
      poles: [
        { id: 0,  phase: "A", direction: "CW",  turns: 38, enabled: true },
        { id: 1,  phase: "B", direction: "CCW", turns: 38, enabled: true },
        { id: 2,  phase: "C", direction: "CW",  turns: 38, enabled: true },
        { id: 3,  phase: "A", direction: "CCW", turns: 38, enabled: true },
        { id: 4,  phase: "B", direction: "CW",  turns: 38, enabled: true },
        { id: 5,  phase: "C", direction: "CCW", turns: 38, enabled: true },
        { id: 6,  phase: "A", direction: "CW",  turns: 38, enabled: true },
        { id: 7,  phase: "B", direction: "CCW", turns: 38, enabled: true },
        { id: 8,  phase: "C", direction: "CW",  turns: 38, enabled: true },
        { id: 9,  phase: "A", direction: "CCW", turns: 38, enabled: true },
        { id: 10, phase: "B", direction: "CW",  turns: 38, enabled: true },
        { id: 11, phase: "C", direction: "CCW", turns: 38, enabled: true }
      ]
    },
    "18p_12m_heavy": {
      name: "Heavy-Duty 18-Pole / 12-Magnet (3-Phase Wye)",
      description: "High-capacity touring & superbike stator (e.g. Honda Goldwing, Harley Twin Cam, Suzuki GSX-R). Delivers 400W+ for heated gear and accessories.",
      outerDiameter_mm: 130,
      innerDiameter_mm: 68,
      coreThickness_mm: 28,
      numStatorPoles: 18,
      numRotorPoles: 12,
      magnetGauss: 9200,
      wireAWG: 17,
      turnsPerPole: 30,
      windingTopology: "wye",
      loadType: "battery_14v",
      batteryVoltage: 14.4,
      loadResistance: 1.8,
      airGap_mm: 0.9,
      poles: [
        { id: 0,  phase: "A", direction: "CW",  turns: 30, enabled: true },
        { id: 1,  phase: "A", direction: "CCW", turns: 30, enabled: true },
        { id: 2,  phase: "B", direction: "CW",  turns: 30, enabled: true },
        { id: 3,  phase: "B", direction: "CCW", turns: 30, enabled: true },
        { id: 4,  phase: "C", direction: "CW",  turns: 30, enabled: true },
        { id: 5,  phase: "C", direction: "CCW", turns: 30, enabled: true },
        { id: 6,  phase: "A", direction: "CW",  turns: 30, enabled: true },
        { id: 7,  phase: "A", direction: "CCW", turns: 30, enabled: true },
        { id: 8,  phase: "B", direction: "CW",  turns: 30, enabled: true },
        { id: 9,  phase: "B", direction: "CCW", turns: 30, enabled: true },
        { id: 10, phase: "C", direction: "CW",  turns: 30, enabled: true },
        { id: 11, phase: "C", direction: "CCW", turns: 30, enabled: true },
        { id: 12, phase: "A", direction: "CW",  turns: 30, enabled: true },
        { id: 13, phase: "A", direction: "CCW", turns: 30, enabled: true },
        { id: 14, phase: "B", direction: "CW",  turns: 30, enabled: true },
        { id: 15, phase: "B", direction: "CCW", turns: 30, enabled: true },
        { id: 16, phase: "C", direction: "CW",  turns: 30, enabled: true },
        { id: 17, phase: "C", direction: "CCW", turns: 30, enabled: true }
      ]
    },
    "12p_14m_delta": {
      name: "Racing High-Amp 12-Pole Delta (Δ)",
      description: "Delta connected stator for high current at mid-to-high RPM.",
      outerDiameter_mm: 115,
      innerDiameter_mm: 54,
      coreThickness_mm: 24,
      numStatorPoles: 12,
      numRotorPoles: 14,
      magnetGauss: 9000,
      wireAWG: 17,
      turnsPerPole: 42,
      windingTopology: "delta",
      loadType: "battery_14v",
      batteryVoltage: 14.4,
      loadResistance: 2.0,
      airGap_mm: 0.8,
      poles: [
        { id: 0,  phase: "A", direction: "CW",  turns: 42, enabled: true },
        { id: 1,  phase: "B", direction: "CCW", turns: 42, enabled: true },
        { id: 2,  phase: "C", direction: "CW",  turns: 42, enabled: true },
        { id: 3,  phase: "A", direction: "CCW", turns: 42, enabled: true },
        { id: 4,  phase: "B", direction: "CW",  turns: 42, enabled: true },
        { id: 5,  phase: "C", direction: "CCW", turns: 42, enabled: true },
        { id: 6,  phase: "A", direction: "CW",  turns: 42, enabled: true },
        { id: 7,  phase: "B", direction: "CCW", turns: 42, enabled: true },
        { id: 8,  phase: "C", direction: "CW",  turns: 42, enabled: true },
        { id: 9,  phase: "A", direction: "CCW", turns: 42, enabled: true },
        { id: 10, phase: "B", direction: "CW",  turns: 42, enabled: true },
        { id: 11, phase: "C", direction: "CCW", turns: 42, enabled: true }
      ]
    },
    "8p_6m_single": {
      name: "Vintage Trail/Dirt Bike 8-Pole Single-Phase",
      description: "Classic vintage single-phase full-wave system (Honda CT90 / XR200, Yamaha TT250).",
      outerDiameter_mm: 88,
      innerDiameter_mm: 36,
      coreThickness_mm: 16,
      numStatorPoles: 8,
      numRotorPoles: 6,
      magnetGauss: 6200,
      wireAWG: 20,
      turnsPerPole: 65,
      windingTopology: "single_phase",
      loadType: "battery_14v",
      batteryVoltage: 14.4,
      loadResistance: 3.5,
      airGap_mm: 0.7,
      poles: [
        { id: 0, phase: "A", direction: "CW",  turns: 65, enabled: true },
        { id: 1, phase: "A", direction: "CCW", turns: 65, enabled: true },
        { id: 2, phase: "A", direction: "CW",  turns: 65, enabled: true },
        { id: 3, phase: "A", direction: "CCW", turns: 65, enabled: true },
        { id: 4, phase: "A", direction: "CW",  turns: 65, enabled: true },
        { id: 5, phase: "A", direction: "CCW", turns: 65, enabled: true },
        { id: 6, phase: "A", direction: "CW",  turns: 65, enabled: true },
        { id: 7, phase: "A", direction: "CCW", turns: 65, enabled: true }
      ]
    },
    "6p_4m_vintage": {
      name: "Vintage 6-Pole Dual-Circuit Enduro",
      description: "Split stator: 4 poles wound for AC headlight system, 2 poles wound for DC battery charging.",
      outerDiameter_mm: 80,
      innerDiameter_mm: 32,
      coreThickness_mm: 14,
      numStatorPoles: 6,
      numRotorPoles: 4,
      magnetGauss: 5800,
      wireAWG: 21,
      turnsPerPole: 70,
      windingTopology: "single_phase",
      loadType: "resistive",
      batteryVoltage: 14.4,
      loadResistance: 4.0,
      airGap_mm: 0.75,
      poles: [
        { id: 0, phase: "A",   direction: "CW",  turns: 70, enabled: true },
        { id: 1, phase: "A",   direction: "CCW", turns: 70, enabled: true },
        { id: 2, phase: "A",   direction: "CW",  turns: 70, enabled: true },
        { id: 3, phase: "A",   direction: "CCW", turns: 70, enabled: true },
        { id: 4, phase: "AUX", direction: "CW",  turns: 90, enabled: true },
        { id: 5, phase: "AUX", direction: "CCW", turns: 90, enabled: true }
      ]
    }
  };

  // ==========================================
  // 3. STATOR PHYSICS ENGINE
  // ==========================================
  class StatorPhysicsEngine {
    constructor() {
      this.mu0 = 4 * Math.PI * 1e-7;
      this.copperResistivity20C = 1.68e-8;
      this.copperTempCoeff = 0.00393;
    }

    calculateGeometry(config) {
      const {
        outerDiameter_mm: od,
        innerDiameter_mm: id,
        coreThickness_mm: tCore,
        numStatorPoles: nPoles,
        toothWidth_mm: userToothWidth,
        airGap_mm = 0.8,
        wireAWG,
        turnsPerPole
      } = config;

      const totalRadialDepth = (od - id) / 2;
      const yokeThickness_mm = totalRadialDepth * 0.28;
      const shoeHeight_mm = totalRadialDepth * 0.12;
      const toothHeight_mm = Math.max(2, totalRadialDepth - yokeThickness_mm - shoeHeight_mm);

      const midRadius = id / 2 + yokeThickness_mm + toothHeight_mm / 2;
      const polePitchAtMid_mm = (2 * Math.PI * midRadius) / nPoles;
      const toothWidth_mm = userToothWidth || (polePitchAtMid_mm * 0.45);

      const stackingFactor = 0.95;
      const toothArea_m2 = (toothWidth_mm * 1e-3) * (tCore * 1e-3) * stackingFactor;

      const slotPitch_mm = polePitchAtMid_mm - toothWidth_mm;
      const slotArea_mm2 = Math.max(1, slotPitch_mm * toothHeight_mm * 0.85);

      const wireInfo = AWG_TABLE[wireAWG] || AWG_TABLE[18];
      const insulatedWireDiam_mm = wireInfo.diameter_mm * 1.08;
      const insulatedArea_mm2 = Math.PI * Math.pow(insulatedWireDiam_mm / 2, 2);

      const totalCopperAreaPerSlot = turnsPerPole * insulatedArea_mm2;
      const fillFactor = totalCopperAreaPerSlot / slotArea_mm2;

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

    calculateMagneticFlux(config, geom) {
      const { magnetGauss, numRotorPoles } = config;
      const Br = magnetGauss / 10000;
      const airgap = geom.airGap_mm;
      const magnetThicknessEst_mm = 3.5;
      const leakageFactor = 0.82;
      const carterFactor = 1.15;

      const effectiveAirgap = airgap * carterFactor;
      const Bg_peak = Br * (magnetThicknessEst_mm / (magnetThicknessEst_mm + effectiveAirgap * 1.05)) * leakageFactor;

      const rBore = config.outerDiameter_mm / 2;
      const tau_p = (2 * Math.PI * (rBore * 1e-3)) / numRotorPoles;
      const poleArea_m2 = tau_p * (config.coreThickness_mm * 1e-3);

      const toothSurfaceArea_m2 = (geom.toothWidth_mm * 1.35 * 1e-3) * (config.coreThickness_mm * 1e-3);
      const fluxPeak_Weber = Math.min(
        Bg_peak * Math.min(poleArea_m2 * 0.75, toothSurfaceArea_m2),
        1.80 * geom.toothArea_m2
      );

      return {
        Br_Tesla: Br,
        Bg_peak_Tesla: Bg_peak,
        fluxPeak_Weber
      };
    }

    analyzeWindingPhases(poles, config, geom, mag) {
      const {
        numStatorPoles,
        numRotorPoles,
        turnsPerPole,
        windingTopology = 'wye',
        temperature_C = 65
      } = config;

      const rotorPolePairs = numRotorPoles / 2;
      const copperResistivity = this.copperResistivity20C * (1 + this.copperTempCoeff * (temperature_C - 20));

      const phaseGroups = {};
      poles.forEach((pole, idx) => {
        if (!pole.enabled || pole.phase === 'NONE' || pole.phase === 'GROUND') return;
        const ph = pole.phase || 'A';
        if (!phaseGroups[ph]) phaseGroups[ph] = [];

        const theta_mech = (idx * 2 * Math.PI) / numStatorPoles;
        const theta_elec = rotorPolePairs * theta_mech;
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
      for (const [phaseKey, coilList] of Object.entries(phaseGroups)) {
        if (coilList.length === 0) continue;

        let totalTurns = 0;
        let totalLength_m = 0;
        let sumReal = 0;
        let sumImag = 0;

        for (const coil of coilList) {
          totalTurns += coil.turns;
          const coilLength = coil.turns * geom.meanTurnLength_m;
          totalLength_m += coilLength;

          const angle = coil.theta_elec;
          const weight = coil.direction * coil.turns;
          sumReal += weight * Math.cos(angle);
          sumImag += weight * Math.sin(angle);
        }

        const effectiveTurnsPhasorMag = Math.hypot(sumReal, sumImag);
        const phaseAngle_rad = Math.atan2(sumImag, sumReal);
        const windingFactor = totalTurns > 0 ? (effectiveTurnsPhasorMag / totalTurns) : 0;

        const wireArea_m2 = geom.wireInfo.area_mm2 * 1e-6;
        const resistance_ohms = (copperResistivity * totalLength_m) / wireArea_m2;

        const effectiveGap_m = (geom.airGap_mm * 1.5) * 1e-3;
        const coilCount = coilList.length;
        const perCoilTurns = totalTurns / (coilCount || 1);
        const selfInductancePerTooth = (Math.pow(perCoilTurns, 2) * this.mu0 * geom.toothArea_m2) / effectiveGap_m;
        const slotLeakageFactor = 1.35;
        const inductance_H = (selfInductancePerTooth * coilCount * slotLeakageFactor);

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

    calculateOperatingPoint(rpm, config, geom, mag, winding) {
      const {
        numRotorPoles,
        loadType = 'battery_14v',
        loadResistance = 2.5,
        batteryVoltage = 14.4,
        diodeDrop_V = 0.7,
        windingTopology = 'wye'
      } = config;

      const rotorPolePairs = numRotorPoles / 2;
      const omega_mech = (rpm * 2 * Math.PI) / 60;
      const omega_elec = omega_mech * rotorPolePairs;
      const electricalFrequency_Hz = omega_elec / (2 * Math.PI);

      const phases = winding.phaseResults;
      const phaseKeys = Object.keys(phases);

      if (phaseKeys.length === 0) {
        return {
          rpm, omega_elec, electricalFrequency_Hz,
          E_phase_rms: 0, E_ll_rms: 0, V_dc_oc: 0, V_load: 0,
          I_load: 0, P_out_watts: 0, P_copper_loss: 0, P_iron_loss: 0,
          efficiency: 0, Rs_phase: 0, Xs_phase: 0, Zs_equiv: 0, topology: 'none'
        };
      }

      const hasThreePhase = phases['A'] && phases['B'] && phases['C'];

      if (hasThreePhase && (windingTopology === 'wye' || windingTopology === 'delta')) {
        const phA = phases['A'];
        const phB = phases['B'];
        const phC = phases['C'];

        const Rs_phase = (phA.resistance_ohms + phB.resistance_ohms + phC.resistance_ohms) / 3;
        const Ls_phase = (phA.inductance_H + phB.inductance_H + phC.inductance_H) / 3;
        const Ke_phase = (phA.Ke_peak_per_elec_rad_sec + phB.Ke_peak_per_elec_rad_sec + phC.Ke_peak_per_elec_rad_sec) / 3;

        const E_phase_peak = omega_elec * Ke_phase;
        const E_phase_rms = E_phase_peak / Math.SQRT2;

        let E_ll_rms, Rs_equiv, Xs_equiv;
        const Xs_phase = omega_elec * Ls_phase;

        if (windingTopology === 'delta') {
          E_ll_rms = E_phase_rms;
          Rs_equiv = Rs_phase / 3;
          Xs_equiv = Xs_phase / 3;
        } else {
          E_ll_rms = Math.sqrt(3) * E_phase_rms;
          Rs_equiv = 2 * Rs_phase;
          Xs_equiv = 2 * Xs_phase;
        }

        const Zs_equiv = Math.hypot(Rs_equiv, Xs_equiv);
        const V_ll_peak = E_ll_rms * Math.SQRT2;
        const V_rectifier_drop = 2 * diodeDrop_V;
        const V_dc_oc = Math.max(0, (3 / Math.PI) * V_ll_peak - V_rectifier_drop);

        let V_load = 0;
        let I_load = 0;
        let P_out_watts = 0;
        let P_copper_loss = 0;

        if (loadType === 'open_circuit') {
          V_load = V_dc_oc;
        } else if (loadType === 'battery_14v') {
          const V_bat = batteryVoltage;
          if (V_dc_oc > V_bat) {
            const V_drive = V_dc_oc - V_bat;
            const I_dc = V_drive / Math.max(0.1, Zs_equiv);
            I_load = I_dc;
            V_load = V_bat;
            P_out_watts = V_load * I_load;

            const I_phase_rms = I_dc * Math.sqrt(2 / 3);
            P_copper_loss = 3 * Math.pow(I_phase_rms, 2) * Rs_phase;
          } else {
            V_load = V_dc_oc;
          }
        } else {
          const R_L = Math.max(0.01, loadResistance);
          const Z_total = Math.hypot(Rs_equiv + R_L, Xs_equiv);
          const I_dc = Math.max(0, V_dc_oc / Math.max(0.05, Z_total));
          I_load = I_dc;
          V_load = I_dc * R_L;
          P_out_watts = Math.pow(I_dc, 2) * R_L;

          const I_phase_rms = I_dc * Math.sqrt(2 / 3);
          P_copper_loss = 3 * Math.pow(I_phase_rms, 2) * Rs_phase;
        }

        const freqNorm = electricalFrequency_Hz / 100;
        const P_iron_loss = 2.5 * Math.pow(freqNorm, 1.5);
        const total_input_power = P_out_watts + P_copper_loss + P_iron_loss;
        const efficiency = total_input_power > 0 ? (P_out_watts / total_input_power) * 100 : 0;

        return {
          rpm, omega_elec, electricalFrequency_Hz,
          E_phase_rms, E_ll_rms, V_dc_oc, V_load,
          I_load, P_out_watts, P_copper_loss, P_iron_loss,
          efficiency, Rs_phase, Xs_phase, Zs_equiv, topology: windingTopology
        };
      } else {
        // Single Phase
        let primaryPhase = phases['A'] || Object.values(phases)[0];
        const Rs = primaryPhase.resistance_ohms;
        const Ls = primaryPhase.inductance_H;
        const Ke = primaryPhase.Ke_peak_per_elec_rad_sec;

        const Xs = omega_elec * Ls;
        const Zs = Math.hypot(Rs, Xs);
        const E_peak = omega_elec * Ke;
        const E_rms = E_peak / Math.SQRT2;

        const V_rectifier_drop = 2 * diodeDrop_V;
        const V_dc_oc = Math.max(0, (2 / Math.PI) * E_peak - V_rectifier_drop);

        let V_load = 0;
        let I_load = 0;
        let P_out_watts = 0;
        let P_copper_loss = 0;

        if (loadType === 'open_circuit') {
          V_load = V_dc_oc;
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
          rpm, omega_elec, electricalFrequency_Hz,
          E_phase_rms: E_rms, E_ll_rms: E_rms, V_dc_oc, V_load,
          I_load, P_out_watts, P_copper_loss, P_iron_loss,
          efficiency, Rs_phase: Rs, Xs_phase: Xs, Zs_equiv: Zs, topology: 'single_phase'
        };
      }
    }

    runRpmSweep(poles, config, startRpm = 500, endRpm = 10000, stepRpm = 250) {
      const geom = this.calculateGeometry(config);
      const mag = this.calculateMagneticFlux(config, geom);
      const winding = this.analyzeWindingPhases(poles, config, geom, mag);

      const points = [];
      let maxPower = 0;
      let peakPowerRpm = 0;
      let cutInRpm = null;

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

        waveforms.time.push(t * 1000);

        const vA = phA ? omega_elec * phA.Ke_peak_per_elec_rad_sec * Math.sin(theta_e + phA.phaseAngle_rad) : 0;
        const vB = phB ? omega_elec * phB.Ke_peak_per_elec_rad_sec * Math.sin(theta_e + phB.phaseAngle_rad) : 0;
        const vC = phC ? omega_elec * phC.Ke_peak_per_elec_rad_sec * Math.sin(theta_e + phC.phaseAngle_rad) : 0;

        waveforms.phaseA.push(vA);
        waveforms.phaseB.push(vB);
        waveforms.phaseC.push(vC);

        const vMax = Math.max(vA, vB, vC);
        const vMin = Math.min(vA, vB, vC);
        const vDc = Math.max(0, (vMax - vMin) - 1.4);
        waveforms.rectifiedDc.push(vDc);
      }

      return waveforms;
    }
  }

  // ==========================================
  // 4. STATOR CHARTS ENGINE
  // ==========================================
  class StatorCharts {
    constructor(canvasPower, canvasOscilloscope) {
      this.canvasPower = canvasPower;
      this.ctxPower = canvasPower ? canvasPower.getContext('2d') : null;
      this.canvasOsc = canvasOscilloscope;
      this.ctxOsc = canvasOscilloscope ? canvasOscilloscope.getContext('2d') : null;

      this.currentData = null;
      this.hoverRpm = null;
      this.activeRpmMarker = null;

      this.setupListeners();
    }

    setupListeners() {
      if (!this.canvasPower) return;

      this.canvasPower.addEventListener('mousemove', (e) => {
        const rect = this.canvasPower.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = this.canvasPower.width / (window.devicePixelRatio || 1);
        
        const padding = { left: 60, right: 30 };
        const plotWidth = width - padding.left - padding.right;

        if (x >= padding.left && x <= width - padding.right && this.currentData) {
          const ratio = (x - padding.left) / plotWidth;
          const rpm = 500 + ratio * (10000 - 500);
          this.hoverRpm = Math.round(rpm / 50) * 50;
        } else {
          this.hoverRpm = null;
        }
        this.renderPowerChart();
      });

      this.canvasPower.addEventListener('mouseleave', () => {
        this.hoverRpm = null;
        this.renderPowerChart();
      });
    }

    setActiveRpmMarker(rpm) {
      this.activeRpmMarker = rpm;
      this.renderPowerChart();
    }

    updateData(sweepResult) {
      this.currentData = sweepResult;
      this.renderPowerChart();
    }

    updateOscilloscope(waveforms) {
      if (!this.canvasOsc || !this.ctxOsc || !waveforms) return;
      this.renderOscilloscope(waveforms);
    }

    resizeCanvas(canvas) {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.resetTransform?.();
        ctx.scale(dpr, dpr);
      }
    }

    renderPowerChart() {
      if (!this.canvasPower || !this.ctxPower || !this.currentData) return;
      const ctx = this.ctxPower;
      const dpr = window.devicePixelRatio || 1;
      const width = this.canvasPower.width / dpr;
      const height = this.canvasPower.height / dpr;

      ctx.clearRect(0, 0, width, height);

      const padding = { top: 35, right: 55, bottom: 45, left: 65 };
      const plotW = width - padding.left - padding.right;
      const plotH = height - padding.top - padding.bottom;

      const points = this.currentData.points;
      if (!points || points.length === 0) return;

      const maxPowerPoint = Math.max(...points.map(p => p.P_out_watts), 10);
      const maxPower = Math.ceil(maxPowerPoint * 1.15 / 50) * 50;

      const maxCurrentPoint = Math.max(...points.map(p => p.I_load), 2);
      const maxCurrent = Math.ceil(maxCurrentPoint * 1.25 / 5) * 5;

      const minRpm = 500;
      const maxRpm = 10000;

      const getX = (rpm) => padding.left + ((rpm - minRpm) / (maxRpm - minRpm)) * plotW;
      const getYPower = (watts) => padding.top + plotH - (watts / maxPower) * plotH;
      const getYCurrent = (amps) => padding.top + plotH - (amps / maxCurrent) * plotH;

      ctx.strokeStyle = '#232936';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

      const numYDivisions = 5;
      for (let i = 0; i <= numYDivisions; i++) {
        const pVal = (maxPower / numYDivisions) * i;
        const y = getYPower(pVal);

        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + plotW, y);
        ctx.stroke();

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`${Math.round(pVal)} W`, padding.left - 8, y);

        const iVal = (maxCurrent / numYDivisions) * i;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`${iVal.toFixed(1)} A`, padding.left + plotW + 8, y);
      }

      for (let rpm = 1000; rpm <= maxRpm; rpm += 1000) {
        const x = getX(rpm);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + plotH);
        ctx.strokeStyle = (rpm === 1000 || rpm === 9000) ? '#334155' : '#1e293b';
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#64748b';
        const label = rpm >= 1000 ? `${rpm / 1000}k` : `${rpm}`;
        ctx.fillText(label, x, padding.top + plotH + 8);
      }

      const redlineX = getX(9000);
      const endX = getX(10000);
      const redGrad = ctx.createLinearGradient(redlineX, 0, endX, 0);
      redGrad.addColorStop(0, 'rgba(239, 68, 68, 0.03)');
      redGrad.addColorStop(1, 'rgba(239, 68, 68, 0.12)');
      ctx.fillStyle = redGrad;
      ctx.fillRect(redlineX, padding.top, endX - redlineX, plotH);

      const copperGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + plotH);
      copperGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      copperGrad.addColorStop(1, 'rgba(56, 189, 248, 0.02)');

      ctx.beginPath();
      ctx.moveTo(getX(points[0].rpm), padding.top + plotH);
      for (const pt of points) {
        ctx.lineTo(getX(pt.rpm), getYPower(pt.P_out_watts));
      }
      ctx.lineTo(getX(points[points.length - 1].rpm), padding.top + plotH);
      ctx.closePath();
      ctx.fillStyle = copperGrad;
      ctx.fill();

      // Current Line
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.setLineDash([4, 3]);
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const x = getX(pt.rpm);
        const y = getYCurrent(pt.I_load);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Power Curve
      ctx.beginPath();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8;
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const x = getX(pt.rpm);
        const y = getYPower(pt.P_out_watts);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Peak Power
      const peakPt = points.reduce((prev, curr) => (curr.P_out_watts > prev.P_out_watts ? curr : prev), points[0]);
      if (peakPt && peakPt.P_out_watts > 5) {
        const px = getX(peakPt.rpm);
        const py = getYPower(peakPt.P_out_watts);

        ctx.beginPath();
        ctx.arc(px, py, 5.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        const peakTxt = `Peak: ${peakPt.P_out_watts.toFixed(0)}W @ ${peakPt.rpm} RPM`;
        const txtW = ctx.measureText(peakTxt).width + 16;
        const badgeX = Math.min(px + 8, width - padding.right - txtW);
        const badgeY = Math.max(py - 22, padding.top + 4);

        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(badgeX, badgeY - 12, txtW, 20, 4);
        else ctx.rect(badgeX, badgeY - 12, txtW, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(peakTxt, badgeX + 8, badgeY + 2);
      }

      // Active / Hover RPM
      const activeRpm = this.hoverRpm || this.activeRpmMarker;
      if (activeRpm && activeRpm >= minRpm && activeRpm <= maxRpm) {
        const activeX = getX(activeRpm);

        ctx.beginPath();
        ctx.moveTo(activeX, padding.top);
        ctx.lineTo(activeX, padding.top + plotH);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        const match = this.interpolateRpm(activeRpm, points);
        if (match) {
          const py = getYPower(match.P_out_watts);
          const cy = getYCurrent(match.I_load);

          ctx.beginPath();
          ctx.arc(activeX, py, 5, 0, 2 * Math.PI);
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(activeX, cy, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          this.renderHoverTooltip(ctx, activeX, py, match, width, height, padding);
        }
      }

      this.renderLegend(ctx, padding, width);
    }

    renderHoverTooltip(ctx, x, y, pt, width, height, padding) {
      const lines = [
        `${pt.rpm} RPM`,
        `Power: ${pt.P_out_watts.toFixed(1)} W`,
        `DC Current: ${pt.I_load.toFixed(2)} A`,
        `DC Voltage: ${pt.V_load.toFixed(1)} V`,
        `AC Open EMF: ${pt.E_ll_rms.toFixed(1)} Vrms`,
        `Copper Loss: ${pt.P_copper_loss.toFixed(1)} W`,
        `Efficiency: ${pt.efficiency.toFixed(1)}%`
      ];

      ctx.font = '11px monospace';
      const boxW = 185;
      const lineH = 16;
      const boxH = lines.length * lineH + 14;

      let boxX = x + 12;
      if (boxX + boxW > width - padding.right) {
        boxX = x - boxW - 12;
      }
      let boxY = Math.min(Math.max(y - boxH / 2, padding.top), height - padding.bottom - boxH);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxW, boxH, 6);
      else ctx.rect(boxX, boxY, boxW, boxH);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      lines.forEach((line, idx) => {
        if (idx === 0) {
          ctx.fillStyle = '#f1f5f9';
          ctx.font = 'bold 12px sans-serif';
        } else if (idx === 1) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px monospace';
        } else if (idx === 2) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = '11px monospace';
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px monospace';
        }
        ctx.fillText(line, boxX + 10, boxY + 8 + idx * lineH);
      });
    }

    renderLegend(ctx, padding, width) {
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const lx = padding.left + 15;
      const ly = padding.top - 18;

      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(lx, ly - 3, 16, 6);
      ctx.fillText('Power Output (Watts)', lx + 22, ly);

      const lx2 = lx + 160;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx2, ly);
      ctx.lineTo(lx2 + 16, ly);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('Current (Amps)', lx2 + 22, ly);

      const lx3 = width - padding.right - 95;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.fillRect(lx3, ly - 5, 10, 10);
      ctx.fillStyle = '#ef4444';
      ctx.fillText('Redline (9k+)', lx3 + 16, ly);
    }

    interpolateRpm(targetRpm, points) {
      if (!points || points.length === 0) return null;
      let closest = points[0];
      let minDiff = Infinity;
      for (const pt of points) {
        const diff = Math.abs(pt.rpm - targetRpm);
        if (diff < minDiff) {
          minDiff = diff;
          closest = pt;
        }
      }
      return closest;
    }

    renderOscilloscope(waveforms) {
      const ctx = this.ctxOsc;
      const dpr = window.devicePixelRatio || 1;
      const width = this.canvasOsc.width / dpr;
      const height = this.canvasOsc.height / dpr;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.lineWidth = 1;

      const divisionsX = 8;
      const divisionsY = 6;
      for (let x = 0; x <= width; x += width / divisionsX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += height / divisionsY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const zeroY = height / 2;
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(width, zeroY);
      ctx.stroke();

      const n = waveforms.time.length;
      if (n === 0) return;

      let maxV = 10;
      for (let i = 0; i < n; i++) {
        maxV = Math.max(maxV, Math.abs(waveforms.phaseA[i] || 0), Math.abs(waveforms.phaseB[i] || 0), Math.abs(waveforms.phaseC[i] || 0));
      }
      const scaleY = (height * 0.42) / maxV;

      const drawWave = (data, color, widthLine = 1.5, dash = []) => {
        ctx.beginPath();
        ctx.lineWidth = widthLine;
        ctx.strokeStyle = color;
        ctx.setLineDash(dash);
        for (let i = 0; i < n; i++) {
          const x = (i / (n - 1)) * width;
          const y = zeroY - (data[i] || 0) * scaleY;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawWave(waveforms.phaseA, '#f43f5e', 1.8);
      drawWave(waveforms.phaseB, '#eab308', 1.8);
      drawWave(waveforms.phaseC, '#38bdf8', 1.8);
      drawWave(waveforms.rectifiedDc, '#4ade80', 2.2, [4, 2]);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('Ph A', 8, 14);
      ctx.fillStyle = '#eab308';
      ctx.fillText('Ph B', 42, 14);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Ph C', 76, 14);
      ctx.fillStyle = '#4ade80';
      ctx.fillText('Rectified DC', 110, 14);

      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      ctx.fillText(`±${maxV.toFixed(1)}V Peak`, width - 8, 14);
    }
  }

  // ==========================================
  // 5. STATOR VISUALIZER
  // ==========================================
  class StatorVisualizer {
    constructor(canvasElement, onPoleSelectCallback, onWiredCallback) {
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext('2d');
      this.onPoleSelect = onPoleSelectCallback;
      this.onWired = onWiredCallback;

      this.config = null;
      this.poles = [];
      this.selectedPoleIndex = null;
      this.hoverPoleIndex = null;

      this.wiringMode = false;
      this.wiringStartPole = null;

      this.rotorAngle_rad = 0;
      this.isSpinning = false;
      this.currentRpm = 1000;
      this.lastTimestamp = performance.now();

      this.setupInteractions();
    }

    setConfig(config, poles) {
      this.config = config;
      this.poles = poles;
      this.render();
    }

    setWiringMode(enabled) {
      this.wiringMode = enabled;
      this.wiringStartPole = null;
      this.render();
    }

    setSelectedPole(index) {
      this.selectedPoleIndex = index;
      this.render();
    }

    setRpm(rpm, isSpinning = false) {
      this.currentRpm = rpm;
      this.isSpinning = isSpinning;
    }

    setupInteractions() {
      this.canvas.addEventListener('mousemove', (e) => {
        const pole = this.getPoleAtMouse(e);
        if (pole !== this.hoverPoleIndex) {
          this.hoverPoleIndex = pole;
          this.canvas.style.cursor = pole !== null ? 'pointer' : 'default';
          this.render();
        }
      });

      this.canvas.addEventListener('mouseleave', () => {
        if (this.hoverPoleIndex !== null) {
          this.hoverPoleIndex = null;
          this.render();
        }
      });

      this.canvas.addEventListener('click', (e) => {
        const poleIdx = this.getPoleAtMouse(e);
        if (poleIdx === null) return;

        if (this.wiringMode) {
          if (this.wiringStartPole === null) {
            this.wiringStartPole = poleIdx;
            this.render();
          } else {
            if (this.onWired && this.wiringStartPole !== poleIdx) {
              this.onWired(this.wiringStartPole, poleIdx);
            }
            this.wiringStartPole = null;
            this.render();
          }
        } else {
          this.selectedPoleIndex = poleIdx;
          if (this.onPoleSelect) {
            this.onPoleSelect(poleIdx, this.poles[poleIdx]);
          }
          this.render();
        }
      });
    }

    getPoleAtMouse(e) {
      if (!this.config || !this.poles) return null;
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const width = this.canvas.width / dpr;
      const height = this.canvas.height / dpr;
      const cx = width / 2;
      const cy = height / 2;

      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const dist = Math.hypot(dx, dy);

      const maxRadius = Math.min(width, height) * 0.45;
      const scale = maxRadius / (this.config.outerDiameter_mm * 0.65);

      const rBore = (this.config.innerDiameter_mm / 2) * scale;
      const rOuter = (this.config.outerDiameter_mm / 2) * scale;

      if (dist < rBore * 0.6 || dist > rOuter * 1.15) {
        return null;
      }

      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += 2 * Math.PI;

      const nPoles = this.config.numStatorPoles;
      const polePitch = (2 * Math.PI) / nPoles;

      let bestIdx = null;
      let minDiff = Infinity;

      for (let i = 0; i < nPoles; i++) {
        const toothAngle = i * polePitch;
        let diff = Math.abs(angle - toothAngle);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;

        if (diff < polePitch * 0.48 && diff < minDiff) {
          minDiff = diff;
          bestIdx = i;
        }
      }

      return bestIdx;
    }

    startAnimationLoop() {
      const loop = (timestamp) => {
        const dt = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        if (this.isSpinning && this.currentRpm > 0) {
          const visualSpeedFactor = 0.05;
          const omega_mech = (this.currentRpm * 2 * Math.PI) / 60;
          this.rotorAngle_rad = (this.rotorAngle_rad + omega_mech * visualSpeedFactor * dt) % (2 * Math.PI);
          this.render();
        }

        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.render();
      }
    }

    render() {
      if (!this.config || !this.poles) return;
      const ctx = this.ctx;
      const dpr = window.devicePixelRatio || 1;
      const width = this.canvas.width / dpr;
      const height = this.canvas.height / dpr;

      ctx.save();
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      const maxVisualR = Math.min(width, height) * 0.44;
      const flywheelOuter_mm = this.config.outerDiameter_mm * 1.25;
      const scale = maxVisualR / (flywheelOuter_mm / 2);

      const rBore = (this.config.innerDiameter_mm / 2) * scale;
      const rYoke = rBore + ((this.config.outerDiameter_mm - this.config.innerDiameter_mm) * 0.28 / 2) * scale;
      const rStatorOD = (this.config.outerDiameter_mm / 2) * scale;
      const rAirgap = rStatorOD + (this.config.airGap_mm || 0.8) * scale * 2.5;
      const rFlywheelInner = rAirgap + 2;
      const rFlywheelOuter = rFlywheelInner + 22;

      // 1. Rotor Flywheel & Magnets
      this.drawRotorFlywheel(ctx, cx, cy, rFlywheelInner, rFlywheelOuter, rAirgap);

      // 2. Stator Core Iron
      this.drawStatorCore(ctx, cx, cy, rBore, rYoke, rStatorOD);

      // 3. Copper Windings & Directions
      this.drawWindings(ctx, cx, cy, rYoke, rStatorOD);

      // 4. Wire Jumpers
      this.drawWiringJumpers(ctx, cx, cy, rBore, rYoke);

      // 5. Highlights & Numbers
      this.drawInteractiveHighlights(ctx, cx, cy, rStatorOD);

      // 6. Hub
      this.drawCenterHub(ctx, cx, cy, rBore);

      ctx.restore();
    }

    drawRotorFlywheel(ctx, cx, cy, rInner, rOuter, rAirgap) {
      const nRotorPoles = this.config.numRotorPoles || 12;
      const polePitch = (2 * Math.PI) / nRotorPoles;

      ctx.beginPath();
      ctx.arc(cx, cy, rOuter + 4, 0, 2 * Math.PI);
      ctx.arc(cx, cy, rOuter, 0, 2 * Math.PI, true);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      for (let i = 0; i < nRotorPoles; i++) {
        const isNorth = (i % 2 === 0);
        const startAngle = this.rotorAngle_rad + i * polePitch;
        const endAngle = startAngle + polePitch * 0.88;

        ctx.beginPath();
        ctx.arc(cx, cy, rOuter, startAngle, endAngle);
        ctx.arc(cx, cy, rInner, endAngle, startAngle, true);
        ctx.closePath();

        ctx.fillStyle = isNorth ? 'rgba(239, 68, 68, 0.85)' : 'rgba(59, 130, 246, 0.85)';
        ctx.fill();
        ctx.strokeStyle = isNorth ? '#b91c1c' : '#1d4ed8';
        ctx.lineWidth = 1;
        ctx.stroke();

        const midAngle = (startAngle + endAngle) / 2;
        const labelR = (rInner + rOuter) / 2;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isNorth ? 'N' : 'S', lx, ly);
      }

      ctx.beginPath();
      ctx.arc(cx, cy, rAirgap, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawStatorCore(ctx, cx, cy, rBore, rYoke, rStatorOD) {
      const nPoles = this.config.numStatorPoles;
      const polePitch = (2 * Math.PI) / nPoles;

      ctx.beginPath();
      ctx.arc(cx, cy, rYoke, 0, 2 * Math.PI);
      ctx.arc(cx, cy, rBore, 0, 2 * Math.PI, true);
      ctx.fillStyle = '#334155';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const toothHalfAngle = polePitch * 0.18;
      const shoeHalfAngle = polePitch * 0.40;

      for (let i = 0; i < nPoles; i++) {
        const toothAngle = i * polePitch;

        ctx.beginPath();
        ctx.arc(cx, cy, rYoke, toothAngle - toothHalfAngle, toothAngle + toothHalfAngle);
        ctx.lineTo(
          cx + Math.cos(toothAngle + toothHalfAngle) * (rStatorOD - 6),
          cy + Math.sin(toothAngle + toothHalfAngle) * (rStatorOD - 6)
        );
        ctx.lineTo(
          cx + Math.cos(toothAngle + shoeHalfAngle) * rStatorOD,
          cy + Math.sin(toothAngle + shoeHalfAngle) * rStatorOD
        );
        ctx.arc(cx, cy, rStatorOD, toothAngle + shoeHalfAngle, toothAngle - shoeHalfAngle, true);
        ctx.lineTo(
          cx + Math.cos(toothAngle - toothHalfAngle) * (rStatorOD - 6),
          cy + Math.sin(toothAngle - toothHalfAngle) * (rStatorOD - 6)
        );
        ctx.closePath();

        let toothFill = '#475569';
        if (this.isSpinning) {
          const rotorPairs = (this.config.numRotorPoles || 12) / 2;
          const fluxAngle = rotorPairs * (this.rotorAngle_rad - toothAngle);
          const fluxVal = Math.cos(fluxAngle);
          if (fluxVal > 0.3) {
            toothFill = `rgba(239, 68, 68, ${0.3 + fluxVal * 0.4})`;
          } else if (fluxVal < -0.3) {
            toothFill = `rgba(59, 130, 246, ${0.3 + Math.abs(fluxVal) * 0.4})`;
          }
        }

        ctx.fillStyle = toothFill;
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    drawWindings(ctx, cx, cy, rYoke, rStatorOD) {
      const nPoles = this.config.numStatorPoles;
      const polePitch = (2 * Math.PI) / nPoles;
      const coilInnerR = rYoke + 4;
      const coilOuterR = rStatorOD - 8;
      const toothHalfAngle = polePitch * 0.16;

      this.poles.forEach((pole, i) => {
        if (!pole.enabled || pole.phase === 'NONE') return;

        const toothAngle = i * polePitch;
        const phaseColor = this.getPhaseColor(pole.phase);

        const drawCoilSide = (sideAngle) => {
          const rMid = (coilInnerR + coilOuterR) / 2;
          const rLen = (coilOuterR - coilInnerR);
          const bx = cx + Math.cos(sideAngle) * rMid;
          const by = cy + Math.sin(sideAngle) * rMid;

          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(sideAngle + Math.PI / 2);

          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(-5, -rLen / 2, 10, rLen, 3);
          else ctx.rect(-5, -rLen / 2, 10, rLen);
          ctx.fillStyle = phaseColor.bg;
          ctx.fill();
          ctx.strokeStyle = phaseColor.border;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.restore();
        };

        drawCoilSide(toothAngle - toothHalfAngle * 1.3);
        drawCoilSide(toothAngle + toothHalfAngle * 1.3);

        const midR = (coilInnerR + coilOuterR) / 2;
        const tx = cx + Math.cos(toothAngle) * midR;
        const ty = cy + Math.sin(toothAngle) * midR;

        ctx.beginPath();
        ctx.arc(tx, ty, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = phaseColor.badgeBorder;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = phaseColor.text;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const dirText = pole.direction === 'CCW' ? '↶' : '↷';
        ctx.fillText(dirText, tx, ty);
      });
    }

    drawWiringJumpers(ctx, cx, cy, rBore, rYoke) {
      const phases = ['A', 'B', 'C', 'AUX'];

      phases.forEach((phaseKey) => {
        const phasePoles = this.poles
          .map((p, idx) => ({ ...p, poleIndex: idx }))
          .filter(p => p.enabled && p.phase === phaseKey);

        if (phasePoles.length <= 1) return;

        const nPoles = this.config.numStatorPoles;
        const polePitch = (2 * Math.PI) / nPoles;
        const phaseColor = this.getPhaseColor(phaseKey);

        ctx.strokeStyle = phaseColor.badgeBorder;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 2]);

        for (let i = 0; i < phasePoles.length - 1; i++) {
          const p1 = phasePoles[i];
          const p2 = phasePoles[i + 1];

          const a1 = p1.poleIndex * polePitch;
          const a2 = p2.poleIndex * polePitch;

          const wireR = rBore + (rYoke - rBore) * (0.3 + (phaseKey === 'A' ? 0.1 : phaseKey === 'B' ? 0.35 : 0.6));

          const p1x = cx + Math.cos(a1) * wireR;
          const p1y = cy + Math.sin(a1) * wireR;

          ctx.beginPath();
          ctx.moveTo(p1x, p1y);
          ctx.arc(cx, cy, wireR, a1, a2, Math.abs(a2 - a1) > Math.PI);
          ctx.stroke();
        }

        ctx.setLineDash([]);
      });
    }

    drawInteractiveHighlights(ctx, cx, cy, rStatorOD) {
      const nPoles = this.config.numStatorPoles;
      const polePitch = (2 * Math.PI) / nPoles;

      this.poles.forEach((pole, i) => {
        const toothAngle = i * polePitch;
        const bx = cx + Math.cos(toothAngle) * (rStatorOD + 14);
        const by = cy + Math.sin(toothAngle) * (rStatorOD + 14);

        const isSelected = (i === this.selectedPoleIndex);
        const isHovered = (i === this.hoverPoleIndex);
        const isWiringFirst = (this.wiringMode && this.wiringStartPole === i);

        ctx.beginPath();
        ctx.arc(bx, by, isSelected ? 12 : 9, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#38bdf8' : isWiringFirst ? '#ec4899' : isHovered ? '#475569' : '#1e293b';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#ffffff' : isWiringFirst ? '#f43f5e' : '#64748b';
        ctx.lineWidth = isSelected || isWiringFirst ? 2 : 1;
        ctx.stroke();

        ctx.fillStyle = isSelected || isWiringFirst ? '#0f172a' : '#cbd5e1';
        ctx.font = isSelected ? 'bold 10px monospace' : '9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i + 1}`, bx, by);

        if (isSelected || isWiringFirst) {
          ctx.beginPath();
          ctx.arc(cx + Math.cos(toothAngle) * (rStatorOD * 0.75), cy + Math.sin(toothAngle) * (rStatorOD * 0.75), 18, 0, 2 * Math.PI);
          ctx.strokeStyle = isWiringFirst ? '#ec4899' : '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    drawCenterHub(ctx, cx, cy, rBore) {
      ctx.beginPath();
      ctx.arc(cx, cy, rBore, 0, 2 * Math.PI);
      ctx.fillStyle = '#090d16';
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${this.config.numStatorPoles}P / ${this.config.numRotorPoles}M`, cx, cy - 8);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px monospace';
      ctx.fillText(`${this.config.outerDiameter_mm}mm OD`, cx, cy + 8);
    }

    getPhaseColor(phase) {
      switch (phase) {
        case 'A':
          return { bg: '#dc2626', border: '#ef4444', badgeBorder: '#f87171', text: '#fca5a5' };
        case 'B':
          return { bg: '#d97706', border: '#f59e0b', badgeBorder: '#fbbf24', text: '#fde68a' };
        case 'C':
          return { bg: '#0284c7', border: '#38bdf8', badgeBorder: '#7dd3fc', text: '#bae6fd' };
        case 'AUX':
          return { bg: '#7c3aed', border: '#a855f7', badgeBorder: '#c084fc', text: '#e9d5ff' };
        default:
          return { bg: '#334155', border: '#475569', badgeBorder: '#64748b', text: '#94a3b8' };
      }
    }
  }

  // ==========================================
  // 6. STATOR AUDIO ENGINE
  // ==========================================
  class StatorAudio {
    constructor() {
      this.audioCtx = null;
      this.osc1 = null;
      this.osc2 = null;
      this.whineOsc = null;
      this.gainNode = null;
      this.isMuted = true;
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();

        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
        this.gainNode.connect(this.audioCtx.destination);

        this.osc1 = this.audioCtx.createOscillator();
        this.osc1.type = 'sawtooth';

        this.osc2 = this.audioCtx.createOscillator();
        this.osc2.type = 'triangle';

        this.whineOsc = this.audioCtx.createOscillator();
        this.whineOsc.type = 'sine';

        this.whineGain = this.audioCtx.createGain();
        this.whineGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);

        this.osc1.connect(this.gainNode);
        this.osc2.connect(this.gainNode);
        this.whineOsc.connect(this.whineGain);
        this.whineGain.connect(this.gainNode);

        this.osc1.start();
        this.osc2.start();
        this.whineOsc.start();

        this.initialized = true;
      } catch (e) {
        console.warn("Audio unavailable", e);
      }
    }

    setMuted(muted) {
      this.isMuted = muted;
      if (!this.initialized && !muted) {
        this.init();
      }
      if (this.gainNode && this.audioCtx) {
        if (this.isMuted) {
          this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.05);
        }
      }
    }

    updateRpm(rpm, isSpinning) {
      if (!this.initialized || this.isMuted || !this.audioCtx) return;

      if (!isSpinning) {
        this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.05);
        return;
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const baseFreq = Math.max(20, (rpm / 60) * 1.5);
      const altFreq = Math.max(50, (rpm / 60) * 6);

      const now = this.audioCtx.currentTime;
      this.osc1.frequency.setTargetAtTime(baseFreq, now, 0.03);
      this.osc2.frequency.setTargetAtTime(baseFreq * 2, now, 0.03);
      this.whineOsc.frequency.setTargetAtTime(altFreq, now, 0.03);
      this.gainNode.gain.setTargetAtTime(0.04, now, 0.03);
    }
  }

  // ==========================================
  // 7. MAIN STATOR APP CONTROLLER
  // ==========================================
  class StatorApp {
    constructor() {
      this.physics = new StatorPhysicsEngine();
      this.audio = new StatorAudio();

      this.config = {
        outerDiameter_mm: 115,
        innerDiameter_mm: 54,
        coreThickness_mm: 22,
        numStatorPoles: 12,
        numRotorPoles: 14,
        magnetGauss: 8500,
        wireAWG: 18,
        turnsPerPole: 38,
        windingTopology: 'wye',
        loadType: 'battery_14v',
        batteryVoltage: 14.4,
        loadResistance: 2.5,
        airGap_mm: 0.8,
        temperature_C: 65
      };

      this.poles = this.generateDefaultPoles(12, 38);
      this.currentRpm = 1000;
      this.isSpinningUp = false;
      this.spinUpTimer = null;
      this.latestSweepResult = null;

      this.initDOM();
      this.initComponents();
      this.bindEvents();
      this.runSimulation();
    }

    generateDefaultPoles(nPoles, defaultTurns) {
      const poles = [];
      const phases = ['A', 'B', 'C'];
      for (let i = 0; i < nPoles; i++) {
        const phase = nPoles % 3 === 0 ? phases[i % 3] : 'A';
        const dir = (i % 2 === 0) ? 'CW' : 'CCW';
        poles.push({
          id: i,
          phase,
          direction: dir,
          turns: defaultTurns,
          enabled: true
        });
      }
      return poles;
    }

    initDOM() {
      this.canvasStator = document.getElementById('canvasStator');
      this.canvasPower = document.getElementById('canvasPower');
      this.canvasOsc = document.getElementById('canvasOscilloscope');

      this.inputOD = document.getElementById('inputOD');
      this.inputID = document.getElementById('inputID');
      this.inputCoreThick = document.getElementById('inputCoreThick');
      this.inputStatorPoles = document.getElementById('inputStatorPoles');
      this.selectWireAWG = document.getElementById('selectWireAWG');
      this.inputTurns = document.getElementById('inputTurns');

      this.inputGauss = document.getElementById('inputGauss');
      this.inputRotorPoles = document.getElementById('inputRotorPoles');
      this.inputAirgap = document.getElementById('inputAirgap');

      this.selectTopology = document.getElementById('selectTopology');
      this.selectLoadType = document.getElementById('selectLoadType');
      this.inputLoadResistance = document.getElementById('inputLoadResistance');
      this.inputBatteryVoltage = document.getElementById('inputBatteryVoltage');

      this.selectPreset = document.getElementById('selectPreset');

      this.sliderRpm = document.getElementById('sliderRpm');
      this.displayRpm = document.getElementById('displayRpm');
      this.btnSpinUp = document.getElementById('btnSpinUp');
      this.btnStopSpin = document.getElementById('btnStopSpin');
      this.btnAudioToggle = document.getElementById('btnAudioToggle');

      this.btnWiringMode = document.getElementById('btnWiringMode');
      this.wiringStatusBadge = document.getElementById('wiringStatusBadge');

      this.poleInspector = document.getElementById('poleInspector');
      this.inspectorPoleId = document.getElementById('inspectorPoleId');
      this.btnPhaseA = document.getElementById('btnPhaseA');
      this.btnPhaseB = document.getElementById('btnPhaseB');
      this.btnPhaseC = document.getElementById('btnPhaseC');
      this.btnPhaseAux = document.getElementById('btnPhaseAux');
      this.btnPhaseNone = document.getElementById('btnPhaseNone');
      this.btnDirCW = document.getElementById('btnDirCW');
      this.btnDirCCW = document.getElementById('btnDirCCW');
      this.inputPoleTurns = document.getElementById('inputPoleTurns');
      this.btnApplyAllTurns = document.getElementById('btnApplyAllTurns');
      this.btnCloseInspector = document.getElementById('btnCloseInspector');

      this.btnAutoWireWye = document.getElementById('btnAutoWireWye');
      this.btnAutoWireDelta = document.getElementById('btnAutoWireDelta');
      this.btnAutoWireSingle = document.getElementById('btnAutoWireSingle');
      this.btnAlternateDirs = document.getElementById('btnAlternateDirs');

      this.metricPeakPower = document.getElementById('metricPeakPower');
      this.metricPeakRpm = document.getElementById('metricPeakRpm');
      this.metricCutInRpm = document.getElementById('metricCutInRpm');
      this.metricSlotFill = document.getElementById('metricSlotFill');
      this.slotFillAlert = document.getElementById('slotFillAlert');
      this.metricPhaseRes = document.getElementById('metricPhaseRes');
      this.metricPhaseInd = document.getElementById('metricPhaseInd');
      this.metricMaxAmps = document.getElementById('metricMaxAmps');
      this.metricFluxDensity = document.getElementById('metricFluxDensity');
      this.metricWireLength = document.getElementById('metricWireLength');

      this.tachNeedle = document.getElementById('tachNeedle');
      this.livePowerWatts = document.getElementById('livePowerWatts');
      this.liveVoltage = document.getElementById('liveVoltage');
      this.liveCurrent = document.getElementById('liveCurrent');

      this.btnExportJson = document.getElementById('btnExportJson');
      this.btnImportJson = document.getElementById('btnImportJson');
      this.fileImportJson = document.getElementById('fileImportJson');
      this.btnExportCsv = document.getElementById('btnExportCsv');

      this.populateWireAWGSelect();
      this.populatePresetSelect();
      this.syncFormWithConfig();
    }

    populateWireAWGSelect() {
      this.selectWireAWG.innerHTML = '';
      for (const [awg, info] of Object.entries(AWG_TABLE)) {
        const opt = document.createElement('option');
        opt.value = awg;
        opt.textContent = `AWG ${awg} (${info.diameter_mm} mm / ${info.area_mm2} mm²)`;
        if (parseInt(awg, 10) === this.config.wireAWG) {
          opt.selected = true;
        }
        this.selectWireAWG.appendChild(opt);
      }
    }

    populatePresetSelect() {
      this.selectPreset.innerHTML = '<option value="">-- Choose a Motorcycle Preset --</option>';
      for (const [key, preset] of Object.entries(PRESETS)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = preset.name;
        this.selectPreset.appendChild(opt);
      }
    }

    initComponents() {
      this.charts = new StatorCharts(this.canvasPower, this.canvasOsc);
      this.visualizer = new StatorVisualizer(
        this.canvasStator,
        (poleIndex, pole) => this.onPoleSelected(poleIndex, pole),
        (p1, p2) => this.onPolesWired(p1, p2)
      );

      this.visualizer.setConfig(this.config, this.poles);
      this.visualizer.startAnimationLoop();

      window.addEventListener('resize', () => {
        this.visualizer.resize();
        this.charts.resizeCanvas(this.canvasPower);
        this.charts.resizeCanvas(this.canvasOsc);
        if (this.latestSweepResult) {
          this.charts.updateData(this.latestSweepResult);
          this.updateOscilloscopeWaveforms(this.currentRpm);
        }
      });

      setTimeout(() => {
        this.visualizer.resize();
        this.charts.resizeCanvas(this.canvasPower);
        this.charts.resizeCanvas(this.canvasOsc);
        this.runSimulation();
      }, 100);
    }

    bindEvents() {
      const inputs = [
        this.inputOD, this.inputID, this.inputCoreThick, this.inputStatorPoles,
        this.selectWireAWG, this.inputTurns, this.inputGauss, this.inputRotorPoles,
        this.inputAirgap, this.selectTopology, this.selectLoadType,
        this.inputLoadResistance, this.inputBatteryVoltage
      ];

      inputs.forEach(el => {
        el.addEventListener('input', () => this.handleConfigChange());
      });

      this.selectPreset.addEventListener('change', (e) => {
        const key = e.target.value;
        if (key && PRESETS[key]) {
          this.loadPreset(PRESETS[key]);
        }
      });

      this.sliderRpm.addEventListener('input', (e) => {
        const rpm = parseInt(e.target.value, 10);
        this.updateRpmState(rpm, false);
      });

      this.btnSpinUp.addEventListener('click', () => this.startSpinUpSweep());
      this.btnStopSpin.addEventListener('click', () => this.stopSpinUpSweep());

      this.btnAudioToggle.addEventListener('click', () => {
        const isMuted = !this.audio.isMuted;
        this.audio.setMuted(isMuted);
        this.btnAudioToggle.innerHTML = isMuted
          ? '<span class="icon">🔇</span> Sound: OFF'
          : '<span class="icon">🔊</span> Sound: ON';
        this.btnAudioToggle.classList.toggle('active', !isMuted);
      });

      this.btnWiringMode.addEventListener('click', () => {
        const active = !this.visualizer.wiringMode;
        this.visualizer.setWiringMode(active);
        this.btnWiringMode.classList.toggle('active', active);
        this.wiringStatusBadge.style.display = active ? 'inline-flex' : 'none';
        if (active) {
          this.closePoleInspector();
        }
      });

      const setPhase = (phase) => {
        const idx = this.visualizer.selectedPoleIndex;
        if (idx !== null && this.poles[idx]) {
          this.poles[idx].phase = phase;
          this.poles[idx].enabled = (phase !== 'NONE');
          this.updateInspectorButtons(this.poles[idx]);
          this.onTopologyOrPoleChange();
        }
      };

      this.btnPhaseA.addEventListener('click', () => setPhase('A'));
      this.btnPhaseB.addEventListener('click', () => setPhase('B'));
      this.btnPhaseC.addEventListener('click', () => setPhase('C'));
      this.btnPhaseAux.addEventListener('click', () => setPhase('AUX'));
      this.btnPhaseNone.addEventListener('click', () => setPhase('NONE'));

      this.btnDirCW.addEventListener('click', () => {
        const idx = this.visualizer.selectedPoleIndex;
        if (idx !== null && this.poles[idx]) {
          this.poles[idx].direction = 'CW';
          this.updateInspectorButtons(this.poles[idx]);
          this.onTopologyOrPoleChange();
        }
      });

      this.btnDirCCW.addEventListener('click', () => {
        const idx = this.visualizer.selectedPoleIndex;
        if (idx !== null && this.poles[idx]) {
          this.poles[idx].direction = 'CCW';
          this.updateInspectorButtons(this.poles[idx]);
          this.onTopologyOrPoleChange();
        }
      });

      this.inputPoleTurns.addEventListener('input', (e) => {
        const idx = this.visualizer.selectedPoleIndex;
        const turns = parseInt(e.target.value, 10) || 1;
        if (idx !== null && this.poles[idx]) {
          this.poles[idx].turns = turns;
          this.onTopologyOrPoleChange();
        }
      });

      this.btnApplyAllTurns.addEventListener('click', () => {
        const turns = parseInt(this.inputPoleTurns.value, 10) || 1;
        this.config.turnsPerPole = turns;
        this.inputTurns.value = turns;
        this.poles.forEach(p => p.turns = turns);
        this.onTopologyOrPoleChange();
      });

      this.btnCloseInspector.addEventListener('click', () => this.closePoleInspector());

      this.btnAutoWireWye.addEventListener('click', () => this.autoWireThreePhase('wye'));
      this.btnAutoWireDelta.addEventListener('click', () => this.autoWireThreePhase('delta'));
      this.btnAutoWireSingle.addEventListener('click', () => this.autoWireSinglePhase());
      this.btnAlternateDirs.addEventListener('click', () => this.alternateWindingDirections());

      this.btnExportJson.addEventListener('click', () => this.exportJson());
      this.btnImportJson.addEventListener('click', () => this.fileImportJson.click());
      this.fileImportJson.addEventListener('change', (e) => this.handleImportJson(e));
      this.btnExportCsv.addEventListener('click', () => this.exportCsv());
    }

    syncFormWithConfig() {
      this.inputOD.value = this.config.outerDiameter_mm;
      this.inputID.value = this.config.innerDiameter_mm;
      this.inputCoreThick.value = this.config.coreThickness_mm;
      this.inputStatorPoles.value = this.config.numStatorPoles;
      this.selectWireAWG.value = this.config.wireAWG;
      this.inputTurns.value = this.config.turnsPerPole;
      this.inputGauss.value = this.config.magnetGauss;
      this.inputRotorPoles.value = this.config.numRotorPoles;
      this.inputAirgap.value = this.config.airGap_mm;
      this.selectTopology.value = this.config.windingTopology;
      this.selectLoadType.value = this.config.loadType;
      this.inputLoadResistance.value = this.config.loadResistance;
      this.inputBatteryVoltage.value = this.config.batteryVoltage;
    }

    handleConfigChange() {
      const oldPoles = this.config.numStatorPoles;

      this.config.outerDiameter_mm = parseFloat(this.inputOD.value) || 115;
      this.config.innerDiameter_mm = parseFloat(this.inputID.value) || 54;
      this.config.coreThickness_mm = parseFloat(this.inputCoreThick.value) || 22;
      this.config.numStatorPoles = parseInt(this.inputStatorPoles.value, 10) || 12;
      this.config.wireAWG = parseInt(this.selectWireAWG.value, 10) || 18;
      this.config.turnsPerPole = parseInt(this.inputTurns.value, 10) || 38;
      this.config.magnetGauss = parseFloat(this.inputGauss.value) || 8500;
      this.config.numRotorPoles = parseInt(this.inputRotorPoles.value, 10) || 14;
      this.config.airGap_mm = parseFloat(this.inputAirgap.value) || 0.8;
      this.config.windingTopology = this.selectTopology.value;
      this.config.loadType = this.selectLoadType.value;
      this.config.loadResistance = parseFloat(this.inputLoadResistance.value) || 2.5;
      this.config.batteryVoltage = parseFloat(this.inputBatteryVoltage.value) || 14.4;

      const isBattery = this.config.loadType === 'battery_14v';
      this.inputBatteryVoltage.parentElement.style.display = isBattery ? 'block' : 'none';
      this.inputLoadResistance.parentElement.style.display = (this.config.loadType === 'resistive') ? 'block' : 'none';

      if (this.config.numStatorPoles !== oldPoles) {
        this.poles = this.generateDefaultPoles(this.config.numStatorPoles, this.config.turnsPerPole);
        this.closePoleInspector();
      }

      this.onTopologyOrPoleChange();
    }

    loadPreset(preset) {
      this.config = {
        ...this.config,
        outerDiameter_mm: preset.outerDiameter_mm,
        innerDiameter_mm: preset.innerDiameter_mm,
        coreThickness_mm: preset.coreThickness_mm,
        numStatorPoles: preset.numStatorPoles,
        numRotorPoles: preset.numRotorPoles,
        magnetGauss: preset.magnetGauss,
        wireAWG: preset.wireAWG,
        turnsPerPole: preset.turnsPerPole,
        windingTopology: preset.windingTopology,
        loadType: preset.loadType || 'battery_14v',
        batteryVoltage: preset.batteryVoltage || 14.4,
        loadResistance: preset.loadResistance || 2.5,
        airGap_mm: preset.airGap_mm || 0.8
      };

      this.poles = JSON.parse(JSON.stringify(preset.poles));
      this.syncFormWithConfig();
      this.closePoleInspector();
      this.onTopologyOrPoleChange();
    }

    onTopologyOrPoleChange() {
      this.visualizer.setConfig(this.config, this.poles);
      this.runSimulation();
    }

    onPoleSelected(poleIndex, pole) {
      if (!pole) return;
      this.poleInspector.style.display = 'block';
      this.inspectorPoleId.textContent = `Pole #${poleIndex + 1}`;
      this.inputPoleTurns.value = pole.turns || this.config.turnsPerPole;
      this.updateInspectorButtons(pole);
    }

    updateInspectorButtons(pole) {
      const btns = [
        { el: this.btnPhaseA, active: pole.phase === 'A' },
        { el: this.btnPhaseB, active: pole.phase === 'B' },
        { el: this.btnPhaseC, active: pole.phase === 'C' },
        { el: this.btnPhaseAux, active: pole.phase === 'AUX' },
        { el: this.btnPhaseNone, active: pole.phase === 'NONE' || !pole.enabled }
      ];
      btns.forEach(b => b.el.classList.toggle('active', b.active));

      this.btnDirCW.classList.toggle('active', pole.direction === 'CW');
      this.btnDirCCW.classList.toggle('active', pole.direction === 'CCW');
    }

    closePoleInspector() {
      this.poleInspector.style.display = 'none';
      this.visualizer.setSelectedPole(null);
    }

    onPolesWired(p1Idx, p2Idx) {
      const p1 = this.poles[p1Idx];
      const p2 = this.poles[p2Idx];
      if (p1 && p2) {
        p2.phase = p1.phase;
        p2.enabled = true;
        p2.direction = (p1.direction === 'CW') ? 'CCW' : 'CW';
        this.onTopologyOrPoleChange();
      }
    }

    autoWireThreePhase(topology = 'wye') {
      this.config.windingTopology = topology;
      this.selectTopology.value = topology;

      const n = this.config.numStatorPoles;
      const phases = ['A', 'B', 'C'];

      for (let i = 0; i < n; i++) {
        this.poles[i].phase = phases[i % 3];
        this.poles[i].direction = (i % 2 === 0) ? 'CW' : 'CCW';
        this.poles[i].enabled = true;
        this.poles[i].turns = this.config.turnsPerPole;
      }

      this.onTopologyOrPoleChange();
    }

    autoWireSinglePhase() {
      this.config.windingTopology = 'single_phase';
      this.selectTopology.value = 'single_phase';

      const n = this.config.numStatorPoles;
      for (let i = 0; i < n; i++) {
        this.poles[i].phase = 'A';
        this.poles[i].direction = (i % 2 === 0) ? 'CW' : 'CCW';
        this.poles[i].enabled = true;
        this.poles[i].turns = this.config.turnsPerPole;
      }

      this.onTopologyOrPoleChange();
    }

    alternateWindingDirections() {
      this.poles.forEach((p, idx) => {
        p.direction = (idx % 2 === 0) ? 'CW' : 'CCW';
      });
      this.onTopologyOrPoleChange();
    }

    runSimulation() {
      const sweep = this.physics.runRpmSweep(this.poles, this.config, 500, 10000, 200);
      this.latestSweepResult = sweep;

      this.charts.updateData(sweep);
      this.updateOscilloscopeWaveforms(this.currentRpm);
      this.updateMetricsUI(sweep);
      this.updateLiveTach(this.currentRpm);
    }

    updateMetricsUI(sweep) {
      const geom = sweep.geometry;
      const mag = sweep.magnetic;
      const winding = sweep.winding;

      this.metricPeakPower.textContent = `${Math.round(sweep.peakPower_W)} W`;
      this.metricPeakRpm.textContent = `@ ${sweep.peakPowerRpm} RPM`;
      this.metricCutInRpm.textContent = sweep.cutInRpm > 500 ? `${sweep.cutInRpm} RPM` : 'Idle (<500)';

      const fillPct = (geom.fillFactor * 100).toFixed(1);
      this.metricSlotFill.textContent = `${fillPct}%`;
      if (geom.fillFactor > 0.50) {
        this.metricSlotFill.style.color = '#ef4444';
        this.slotFillAlert.textContent = 'Warning: Overfill (>50%)! Wire may not fit in slot.';
        this.slotFillAlert.style.display = 'block';
      } else if (geom.fillFactor > 0.42) {
        this.metricSlotFill.style.color = '#f59e0b';
        this.slotFillAlert.textContent = 'Tight fit (42-50%). Hand winding requires careful layering.';
        this.slotFillAlert.style.display = 'block';
      } else {
        this.metricSlotFill.style.color = '#10b981';
        this.slotFillAlert.textContent = 'Optimal slot fill (<42%). Winding will fit comfortably.';
        this.slotFillAlert.style.display = 'block';
      }

      const phA = winding.phaseResults['A'] || Object.values(winding.phaseResults)[0];
      if (phA) {
        this.metricPhaseRes.textContent = `${phA.resistance_ohms.toFixed(3)} Ω`;
        this.metricPhaseInd.textContent = `${phA.inductance_mH.toFixed(2)} mH`;
        this.metricWireLength.textContent = `${phA.totalWireLength_m.toFixed(1)} m`;
      } else {
        this.metricPhaseRes.textContent = '0.000 Ω';
        this.metricPhaseInd.textContent = '0.00 mH';
        this.metricWireLength.textContent = '0.0 m';
      }

      const maxAmps = Math.max(...sweep.points.map(p => p.I_load), 0);
      this.metricMaxAmps.textContent = `${maxAmps.toFixed(1)} A`;
      this.metricFluxDensity.textContent = `${mag.Bg_peak_Tesla.toFixed(2)} T (${(mag.fluxPeak_Weber * 1e3).toFixed(2)} mWb)`;
    }

    updateLiveTach(rpm) {
      if (!this.latestSweepResult) return;
      const pt = this.charts.interpolateRpm(rpm, this.latestSweepResult.points);
      if (!pt) return;

      this.displayRpm.textContent = `${rpm} RPM`;
      this.livePowerWatts.textContent = `${pt.P_out_watts.toFixed(1)} W`;
      this.liveVoltage.textContent = `${pt.V_load.toFixed(1)} V`;
      this.liveCurrent.textContent = `${pt.I_load.toFixed(2)} A`;

      const ratio = (rpm - 500) / (10000 - 500);
      const deg = -110 + ratio * 220;
      if (this.tachNeedle) {
        this.tachNeedle.style.transform = `rotate(${deg}deg)`;
      }
    }

    updateRpmState(rpm, isSpinning = false) {
      this.currentRpm = rpm;
      this.sliderRpm.value = rpm;
      this.visualizer.setRpm(rpm, isSpinning);
      this.charts.setActiveRpmMarker(rpm);
      this.updateLiveTach(rpm);
      this.updateOscilloscopeWaveforms(rpm);
      this.audio.updateRpm(rpm, isSpinning);
    }

    updateOscilloscopeWaveforms(rpm) {
      if (!this.latestSweepResult) return;
      const waveforms = this.physics.generateWaveforms(rpm, this.config, this.latestSweepResult.winding, 120);
      this.charts.updateOscilloscope(waveforms);
    }

    startSpinUpSweep() {
      if (this.isSpinningUp) return;
      this.isSpinningUp = true;
      this.btnSpinUp.style.display = 'none';
      this.btnStopSpin.style.display = 'inline-flex';

      let current = 500;
      const target = 10000;
      const step = 75;
      const intervalMs = 25;

      this.updateRpmState(current, true);

      this.spinUpTimer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          this.updateRpmState(current, true);
          this.stopSpinUpSweep();
        } else {
          this.updateRpmState(current, true);
        }
      }, intervalMs);
    }

    stopSpinUpSweep() {
      this.isSpinningUp = false;
      if (this.spinUpTimer) {
        clearInterval(this.spinUpTimer);
        this.spinUpTimer = null;
      }
      this.btnSpinUp.style.display = 'inline-flex';
      this.btnStopSpin.style.display = 'none';
      this.visualizer.setRpm(this.currentRpm, false);
      this.audio.updateRpm(this.currentRpm, false);
    }

    exportJson() {
      const data = {
        app: 'StatorPredict',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        config: this.config,
        poles: this.poles
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stator-design-${this.config.numStatorPoles}p-${this.config.turnsPerPole}t.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    handleImportJson(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.config && data.poles) {
            this.config = { ...this.config, ...data.config };
            this.poles = data.poles;
            this.syncFormWithConfig();
            this.onTopologyOrPoleChange();
          } else {
            alert('Invalid stator file format.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }

    exportCsv() {
      if (!this.latestSweepResult || !this.latestSweepResult.points) return;
      const points = this.latestSweepResult.points;
      let csv = 'RPM,Power_Watts,DC_Current_Amps,DC_Voltage_Volts,AC_Open_EMF_Vrms,Copper_Loss_Watts,Efficiency_Pct\n';
      points.forEach(p => {
        csv += `${p.rpm},${p.P_out_watts.toFixed(2)},${p.I_load.toFixed(3)},${p.V_load.toFixed(2)},${p.E_ll_rms.toFixed(2)},${p.P_copper_loss.toFixed(2)},${p.efficiency.toFixed(1)}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stator-dyno-sweep-${this.config.numStatorPoles}p-${this.config.turnsPerPole}t.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // Initialize
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new StatorApp();
  });

})();
