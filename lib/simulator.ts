import { TelemetryPacket, AnomalyAlert, BlockchainAnchor, SatelliteState, AuditLog, SimulationState, AgentState, AgentDecision, DelegationLog } from '../types/telemetry';

// In-Memory Database for persistence during the session
class SimulatorStore {
  private state: SimulationState;
  private pathAngle = 0;
  private packetSequence = 1000;
  private blockHeight = 4589201;
  private batchCounter = 1;

  constructor() {
    this.state = {
      isPlaying: true,
      playbackSpeed: 1,
      scenario: 'SECURE',
      activeDroneId: 'DRONE-01',
      currentPackets: [],
      alerts: [],
      anchors: [],
      satellites: [
        {
          id: 'SAT-ALPHA-7',
          tle: {
            line1: '1 25544U 98067A   26261.56423611  .00001234  00000-0  12345-4 0  9993',
            line2: '2 25544  51.6432 123.4567 0001234  45.6789  89.0123 15.49234512 12345',
          },
          elevation: 45.2,
          azimuth: 112.8,
          range: 358.4,
          doppler: 2.45,
          snr: 16.8,
          ber: 1e-6,
          status: 'ONLINE',
        },
        {
          id: 'SAT-BETA-4',
          tle: {
            line1: '1 43012U 17073A   26261.34512341  .00000452  00000-0  45123-5 0  9991',
            line2: '2 43012  97.4512 210.8761 0000452 112.1231  45.9812 14.12345121  8912',
          },
          elevation: 12.4,
          azimuth: 245.1,
          range: 1240.2,
          doppler: -1.12,
          snr: 9.4,
          ber: 2.1e-4,
          status: 'ONLINE',
        }
      ],
      logs: [
        {
          id: 'log-0',
          timestamp: new Date().toISOString(),
          operator: 'SYSTEM',
          action: 'BOOT_UP',
          details: 'AeroChain-SAT Command Center online. Secure flight link initiated.',
          ipAddress: '127.0.0.1',
        }
      ],
      aiSensitivity: 0.75,
      alertThreshold: 0.60,
      linkJitter: 4,
      linkLatency: 85,
      linkLoss: 0.5,
      linkBandwidth: 45,
      // 15 Cockpit Specialized Agents
      agents: [
        { id: 'agent-orchestrator', name: 'Orchestrator Agent', status: 'ACTIVE', role: 'Top-Level Coordinator', currentObjective: 'Coordinate specialist agents and manage human-in-the-loop decisions.', autonomyLevel: 'FULL' },
        { id: 'agent-planner', name: 'Mission Planner Agent', status: 'ACTIVE', role: 'Flight Path & Waypoints Generator', currentObjective: 'Optimizing mission flight tracks and tracking satellite AOS/LOS.', autonomyLevel: 'FULL' },
        { id: 'agent-safety', name: 'Safety Agent', status: 'ACTIVE', role: 'Safety Safeguards Monitor', currentObjective: 'Enforcing physical geofencing rules and battery envelopes.', autonomyLevel: 'APPROVAL_REQUIRED' },
        { id: 'agent-analyst', name: 'Telemetry Analyst Agent', status: 'ACTIVE', role: 'Telemetry & MAVLink Stream Parser', currentObjective: 'Parsing raw packet streams to detect attitude drifts.', autonomyLevel: 'FULL' },
        { id: 'agent-optimizer', name: 'Channel Optimizer Agent', status: 'ACTIVE', role: 'Bandwidth & Packet Optimizer', currentObjective: 'Tuning error correction matrices and compression scales.', autonomyLevel: 'FULL' },
        { id: 'agent-ids', name: 'Intrusion Detection Agent', status: 'ACTIVE', role: 'Cybersecurity Threat Detection', currentObjective: 'Verifying Merkle root sequence and crypto signatures.', autonomyLevel: 'FULL' },
        { id: 'agent-incident', name: 'Incident Response Agent', status: 'ACTIVE', role: 'Containment & Incident Remediation', currentObjective: 'Quarantining non-verified telemetry files on active signals.', autonomyLevel: 'APPROVAL_REQUIRED' },
        { id: 'agent-blue', name: 'Blue Team Agent', status: 'ACTIVE', role: 'Defensive Strategy Compiler', currentObjective: 'Harden network settings and suggest rule upgrades to IDS.', autonomyLevel: 'FULL' },
        { id: 'agent-weather', name: 'Space Weather Agent', status: 'ACTIVE', role: 'Geomagnetic Solar Flux Monitor', currentObjective: 'Polling NOAA SWPC alerts for ionospheric disturbances.', autonomyLevel: 'FULL' },
        { id: 'agent-audit', name: 'Audit Agent', status: 'ACTIVE', role: 'Ledger Audit Inspector', currentObjective: 'Cross-verifying on-chain receipts with current DB cache.', autonomyLevel: 'FULL' },
        { id: 'agent-anchoring', name: 'Anchoring Agent', status: 'ACTIVE', role: 'Merkle Root Anchor Scheduler', currentObjective: 'Coordinating batch schedules to ledger testnets.', autonomyLevel: 'APPROVAL_REQUIRED' },
        { id: 'agent-guardian', name: 'Smart Contract Guardian Agent', status: 'ACTIVE', role: 'Blockchain Security Guard', currentObjective: 'Auditing smart contract events and gas margins.', autonomyLevel: 'FULL' },
        { id: 'agent-link', name: 'Link Manager Agent', status: 'ACTIVE', role: 'Orbit & Sat-link Tracker', currentObjective: 'Predicting orbit passes and Doppler shift variables.', autonomyLevel: 'FULL' },
        { id: 'agent-red', name: 'Red Team Agent', status: 'STANDBY', role: 'Isolated Exploit Simulator', currentObjective: 'Standby for authorized lab security tests.', autonomyLevel: 'FULL' },
        { id: 'agent-forensics', name: 'Forensics Agent', status: 'ACTIVE', role: 'Chain-Of-Custody Forensic Analyst', currentObjective: 'Assembling chronological reports of attack vectors.', autonomyLevel: 'FULL' }
      ],
      decisions: [],
      delegations: []
    };

    // Prepopulate some anchors and historic logs to make the UI populated immediately
    this.prepopulateHistory();

    // Start background simulation loop
    if (typeof window === 'undefined') {
      setInterval(() => {
        if (this.state.isPlaying) {
          this.tick();
        }
      }, 2000);
    }
  }

