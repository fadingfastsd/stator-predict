// Stator Dyno Charting & Oscilloscope Engine
// Zero-dependency, ultra-fast HTML5 Canvas rendering for motorcycle dyno curves and electrical waveforms

export class StatorCharts {
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

    // Find max values for scale
    const maxPowerPoint = Math.max(...points.map(p => p.P_out_watts), 10);
    const maxPower = Math.ceil(maxPowerPoint * 1.15 / 50) * 50; // nice round ceiling

    const maxCurrentPoint = Math.max(...points.map(p => p.I_load), 2);
    const maxCurrent = Math.ceil(maxCurrentPoint * 1.25 / 5) * 5;

    const minRpm = 500;
    const maxRpm = 10000;

    // Coordinate mapping functions
    const getX = (rpm) => padding.left + ((rpm - minRpm) / (maxRpm - minRpm)) * plotW;
    const getYPower = (watts) => padding.top + plotH - (watts / maxPower) * plotH;
    const getYCurrent = (amps) => padding.top + plotH - (amps / maxCurrent) * plotH;

    // Background Grid
    ctx.strokeStyle = '#232936';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Inter", "Segoe UI", sans-serif';

    // Horizontal grid lines (Power)
    const numYDivisions = 5;
    for (let i = 0; i <= numYDivisions; i++) {
      const pVal = (maxPower / numYDivisions) * i;
      const y = getYPower(pVal);

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotW, y);
      ctx.stroke();

      // Left Axis Label (Watts)
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${Math.round(pVal)} W`, padding.left - 8, y);

      // Right Axis Label (Current Amps)
      const iVal = (maxCurrent / numYDivisions) * i;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`${iVal.toFixed(1)} A`, padding.left + plotW + 8, y);
    }

    // Vertical grid lines (RPM)
    const rpmStep = 1000;
    for (let rpm = 1000; rpm <= maxRpm; rpm += rpmStep) {
      const x = getX(rpm);

      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + plotH);
      ctx.strokeStyle = (rpm === 1000 || rpm === 9000) ? '#334155' : '#1e293b';
      ctx.stroke();

      // RPM Label
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#64748b';
      const label = rpm >= 1000 ? `${rpm / 1000}k` : `${rpm}`;
      ctx.fillText(label, x, padding.top + plotH + 8);
    }

    // Redline Zone shading (9,000 - 10,000 RPM)
    const redlineX = getX(9000);
    const endX = getX(10000);
    const redGrad = ctx.createLinearGradient(redlineX, 0, endX, 0);
    redGrad.addColorStop(0, 'rgba(239, 68, 68, 0.03)');
    redGrad.addColorStop(1, 'rgba(239, 68, 68, 0.12)');
    ctx.fillStyle = redGrad;
    ctx.fillRect(redlineX, padding.top, endX - redlineX, plotH);

    // Stator Copper Loss Area Fill (Under Power Curve)
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

    // Plot DC Output Current Line (Amps - Amber/Gold)
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

    // Plot Power Curve (Watts - Bright Cyan Glow)
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
    ctx.shadowBlur = 0; // reset shadow

    // Mark Peak Power
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

      // Peak label badge
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      const peakTxt = `Peak: ${peakPt.P_out_watts.toFixed(0)}W @ ${peakPt.rpm} RPM`;
      const txtW = ctx.measureText(peakTxt).width + 16;
      const badgeX = Math.min(px + 8, width - padding.right - txtW);
      const badgeY = Math.max(py - 22, padding.top + 4);

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY - 12, txtW, 20, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(peakTxt, badgeX + 8, badgeY + 2);
    }

    // Active RPM Live Sweep Indicator (When spinning up engine)
    const activeRpm = this.hoverRpm || this.activeRpmMarker;
    if (activeRpm && activeRpm >= minRpm && activeRpm <= maxRpm) {
      const activeX = getX(activeRpm);

      // Vertical guide line
      ctx.beginPath();
      ctx.moveTo(activeX, padding.top);
      ctx.lineTo(activeX, padding.top + plotH);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Interpolate point at activeRpm
      const match = this.interpolateRpm(activeRpm, points);
      if (match) {
        const py = getYPower(match.P_out_watts);
        const cy = getYCurrent(match.I_load);

        // Dot on power curve
        ctx.beginPath();
        ctx.arc(activeX, py, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Dot on current curve
        ctx.beginPath();
        ctx.arc(activeX, cy, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Hover Readout Tooltip
        this.renderHoverTooltip(ctx, activeX, py, match, width, height, padding);
      }
    }

    // Legend
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
    ctx.roundRect(boxX, boxY, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    lines.forEach((line, idx) => {
      if (idx === 0) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 12px "Inter", sans-serif';
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
    ctx.font = '11px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const lx = padding.left + 15;
    const ly = padding.top - 18;

    // Power
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(lx, ly - 3, 16, 6);
    ctx.fillText('Power Output (Watts)', lx + 22, ly);

    // Current
    const lx2 = lx + 160;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx2, ly);
    ctx.lineTo(lx2 + 16, ly);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('Current (Amps)', lx2 + 22, ly);

    // Redline indicator
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

    // Screen border & CRT grid
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

    // Zero center line
    const zeroY = height / 2;
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(width, zeroY);
    ctx.stroke();

    const n = waveforms.time.length;
    if (n === 0) return;

    // Determine vertical scaling
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

    // Draw Phase A (Red/Pink), Phase B (Amber), Phase C (Blue), and DC (White glow)
    drawWave(waveforms.phaseA, '#f43f5e', 1.8);
    drawWave(waveforms.phaseB, '#eab308', 1.8);
    drawWave(waveforms.phaseC, '#38bdf8', 1.8);
    drawWave(waveforms.rectifiedDc, '#4ade80', 2.2, [4, 2]);

    // Oscilloscope Overlay Info
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
