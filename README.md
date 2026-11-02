# Stator Predict ⚡🏍️
### Visual Motorcycle Stator Winding Designer & Dynamometer Telemetry

**Stator Predict** is an interactive, visual engineering application for designing, rewinding, and predicting the electrical power output of permanent magnet motorcycle alternators and stators.

---

## 🌟 Key Features

1. **Stator Core Geometry & Dimensions**:
   - Stator Outer Diameter ($OD$, mm)
   - Stator Inner Diameter ($ID$, mm)
   - Core Thickness / Lamination Stack Height ($t_{core}$, mm)
   - Number of Stator Salient Poles (teeth / slots, e.g. 6, 8, 12, 18)
   - Airgap clearance ($g$, mm)

2. **Rotor Flywheel Permanent Magnet Configuration**:
   - Permanent magnet strength entered directly in **Gauss** (e.g. 2,000 to 14,000 Gauss / 0.2 to 1.4 Tesla)
   - Number of rotor magnet poles (e.g. 6, 12, 14, 16 poles alternating N-S)
   - Dynamic flux density calculation with leakage and Carter factors

3. **Interactive Visual Stator Core & Wiring Editor**:
   - **Interactive CAD-like Canvas**: Scaled 2D cross-section rendering of the electrical steel yoke, tooth shanks, tooth shoes, and outer flywheel rotor.
   - **Clickable Stator Teeth**: Click on any tooth to inspect its phase, toggle winding direction (↷ Clockwise vs ↶ Counter-Clockwise), or set individual turns.
   - **Pole Wiring Connection Tool**: Click "Connect Poles Tool" to click poles in sequence and link them together with visible wire routing jumpers curving through the core!
   - **Phase Color Coding**: Phase A (Red), Phase B (Amber), Phase C (Blue), Aux (Purple), and Unwound (Gray).
   - **Real-Time Magnetic Flux Induction**: Flywheel magnets rotate on screen; teeth dynamically illuminate with North (red) and South (blue) magnetic flux as rotor poles sweep past them!

4. **Spin-Up Dyno Simulation (500 RPM to 10,000 RPM)**:
   - **One-Click Automated Spin-Up**: "🚀 Spin Up (500 → 10,000 RPM)" animates the engine revving from idle to redline with a live analog tachometer needle!
   - **Interactive RPM Scrubbing**: Slide the RPM bar freely between 500 RPM and 10,000 RPM.
   - **Synthesized Engine Audio**: Optional Web Audio engine exhaust tone and alternator magnetic whine that pitch-shifts with RPM.
   - **Power Output in Watts vs RPM Dyno Curve**:
     - Peak Power marker and exact peak RPM
     - Battery Cut-In RPM (where charging starts)
     - DC charging current (Amps) curve
     - High-RPM redline zone warning (9k–10k RPM)
     - Interactive hover crosshair with exact Watts, Volts, Amps, and efficiency readout
   - **Real-Time AC Oscilloscope**: Displays instantaneous sinusoidal 3-phase waveforms and diode-rectified DC voltage.

5. **Thermal & Electrical Engineering Diagnostics**:
   - **Slot Copper Fill Factor (%)**: Warns if copper wire exceeds slot area (>50% overfill warning).
   - Phase winding resistance $R_s$ ($\Omega$) calculated at 65°C operating oil temperature.
   - Synchronous inductance $L_s$ ($mH$).
   - Total copper wire length required per phase (meters).

6. **Motorcycle Presets Library**:
   - **Modern 12-Pole / 14-Magnet (3-Phase Wye)**: OEM Honda CBR, Suzuki SV650, Yamaha MT-07 style (~280W).
   - **Heavy-Duty 18-Pole / 12-Magnet (3-Phase Wye)**: Touring & superbike (Harley Twin Cam, Goldwing, GSX-R1000, ~420W).
   - **Racing High-Amp 12-Pole Delta ($\Delta$)**: Modified high-current configuration.
   - **Vintage Trail/Dirt Bike 8-Pole Single-Phase**: Classic Honda CT90 / XR200 / XL185 series-wound alternator.
   - **Vintage 6-Pole Dual-Circuit Enduro**: Yamaha DT175 style split headlight AC + battery DC.

7. **Export & Import**:
   - Save custom stator designs to JSON.
   - Load previously saved JSON designs.
   - Export 500–10,000 RPM dyno sweep data to CSV for spreadsheet analysis.

---

## 🚀 Quick Launch

### Windows
- Double-click **`Start-StatorPredict.bat`**
- Or right-click **`Launch.ps1`** -> **Run with PowerShell**
- Or simply double-click **`index.html`** in any web browser!

*Zero installation, zero npm dependencies, zero internet connection required.*

---

## 📚 Electromagnetic Physics Model

The power prediction engine models permanent magnet brushless/alternator physics:

1. **Airgap Flux Density ($B_g$)**:
   $$B_{g, peak} \approx \frac{B_r \cdot t_m}{t_m + g \cdot k_c} \cdot k_{leakage}$$
   where $B_r$ is flywheel magnet remanence (converted from Gauss to Tesla), $g$ is airgap length, $t_m$ is magnet thickness, and $k_c$ is Carter's coefficient.

2. **Induced Tooth Back-EMF**:
   For tooth $k$ at mechanical angle $\theta_k$:
   $$e_k(t) = p_k \cdot N_k \cdot \omega_e \cdot \Phi_{peak} \sin(P_r \cdot (\theta_m(t) - \theta_k))$$
   where $p_k = \pm 1$ represents the winding direction (CW vs CCW), $N_k$ is turns, $\omega_e = P_r \cdot \omega_m$ is electrical angular velocity, and $P_r$ is rotor pole pairs.

3. **Constructive / Destructive Phasor Summation**:
   Phase voltage is the complex vector sum of all coils assigned to that phase:
   $$\tilde{E}_{phase} = \sum_{k \in phase} p_k N_k e^{j \theta_{elec, k}}$$
   This accurately models winding interference: alternating magnet poles require alternating winding directions (CW-CCW-CW-CCW...) to sum constructively; if wound incorrectly, opposing EMF will cancel out.

4. **Synchronous Reactance & High-RPM Saturation**:
   $$Z_s = \sqrt{R_s^2 + (\omega_e L_s)^2}$$
   As engine RPM climbs, synchronous reactance $X_s = \omega_e L_s$ increases proportionally, creating the natural self-limiting current saturation characteristic intrinsic to permanent magnet motorcycle charging systems.