  private prepopulateHistory() {
    // Generate some historic anchors
    for (let i = 5; i > 0; i--) {
      const batchId = `BATCH-00${this.batchCounter++}`;
      const block = this.blockHeight - i * 12;
      this.state.anchors.push({
        batchId,
        merkleRoot: this.generateFakeHash(`merkle-root-${batchId}`),
        blockNumber: block,
        txHash: `0x${this.generateFakeHash(`tx-${block}`).substring(0, 40)}`,
        timestamp: new Date(Date.now() - i * 30000).toISOString(),
        gasUsed: 42100 + Math.floor(Math.random() * 8000),
        status: 'CONFIRMED',
        flightId: 'FLIGHT-042',
      });
    }

    // Generate historic alerts
    this.state.alerts.push({
      id: 'alert-historic-1',
      severity: 'LOW',
      type: 'LINK_DEGRADATION',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      message: 'Satellite Link SNR dropped below 10dB during maximum elevation transit.',
      affectedFeatures: ['signalStrength', 'latency'],
      anomalyScore: 0.45,
      confidence: 0.88,
      status: 'RESOLVED',
      forensics: 'Atmospheric attenuation detected. Satellite coverage window passing standard. Connection established automatically via backup Sat link.',
    });
  }

  public getState(): SimulationState {
    return this.state;
  }

  public updateSettings(settings: Partial<SimulationState>) {
    this.state = {
      ...this.state,
      ...settings,
    };
    this.addLog('CONFIG_UPDATE', 'System settings updated via administrative control panel.', 'Operator-Admin');
  }

