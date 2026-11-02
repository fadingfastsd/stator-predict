// Stator Predict - Main Application Controller
import { StatorPhysicsEngine, AWG_TABLE } from './stator-physics.js';
import { StatorVisualizer } from './stator-visualizer.js';
import { StatorCharts } from './stator-charts.js';
import { StatorAudio } from './stator-audio.js';
import { PRESETS } from './presets.js';

class StatorApp {
  constructor() {
    this.physics = new StatorPhysicsEngine();
    this.audio = new StatorAudio();

    // Default configuration (Modern 12-pole / 14-magnet 3-phase wye)
    this.config = {
      outerDiameter_mm: 115,
      innerDiameter_mm: 54,
      coreThickness_mm: 22,
      numStatorPoles: 12,
      numRotorPoles: 14,
      magnetGauss: 8500,
      wireAWG: 18,
      turnsPerPole: 38,
      windingTopology: 'wye', // 'wye', 'delta', 'single_phase'
      loadType: 'battery_14v', // 'battery_14v', 'resistive', 'open_circuit'
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
      // 12-pole default alternating CW/CCW pattern
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
    // Canvas Elements
    this.canvasStator = document.getElementById('canvasStator');
    this.canvasPower = document.getElementById('canvasPower');
    this.canvasOsc = document.getElementById('canvasOscilloscope');

    // Controls
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

    // Preset dropdown
    this.selectPreset = document.getElementById('selectPreset');

    // Spin-Up & RPM
    this.sliderRpm = document.getElementById('sliderRpm');
    this.displayRpm = document.getElementById('displayRpm');
    this.btnSpinUp = document.getElementById('btnSpinUp');
    this.btnStopSpin = document.getElementById('btnStopSpin');
    this.btnAudioToggle = document.getElementById('btnAudioToggle');

    // Wiring Mode
    this.btnWiringMode = document.getElementById('btnWiringMode');
    this.wiringStatusBadge = document.getElementById('wiringStatusBadge');

    // Pole Inspector Drawer / Modal
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

    // Quick Actions
    this.btnAutoWireWye = document.getElementById('btnAutoWireWye');
    this.btnAutoWireDelta = document.getElementById('btnAutoWireDelta');
    this.btnAutoWireSingle = document.getElementById('btnAutoWireSingle');
    this.btnAlternateDirs = document.getElementById('btnAlternateDirs');

    // Metric Readouts
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

    // Dyno live tach display
    this.tachNeedle = document.getElementById('tachNeedle');
    this.livePowerWatts = document.getElementById('livePowerWatts');
    this.liveVoltage = document.getElementById('liveVoltage');
    this.liveCurrent = document.getElementById('liveCurrent');

    // Export/Import
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

    // Resize canvases to fit container
    window.addEventListener('resize', () => {
      this.visualizer.resize();
      this.charts.resizeCanvas(this.canvasPower);
      this.charts.resizeCanvas(this.canvasOsc);
      if (this.latestSweepResult) {
        this.charts.updateData(this.latestSweepResult);
        this.updateOscilloscopeWaveforms(this.currentRpm);
      }
    });

    // Initial resize after DOM settles
    setTimeout(() => {
      this.visualizer.resize();
      this.charts.resizeCanvas(this.canvasPower);
      this.charts.resizeCanvas(this.canvasOsc);
      this.runSimulation();
    }, 100);
  }

  bindEvents() {
    // Input changes
    const inputs = [
      this.inputOD, this.inputID, this.inputCoreThick, this.inputStatorPoles,
      this.selectWireAWG, this.inputTurns, this.inputGauss, this.inputRotorPoles,
      this.inputAirgap, this.selectTopology, this.selectLoadType,
      this.inputLoadResistance, this.inputBatteryVoltage
    ];

    inputs.forEach(el => {
      el.addEventListener('input', () => this.handleConfigChange());
    });

    // Preset selection
    this.selectPreset.addEventListener('change', (e) => {
      const key = e.target.value;
      if (key && PRESETS[key]) {
        this.loadPreset(PRESETS[key]);
      }
    });

    // RPM Slider
    this.sliderRpm.addEventListener('input', (e) => {
      const rpm = parseInt(e.target.value, 10);
      this.updateRpmState(rpm, false);
    });

    // Spin-Up buttons
    this.btnSpinUp.addEventListener('click', () => this.startSpinUpSweep());
    this.btnStopSpin.addEventListener('click', () => this.stopSpinUpSweep());

    // Audio Mute toggle
    this.btnAudioToggle.addEventListener('click', () => {
      const isMuted = !this.audio.isMuted;
      this.audio.setMuted(isMuted);
      this.btnAudioToggle.innerHTML = isMuted
        ? '<span class="icon">🔇</span> Sound: OFF'
        : '<span class="icon">🔊</span> Sound: ON';
      this.btnAudioToggle.classList.toggle('active', !isMuted);
    });

    // Wiring Mode Toggle
    this.btnWiringMode.addEventListener('click', () => {
      const active = !this.visualizer.wiringMode;
      this.visualizer.setWiringMode(active);
      this.btnWiringMode.classList.toggle('active', active);
      this.wiringStatusBadge.style.display = active ? 'inline-flex' : 'none';
      if (active) {
        this.closePoleInspector();
      }
    });

    // Pole Inspector Buttons
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

    // Quick Topology Auto-Wire
    this.btnAutoWireWye.addEventListener('click', () => this.autoWireThreePhase('wye'));
    this.btnAutoWireDelta.addEventListener('click', () => this.autoWireThreePhase('delta'));
    this.btnAutoWireSingle.addEventListener('click', () => this.autoWireSinglePhase());
    this.btnAlternateDirs.addEventListener('click', () => this.alternateWindingDirections());

    // Export / Import
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

    // Show/hide load specific inputs
    const isBattery = this.config.loadType === 'battery_14v';
    this.inputBatteryVoltage.parentElement.style.display = isBattery ? 'block' : 'none';
    this.inputLoadResistance.parentElement.style.display = (this.config.loadType === 'resistive') ? 'block' : 'none';

    // Resize pole array if stator pole count changed
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
    // When user connects two poles in wiring mode, match their phase!
    const p1 = this.poles[p1Idx];
    const p2 = this.poles[p2Idx];
    if (p1 && p2) {
      p2.phase = p1.phase;
      p2.enabled = true;
      // Auto-invert direction if odd distance under alternating magnets
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

    // Update Dyno Chart
    this.charts.updateData(sweep);

    // Update Oscilloscope
    this.updateOscilloscopeWaveforms(this.currentRpm);

    // Update Header & Metric Cards
    this.updateMetricsUI(sweep);

    // Update Live Tach Values
    this.updateLiveTach(this.currentRpm);
  }

  updateMetricsUI(sweep) {
    const geom = sweep.geometry;
    const mag = sweep.magnetic;
    const winding = sweep.winding;

    // Peak Power & RPM
    this.metricPeakPower.textContent = `${Math.round(sweep.peakPower_W)} W`;
    this.metricPeakRpm.textContent = `@ ${sweep.peakPowerRpm} RPM`;
    this.metricCutInRpm.textContent = sweep.cutInRpm > 500 ? `${sweep.cutInRpm} RPM` : 'Idle (<500)';

    // Slot Fill Factor
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

    // Phase Resistance & Inductance
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

    // Max DC Amps
    const maxAmps = Math.max(...sweep.points.map(p => p.I_load), 0);
    this.metricMaxAmps.textContent = `${maxAmps.toFixed(1)} A`;

    // Magnetic Flux Density
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

    // Tachometer Needle Rotation (500 RPM = -110 deg, 10000 RPM = +110 deg)
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
    const step = 75; // smooth rev-up
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

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new StatorApp();
});
