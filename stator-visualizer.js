// Interactive Stator Core & Flywheel Visualizer
// Handles CAD-like rendering of stator laminations, rotor magnets, copper windings,
// wire routing jumpers, and interactive pole clicking & connection editing.

export class StatorVisualizer {
  constructor(canvasElement, onPoleSelectCallback, onWiredCallback) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onPoleSelect = onPoleSelectCallback;
    this.onWired = onWiredCallback;

    this.config = null;
    this.poles = [];
    this.selectedPoleIndex = null;
    this.hoverPoleIndex = null;

    // Wiring connection mode
    this.wiringMode = false;
    this.wiringStartPole = null;

    // Animation & Rotor Rotation
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
          // First pole clicked
          this.wiringStartPole = poleIdx;
          this.render();
        } else {
          // Second pole clicked - connect them!
          if (this.onWired && this.wiringStartPole !== poleIdx) {
            this.onWired(this.wiringStartPole, poleIdx);
          }
          this.wiringStartPole = null;
          this.render();
        }
      } else {
        // Standard pole inspection / selection
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

    // Calculate radii in canvas pixels
    const maxRadius = Math.min(width, height) * 0.45;
    const scale = maxRadius / (this.config.outerDiameter_mm * 0.65);

    const rBore = (this.config.innerDiameter_mm / 2) * scale;
    const rOuter = (this.config.outerDiameter_mm / 2) * scale;

    // Check if mouse is in stator annular zone
    if (dist < rBore * 0.6 || dist > rOuter * 1.15) {
      return null;
    }

    // Determine angular slot
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;

    const nPoles = this.config.numStatorPoles;
    const polePitch = (2 * Math.PI) / nPoles;

    // Tooth centers are at i * polePitch
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
        // Rotate rotor proportional to RPM (scaled for visual frame rate)
        const visualSpeedFactor = 0.05; // visual gear reduction for smooth viewing
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
    // Scale factor: outer diameter stator + flywheel fits nicely
    const flywheelOuter_mm = this.config.outerDiameter_mm * 1.25;
    const scale = maxVisualR / (flywheelOuter_mm / 2);

    const rBore = (this.config.innerDiameter_mm / 2) * scale;
    const rYoke = rBore + ((this.config.outerDiameter_mm - this.config.innerDiameter_mm) * 0.28 / 2) * scale;
    const rStatorOD = (this.config.outerDiameter_mm / 2) * scale;
    const rAirgap = rStatorOD + (this.config.airGap_mm || 0.8) * scale * 2.5; // exaggerated slightly for clarity
    const rFlywheelInner = rAirgap + 2;
    const rFlywheelOuter = rFlywheelInner + 22;

    // 1. Draw Outer Rotor Flywheel & Permanent Magnets
    this.drawRotorFlywheel(ctx, cx, cy, rFlywheelInner, rFlywheelOuter, rAirgap);

    // 2. Draw Stator Steel Core (Back Iron & Teeth)
    this.drawStatorCore(ctx, cx, cy, rBore, rYoke, rStatorOD);

    // 3. Draw Copper Coils & Winding Directions
    this.drawWindings(ctx, cx, cy, rYoke, rStatorOD);

    // 4. Draw Wire Routing Jumpers (Connecting Series Poles)
    this.drawWiringJumpers(ctx, cx, cy, rBore, rYoke);

    // 5. Draw Interactive Selection & Badges
    this.drawInteractiveHighlights(ctx, cx, cy, rStatorOD);

    // 6. Draw Center Hub Details (Mounting Bore, Keyway, Center Label)
    this.drawCenterHub(ctx, cx, cy, rBore);

    ctx.restore();
  }

  drawRotorFlywheel(ctx, cx, cy, rInner, rOuter, rAirgap) {
    const nRotorPoles = this.config.numRotorPoles || 12;
    const polePitch = (2 * Math.PI) / nRotorPoles;

    // Flywheel outer steel housing ring
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter + 4, 0, 2 * Math.PI);
    ctx.arc(cx, cy, rOuter, 0, 2 * Math.PI, true);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Flywheel permanent magnet tiles
    for (let i = 0; i < nRotorPoles; i++) {
      const isNorth = (i % 2 === 0);
      const startAngle = this.rotorAngle_rad + i * polePitch;
      const endAngle = startAngle + polePitch * 0.88; // 88% magnet arc coverage

      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, startAngle, endAngle);
      ctx.arc(cx, cy, rInner, endAngle, startAngle, true);
      ctx.closePath();

      // Magnet color (Red for North, Blue for South)
      ctx.fillStyle = isNorth ? 'rgba(239, 68, 68, 0.85)' : 'rgba(59, 130, 246, 0.85)';
      ctx.fill();
      ctx.strokeStyle = isNorth ? '#b91c1c' : '#1d4ed8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Magnet N / S label
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

    // Airgap guideline
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

    // Draw inner back-iron yoke ring
    ctx.beginPath();
    ctx.arc(cx, cy, rYoke, 0, 2 * Math.PI);
    ctx.arc(cx, cy, rBore, 0, 2 * Math.PI, true);
    ctx.fillStyle = '#334155'; // Laminated electrical steel
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tooth shank width & shoe dimensions
    const toothHalfAngle = polePitch * 0.18;
    const shoeHalfAngle = polePitch * 0.40;

    for (let i = 0; i < nPoles; i++) {
      const toothAngle = i * polePitch;

      // Draw tooth iron body
      ctx.beginPath();
      // Inner root at yoke
      ctx.arc(cx, cy, rYoke, toothAngle - toothHalfAngle, toothAngle + toothHalfAngle);
      // Outer shoe start
      ctx.lineTo(
        cx + Math.cos(toothAngle + toothHalfAngle) * (rStatorOD - 6),
        cy + Math.sin(toothAngle + toothHalfAngle) * (rStatorOD - 6)
      );
      // Tooth shoe wing tip
      ctx.lineTo(
        cx + Math.cos(toothAngle + shoeHalfAngle) * rStatorOD,
        cy + Math.sin(toothAngle + shoeHalfAngle) * rStatorOD
      );
      // Outer shoe curve along bore
      ctx.arc(cx, cy, rStatorOD, toothAngle + shoeHalfAngle, toothAngle - shoeHalfAngle, true);
      // Other shoe wing tip
      ctx.lineTo(
        cx + Math.cos(toothAngle - toothHalfAngle) * (rStatorOD - 6),
        cy + Math.sin(toothAngle - toothHalfAngle) * (rStatorOD - 6)
      );
      ctx.closePath();

      // Dynamic tooth flux illumination when rotor spins!
      let toothFill = '#475569';
      if (this.isSpinning) {
        // Calculate flux from rotating magnets passing this tooth
        const rotorPairs = (this.config.numRotorPoles || 12) / 2;
        const fluxAngle = rotorPairs * (this.rotorAngle_rad - toothAngle);
        const fluxVal = Math.cos(fluxAngle);
        if (fluxVal > 0.3) {
          toothFill = `rgba(239, 68, 68, ${0.3 + fluxVal * 0.4})`; // North induced
        } else if (fluxVal < -0.3) {
          toothFill = `rgba(59, 130, 246, ${0.3 + Math.abs(fluxVal) * 0.4})`; // South induced
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

      // Left and right coil side around tooth shank
      const drawCoilSide = (sideAngle) => {
        ctx.beginPath();
        const rMid = (coilInnerR + coilOuterR) / 2;
        const rLen = (coilOuterR - coilInnerR);
        const perpX = -Math.sin(sideAngle);
        const perpY = Math.cos(sideAngle);

        const bx = cx + Math.cos(sideAngle) * rMid;
        const by = cy + Math.sin(sideAngle) * rMid;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(sideAngle + Math.PI / 2);

        // Coil bundle rectangle
        ctx.beginPath();
        ctx.roundRect(-5, -rLen / 2, 10, rLen, 3);
        ctx.fillStyle = phaseColor.bg;
        ctx.fill();
        ctx.strokeStyle = phaseColor.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      };

      drawCoilSide(toothAngle - toothHalfAngle * 1.3);
      drawCoilSide(toothAngle + toothHalfAngle * 1.3);

      // Winding Direction Indicator badge on tooth
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

      // CW vs CCW text / symbol
      ctx.fillStyle = phaseColor.text;
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const dirText = pole.direction === 'CCW' ? '↶' : '↷';
      ctx.fillText(dirText, tx, ty);
    });
  }

  drawWiringJumpers(ctx, cx, cy, rBore, rYoke) {
    // Group connected poles by phase
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

      // Connect sequential poles in phase
      for (let i = 0; i < phasePoles.length - 1; i++) {
        const p1 = phasePoles[i];
        const p2 = phasePoles[i + 1];

        const a1 = p1.poleIndex * polePitch;
        const a2 = p2.poleIndex * polePitch;

        // Radius of wire jumper ring in back iron
        const wireR = rBore + (rYoke - rBore) * (0.3 + (phaseKey === 'A' ? 0.1 : phaseKey === 'B' ? 0.35 : 0.6));

        const p1x = cx + Math.cos(a1) * wireR;
        const p1y = cy + Math.sin(a1) * wireR;
        const p2x = cx + Math.cos(a2) * wireR;
        const p2y = cy + Math.sin(a2) * wireR;

        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        // Curved jumper arc around the core
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
      const badgeR = rStatorOD - 10;
      const bx = cx + Math.cos(toothAngle) * (rStatorOD + 14);
      const by = cy + Math.sin(toothAngle) * (rStatorOD + 14);

      // Pole Number Badge on outer circumference
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

      // Selected / Wiring highlight ring on tooth
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
    // Crankshaft Center Hole
    ctx.beginPath();
    ctx.arc(cx, cy, rBore, 0, 2 * Math.PI);
    ctx.fillStyle = '#090d16';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Hub Stator Info
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px "Inter", sans-serif';
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
        return { bg: '#dc2626', border: '#ef4444', badgeBorder: '#f87171', text: '#fca5a5' }; // Red
      case 'B':
        return { bg: '#d97706', border: '#f59e0b', badgeBorder: '#fbbf24', text: '#fde68a' }; // Amber
      case 'C':
        return { bg: '#0284c7', border: '#38bdf8', badgeBorder: '#7dd3fc', text: '#bae6fd' }; // Blue
      case 'AUX':
        return { bg: '#7c3aed', border: '#a855f7', badgeBorder: '#c084fc', text: '#e9d5ff' }; // Purple
      default:
        return { bg: '#334155', border: '#475569', badgeBorder: '#64748b', text: '#94a3b8' };
    }
  }
}
