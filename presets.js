// Motorcycle Stator Presets Library
// Real-world motorcycle stator configurations, winding directions, and magnet counts

export const PRESETS = {
  "12p_14m_wye": {
    name: "Modern 12-Pole / 14-Magnet (3-Phase Wye)",
    description: "Standard OEM configuration for modern sportbikes and streetbikes (e.g. Honda CBR, Suzuki SV650, Yamaha MT-07). High efficiency, smooth 3-phase output.",
    outerDiameter_mm: 115,
    innerDiameter_mm: 54,
    coreThickness_mm: 22,
    numStatorPoles: 12,
    numRotorPoles: 14,
    magnetGauss: 8500, // NdFeB sintered rotor magnets
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
    description: "High-capacity touring & superbike stator (e.g. Honda Goldwing, Harley Twin Cam, Suzuki Hayabusa/GSX-R). Delivers 400W+ for heated gear and accessories.",
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
    description: "Delta connected stator for high current at mid-to-high RPM. Lower voltage drop, popular rewinding choice for electric starters and custom builds.",
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
    description: "Classic vintage single-phase full-wave system (Honda CT90 / XR200 / XL185, Yamaha TT250). Alternating CW/CCW poles wound in series.",
    outerDiameter_mm: 88,
    innerDiameter_mm: 36,
    coreThickness_mm: 16,
    numStatorPoles: 8,
    numRotorPoles: 6,
    magnetGauss: 6200, // Ceramic/Alnico vintage flywheel magnets
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