  public addLog(action: string, details: string, operator = 'Operator-Active') {
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      operator,
      action,
      details,
      ipAddress: '192.168.1.104',
    };
    this.state.logs.unshift(log);
    // Keep logs size bounded
    if (this.state.logs.length > 100) {
      this.state.logs.pop();
    }
  }

  public changeScenario(scenario: SimulationState['scenario']) {
    this.state.scenario = scenario;
    this.addLog('SCENARIO_CHANGE', `Simulation scenario switched to: ${scenario}`, 'Command-Suite');

    // Trigger immediate alert if anomalous scenario selected
    if (scenario !== 'SECURE') {
      this.triggerImmediateAlert(scenario);
    }
  }

  private triggerImmediateAlert(scenario: SimulationState['scenario']) {
    let alert: AnomalyAlert;
    const now = new Date().toISOString();

    switch (scenario) {
      case 'TAMPERING':
        alert = {
          id: `alert-${Date.now()}`,
          severity: 'HIGH',
          type: 'TELEMETRY_TAMPERING',
          timestamp: now,
          message: 'CRITICAL: Telemetry packet signature verification failure! Field "altitude" mismatch.',
          affectedFeatures: ['altitude', 'signatureValid', 'hash'],
          anomalyScore: 0.94,
          confidence: 0.98,
          status: 'UNRESOLVED',
          forensics: 'A digital signature validation mismatch occurred. Received hash did not correspond to the payload decrypted using the expected Ed25519 satellite verification public key.',
        };
        break;
      case 'REPLAY':
        alert = {
          id: `alert-${Date.now()}`,
          severity: 'HIGH',
          type: 'REPLAY_ATTACK',
          timestamp: now,
          message: 'WARNING: Replay anomaly detected! Sequence number pattern mismatch in satellite buffer queue.',
          affectedFeatures: ['sequence', 'timestamp'],
          anomalyScore: 0.88,
          confidence: 0.92,
          status: 'UNRESOLVED',
          forensics: 'Detected identical telemetry timestamp sequences received in consecutive intervals. This indicates packet interception and re-transmission through non-authorized relays.',
        };
        break;
      case 'SPOOFING':
        alert = {
          id: `alert-${Date.now()}`,
          severity: 'CRITICAL',
          type: 'GPS_SPOOFING',
          timestamp: now,
          message: 'CRITICAL: Severe GPS drift detected! Distance deviation from flight-plan trajectory exceeds safety threshold of 250 meters.',
          affectedFeatures: ['latitude', 'longitude', 'altitude'],
          anomalyScore: 0.97,
          confidence: 0.95,
          status: 'UNRESOLVED',
          forensics: 'Synthetic coordinate validation against estimated trajectory models indicates artificial GPS injection. Inertial navigation values differ significantly from satellite reports.',
        };
        break;
      case 'JAMMING':
        alert = {
          id: `alert-${Date.now()}`,
          severity: 'MEDIUM',
          type: 'SIGNAL_JAMMING',
          timestamp: now,
          message: 'WARNING: RF interference levels rising! Packet transmission rate degradation detected on secondary L-band link.',
          affectedFeatures: ['signalStrength', 'packetLoss', 'jitter'],
          anomalyScore: 0.72,
          confidence: 0.84,
          status: 'UNRESOLVED',
          forensics: 'Telemetry payload latency spiked above 450ms with 35% packet loss on the primary uplink beam, indicating localized ground signal interference.',
        };
        break;
      case 'SIGNATURE_STRIP':
        alert = {
          id: `alert-${Date.now()}`,
          severity: 'CRITICAL',
          type: 'SIGNATURE_STRIPPING',
          timestamp: now,
          message: 'CRITICAL: Security layer violation! Telemetry packet arrived with missing cryptographic signature credentials.',
          affectedFeatures: ['signature', 'signatureValid'],
          anomalyScore: 0.99,
          confidence: 1.00,
          status: 'UNRESOLVED',
          forensics: 'A raw telemetry frame arrived completely stripped of the standard cryptographic Ed25519 signature payload. This suggests Man-In-The-Middle manipulation attempting payload validation bypass.',
        };
        break;
      case 'DEGRADED':
        alert = {
          id: `alert-${Date.now()}`,
          severity: 'MEDIUM',
          type: 'LINK_DEGRADATION',
          timestamp: now,
          message: 'ALERT: Link SNR dropped below 12dB. Jitter rising beyond 15ms.',
          affectedFeatures: ['signalStrength', 'jitter', 'latency'],
          anomalyScore: 0.58,
          confidence: 0.91,
          status: 'UNRESOLVED',
        };
        break;
      default:
        return;
    }

    this.state.alerts.unshift(alert);
    if (this.state.alerts.length > 50) {
      this.state.alerts.pop();
    }
  }

  public acknowledgeAlert(id: string) {
    const alert = this.state.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'ACKNOWLEDGED';
      this.addLog('ALERT_ACKNOWLEDGE', `Alert [${alert.type}] acknowledged by Operator.`, 'Operator-Active');
    }
  }

  public resolveAlert(id: string) {
    const alert = this.state.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'RESOLVED';
      this.addLog('ALERT_RESOLVED', `Alert [${alert.type}] marked as resolved.`, 'Operator-Active');
    }
  }

  public clearAllAlerts() {
    this.state.alerts = [];
    this.addLog('ALERTS_CLEAR', 'All operational anomaly alerts cleared from active console queue.', 'Operator-Admin');
  }

  public approveDecision(id: string) {
    const decision = this.state.decisions.find(d => d.id === id);
    if (decision) {
      decision.status = 'APPROVED';
      this.addLog('AGENT_DECISION_APPROVED', `${decision.agentName} action approved: ${decision.action}. Details: ${decision.details}`, 'Operator-Active');
      
      // Act on the approved decision dynamically!
      if (decision.action.includes('RTL') || decision.action.includes('Return-to-Home')) {
        this.addLog('FLIGHT_CONTROL', 'CRITICAL SAFETY DIRECTIVE: Command "Return to Home (RTL)" executed by ground controller.', 'Orchestrator-Main');
      } else if (decision.action.includes('Anchor')) {
        this.addLog('BLOCKCHAIN_TX', 'BLOCKCHAIN COMPLIANCE: Manual Polygon Mainnet payload anchor verified & recorded.', 'Anchoring-Agent');
      } else if (decision.action.includes('Quarantine')) {
        this.addLog('INCIDENT_RESPONSE', 'SECURITY REMEDIATION: Batch isolated and quarantined successfully.', 'Incident-Response');
      }
    }
  }

  public vetoDecision(id: string) {
    const decision = this.state.decisions.find(d => d.id === id);
    if (decision) {
      decision.status = 'VETOED';
      this.addLog('AGENT_DECISION_VETOED', `${decision.agentName} proposed action vetoed by Operator: ${decision.action}`, 'Operator-Active');
    }
  }

  public changeAgentPolicy(id: string, autonomyLevel: 'FULL' | 'APPROVAL_REQUIRED' | 'DISABLED') {
    const agent = this.state.agents.find(a => a.id === id);
    if (agent) {
      agent.autonomyLevel = autonomyLevel;
      agent.status = autonomyLevel === 'DISABLED' ? 'DISABLED' : 'ACTIVE';
      this.addLog('AGENT_POLICY_CHANGE', `Autonomy policy for [${agent.name}] updated to: ${autonomyLevel}`, 'Operator-Admin');
    }
  }

  // Calculate standard Merkle tree and anchor a telemetry batch conceptually on-chain
  public anchorBatch() {
    if (this.state.currentPackets.length === 0) return null;

    const batchId = `BATCH-00${this.batchCounter++}`;
    const hashes = this.state.currentPackets.map(p => p.hash);
    const root = this.computeMerkleRoot(hashes);

    this.blockHeight += Math.floor(Math.random() * 3) + 1;
    const txHash = `0x${this.generateFakeHash(`anchor-${batchId}-${this.blockHeight}`)}`;

    const newAnchor: BlockchainAnchor = {
      batchId,
      merkleRoot: root,
      blockNumber: this.blockHeight,
      txHash,
      timestamp: new Date().toISOString(),
      gasUsed: 45000 + Math.floor(Math.random() * 5000),
      status: 'CONFIRMED',
      flightId: 'FLIGHT-042',
    };

    this.state.anchors.unshift(newAnchor);
    if (this.state.anchors.length > 40) {
      this.state.anchors.pop();
    }

    this.addLog('BLOCKCHAIN_ANCHOR', `Telemetry batch anchored. Merkle Root: ${root.substring(0, 16)}... Block: ${this.blockHeight}`, 'Smart-Contract');
    return newAnchor;
  }

  private computeMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return this.generateFakeHash('empty-root');
    let currentLevel = [...hashes];

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left; // duplicate if odd number of nodes
        nextLevel.push(this.generateFakeHash(left + right));
      }
      currentLevel = nextLevel;
    }

    return currentLevel[0];
  }

  private generateFakeHash(input: string): string {
    // Standard modular deterministic hash string
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padEnd(8, '0');
    // Mirroring a real sha256 output length
    return Array(8).fill(hex).join('').substring(0, 64);
  }

  // Central simulation update ticks (runs continuously)
  public tick() {
    this.pathAngle += 0.05 * this.state.playbackSpeed;

    // Simulate satellites orbiting
    this.state.satellites = this.state.satellites.map((sat, index) => {
      const angleOffset = index * Math.PI;
      const speed = 0.02 * this.state.playbackSpeed;
      const orbitalAngle = (this.pathAngle * speed + angleOffset) % (2 * Math.PI);

      // elevation peaks and drops as satellite orbits
      const rawElevation = Math.sin(orbitalAngle) * 90;
      const elevation = Math.max(0.1, parseFloat((rawElevation).toFixed(1)));
      const azimuth = parseFloat(((orbitalAngle * (180 / Math.PI)) % 360).toFixed(1));
      const range = parseFloat((350 + (100 - elevation) * 10).toFixed(1));
      const doppler = parseFloat((Math.cos(orbitalAngle) * 4.5).toFixed(2));

      // Calculate signal metrics based on elevations and current channel simulator settings
      let lossCoeff = this.state.scenario === 'JAMMING' ? 45 : this.state.linkLoss;
      let latencyCoeff = this.state.scenario === 'JAMMING' ? 420 : this.state.linkLatency;
      let jitterCoeff = this.state.scenario === 'JAMMING' ? 38 : this.state.linkJitter;

      let snr = 18.5 - (range / 150) - (lossCoeff * 0.1);
      snr = parseFloat(Math.max(1.2, snr).toFixed(1));

      let ber = 1e-7 * Math.pow(10, (18 - snr) / 4);
      if (this.state.scenario === 'JAMMING') ber = parseFloat((0.012).toExponential(3));

      return {
        ...sat,
        elevation,
        azimuth,
        range,
        doppler,
        snr,
        ber,
        status: snr < 6 ? 'OFFLINE' : snr < 10 ? 'DEGRADED' : 'ONLINE',
      };
    });

    // Generate telemetry coordinates using an elegant pre-planned flight route
    // Centered around coordinate: lat: 37.7749, lng: -122.4194 (Silicon Valley drone flight path)
    const baseLat = 37.7749;
    const baseLng = -122.4194;
    const radius = 0.015;

    let latitude = baseLat + Math.sin(this.pathAngle) * radius;
    let longitude = baseLng + Math.cos(this.pathAngle) * radius * 1.4;
    let altitude = 120 + Math.sin(this.pathAngle * 2) * 20;
    let speed = 14 + Math.cos(this.pathAngle * 3) * 3;
    let heading = Math.floor((360 - (this.pathAngle * (180 / Math.PI))) % 360);
    let battery = Math.max(1, parseFloat((95 - this.pathAngle * 0.1).toFixed(1)));

    let roll = parseFloat((Math.sin(this.pathAngle * 3) * 15).toFixed(1));
    let pitch = parseFloat((Math.cos(this.pathAngle * 2) * 8).toFixed(1));
    let yaw = heading;

    // Apply Cyber Simulation alterations if an anomalous scenario is active
    let signatureValid = true;
    let signature = `sig_ed25519_${this.generateFakeHash(`packet-${this.packetSequence}`)}`;
    let encrypted = true;

    if (this.state.scenario === 'TAMPERING') {
      // Tamper values inside telemetry packet pipeline manually
      altitude = 480; // Spoofed altitude spike
      roll = 65; // Abnormal roll angle
      signatureValid = false; // Cryptographic validation fails!
    } else if (this.state.scenario === 'SPOOFING') {
      // Simulate extreme GPS drift (coordinate teleportation anomaly)
      latitude = baseLat + 0.142; // Drifting far off track
      longitude = baseLng - 0.098;
      speed = 78; // Drastic velocity change
    } else if (this.state.scenario === 'REPLAY') {
      // Freeze timestamp and replay previous logs
      latitude = baseLat + Math.sin(this.pathAngle - 0.1) * radius;
      longitude = baseLng + Math.cos(this.pathAngle - 0.1) * radius * 1.4;
      battery = 88;
      altitude = 124;
    } else if (this.state.scenario === 'SIGNATURE_STRIP') {
      // Completely strip the cryptographic signature
      signature = '';
      signatureValid = false;
    }

    const payloadString = `${latitude}-${longitude}-${altitude}-${speed}-${this.packetSequence}`;
    const calculatedHash = this.generateFakeHash(payloadString);

    // Create the Telemetry Packet
    const packet: TelemetryPacket = {
      id: `packet-${Date.now()}-${this.packetSequence}`,
      droneId: this.state.activeDroneId,
      timestamp: new Date().toISOString(),
      latitude: parseFloat(latitude.toFixed(6)),
      longitude: parseFloat(longitude.toFixed(6)),
      altitude: parseFloat(altitude.toFixed(1)),
      speed: parseFloat(speed.toFixed(1)),
      heading,
      battery,
      roll,
      pitch,
      yaw,
      // Apply active channel simulator noise
      latency: Math.floor(this.state.linkLatency + Math.random() * this.state.linkJitter),
      jitter: Math.floor(Math.random() * this.state.linkJitter),
      packetLoss: this.state.scenario === 'JAMMING' ? 38 : this.state.linkLoss,
      signalStrength: this.state.scenario === 'JAMMING' ? 12 : Math.max(10, Math.floor(88 - this.state.linkLoss * 1.5)),
      sequence: this.packetSequence++,
      signature,
      signatureValid,
      encrypted,
      hash: calculatedHash,
      merkleRoot: '',
      batchId: `BATCH-00${Math.ceil(this.batchCounter)}`,
    };

    // Pre-calculate latest Merkle tree assignments on telemetry queue
    this.state.currentPackets.unshift(packet);
    if (this.state.currentPackets.length > 20) {
      this.state.currentPackets.pop();
    }

    // Auto-anchor to block every 10 packets
    if (this.packetSequence % 10 === 0) {
      this.anchorBatch();
    }

    // --- Simulate Active Multi-Agent Cockpit Events ---
    // Periodically update active agent actions, delegation flows, and pending operator decisions
    const tickCount = this.packetSequence;
    
    // Clear out very old decisions to prevent queue bloat
    if (this.state.decisions.length > 15) {
      this.state.decisions = this.state.decisions.filter(d => d.status === 'PENDING');
    }
    
    // 1. Dynamic Space Weather Warnings
    const spaceWeatherAgent = this.state.agents.find(a => a.id === 'agent-weather');
    if (spaceWeatherAgent) {
      if (this.state.scenario === 'DEGRADED') {
        spaceWeatherAgent.status = 'ALERT';
        spaceWeatherAgent.currentObjective = 'Solar storm active. Tracking L-band solar scintillations.';
        // Post weather advisory decision
        if (!this.state.decisions.some(d => d.agentId === 'agent-weather')) {
          this.state.decisions.unshift({
            id: `dec-weather-${Date.now()}`,
            agentId: 'agent-weather',
            agentName: 'Space Weather Agent',
            action: 'Classify Link Disturbance',
            details: 'Solar Radio Burst detected by NOAA SWPC. Advise against mistaking SNR drops for active jamming.',
            timestamp: new Date().toISOString(),
            status: 'PENDING',
            safetyChecks: ['Compare SNR with solar flux index', 'Correlate loss across multiple bands']
          });
          this.addDelegation('Monitor solar storm scintillation', 'Orchestrator Agent', 'Space Weather Agent');
        }
      } else {
        spaceWeatherAgent.status = 'ACTIVE';
        spaceWeatherAgent.currentObjective = 'Polling NOAA SWPC alerts for ionospheric disturbances.';
      }
    }

    // 2. Safety Agent Warnings
    const safetyAgent = this.state.agents.find(a => a.id === 'agent-safety');
    if (safetyAgent) {
      if (this.state.scenario === 'SPOOFING' || this.state.scenario === 'TAMPERING') {
        safetyAgent.status = 'ALERT';
        safetyAgent.currentObjective = 'Severe attitude deviation or geofence boundary breached!';
        
        if (!this.state.decisions.some(d => d.agentId === 'agent-safety' && d.status === 'PENDING')) {
          this.state.decisions.unshift({
            id: `dec-safety-${Date.now()}`,
            agentId: 'agent-safety',
            agentName: 'Safety Agent',
            action: 'Trigger Emergency Return-to-Home (RTL)',
            details: 'Force safe drone recovery sequence due to unverified coordinates or anomalous payload data.',
            timestamp: new Date().toISOString(),
            status: 'PENDING',
            safetyChecks: ['Verify battery status > 25%', 'Compute direct line safety corridor']
          });
          this.addDelegation('Enforce flight safety corridors', 'Orchestrator Agent', 'Safety Agent');
        }
      } else {
        safetyAgent.status = 'ACTIVE';
        safetyAgent.currentObjective = 'Enforcing physical geofencing rules and battery envelopes.';
      }
    }

    // 3. Incident Response and IDS Alerts
    const idsAgent = this.state.agents.find(a => a.id === 'agent-ids');
    const incidentAgent = this.state.agents.find(a => a.id === 'agent-incident');
    if (idsAgent && incidentAgent) {
      if (this.state.scenario !== 'SECURE' && this.state.scenario !== 'DEGRADED') {
        idsAgent.status = 'ALERT';
        incidentAgent.status = 'ALERT';
        incidentAgent.currentObjective = 'Active mitigation: quarantine corrupt packet blocks.';
        
        if (!this.state.decisions.some(d => d.agentId === 'agent-incident' && d.status === 'PENDING')) {
          this.state.decisions.unshift({
            id: `dec-incident-${Date.now()}`,
            agentId: 'agent-incident',
            agentName: 'Incident Response Agent',
            action: 'Quarantine Telemetry Batch',
            details: `Isolate and blacklist BATCH-00${Math.ceil(this.batchCounter)} from entering blockchain ledger cache.`,
            timestamp: new Date().toISOString(),
            status: 'PENDING',
            safetyChecks: ['Verify digital signature authenticity', 'Inspect sequence index gap']
          });
          this.addDelegation('Deploy signature fail containment', 'Orchestrator Agent', 'Incident Response Agent');
        }
      } else {
        idsAgent.status = 'ACTIVE';
        incidentAgent.status = 'ACTIVE';
        incidentAgent.currentObjective = 'Quarantining non-verified telemetry files on active signals.';
      }
    }

    // 4. Anchoring Agent batch queues
    const anchoringAgent = this.state.agents.find(a => a.id === 'agent-anchoring');
    if (anchoringAgent && tickCount % 8 === 0) {
      if (!this.state.decisions.some(d => d.agentId === 'agent-anchoring' && d.status === 'PENDING')) {
        this.state.decisions.unshift({
          id: `dec-anchor-${Date.now()}`,
          agentId: 'agent-anchoring',
          agentName: 'Anchoring Agent',
          action: 'Anchor Telemetry Batch to Polygon Mainnet',
          details: `Publish cryptographic root for batch BATCH-00${Math.ceil(this.batchCounter)} (estimated Gas: 0.012 MATIC).`,
          timestamp: new Date().toISOString(),
          status: 'PENDING',
          safetyChecks: ['Verify Merkle root integrity', 'Check gas fee priority settings']
        });
        this.addDelegation('Schedule block anchoring transaction', 'Orchestrator Agent', 'Anchoring Agent');
      }
    }
  }

  private addDelegation(task: string, from: string, to: string) {
    const delegation: DelegationLog = {
      id: `del-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      task,
      from,
      to,
      status: 'EXECUTING'
    };
    this.state.delegations.unshift(delegation);
    if (this.state.delegations.length > 50) {
      this.state.delegations.pop();
    }
  }
}

// Global Singleton for persistence across Hot Module Reloads during development
const globalForSimulator = global as unknown as { simulatorStore?: SimulatorStore };
export const simulatorStore = globalForSimulator.simulatorStore || new SimulatorStore();

if (process.env.NODE_ENV !== 'production') {
  globalForSimulator.simulatorStore = simulatorStore;
}
