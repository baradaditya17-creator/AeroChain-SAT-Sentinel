export interface TelemetryPacket {
  id: string;
  droneId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  battery: number;
  roll: number;
  pitch: number;
  yaw: number;
  // Sat Link Metrics
  latency: number;
  jitter: number;
  packetLoss: number;
  signalStrength: number;
  // Security Layer
  sequence: number;
  signature: string;
  signatureValid: boolean;
  encrypted: boolean;
  hash: string;
  merkleRoot: string;
  batchId: string;
}

export interface AnomalyAlert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  timestamp: string;
  message: string;
  affectedFeatures: string[];
  anomalyScore: number;
  confidence: number;
  status: 'UNRESOLVED' | 'ACKNOWLEDGED' | 'RESOLVED';
  forensics?: string; // Gemini AI explanation
}

export interface SatelliteState {
  id: string;
  tle: {
    line1: string;
    line2: string;
  };
  elevation: number;
  azimuth: number;
  range: number;
  doppler: number;
  snr: number;
  ber: number; // Bit Error Rate
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}

export interface BlockchainAnchor {
  batchId: string;
  merkleRoot: string;
  blockNumber: number;
  txHash: string;
  timestamp: string;
  gasUsed: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  flightId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  details: string;
  ipAddress: string;
}

export interface AgentState {
  id: string;
  name: string;
  status: 'ACTIVE' | 'STANDBY' | 'ALERT' | 'DISABLED';
  role: string;
  currentObjective: string;
  autonomyLevel: 'FULL' | 'APPROVAL_REQUIRED' | 'DISABLED';
}

export interface AgentDecision {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  details: string;
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'VETOED';
  safetyChecks: string[];
}

export interface DelegationLog {
  id: string;
  timestamp: string;
  task: string;
  from: string;
  to: string;
  status: string;
}

export interface SimulationState {
  isPlaying: boolean;
  playbackSpeed: number; // 1x, 2x, 5x, 10x
  scenario: 'SECURE' | 'DEGRADED' | 'TAMPERING' | 'REPLAY' | 'SPOOFING' | 'JAMMING' | 'SIGNATURE_STRIP';
  activeDroneId: string;
  currentPackets: TelemetryPacket[];
  alerts: AnomalyAlert[];
  anchors: BlockchainAnchor[];
  satellites: SatelliteState[];
  logs: AuditLog[];
  aiSensitivity: number; // 0 to 1
  alertThreshold: number; // 0 to 1
  linkJitter: number; // ms
  linkLatency: number; // ms
  linkLoss: number; // %
  linkBandwidth: number; // Mbps
  // Cockpit Multi-Agent Variables
  agents: AgentState[];
  decisions: AgentDecision[];
  delegations: DelegationLog[];
}
