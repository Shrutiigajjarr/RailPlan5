// Mock dataset for RailPlan - Indian Railways Maintenance Planning Platform
// Division: Western Railway - Ahmedabad Division (ADI)
// Departments: Engineering, S&T (Signal & Telecommunication), Traction Distribution (TRD), Central Control

export const DEPARTMENTS = {
  ENGINEERING: 'Engineering',
  ST: 'S&T',
  TRACTION: 'Traction Distribution',
  CONTROL: 'Central Control'
};

export const INITIAL_SECTIONS = [
  { id: 'SEC-01', code: 'ADI-VRL-01', name: 'Ahmedabad - Viramgam Section (Line 1)', lengthKm: 65, maxSpeed: 110, trackLines: ['Up Line', 'Down Line'] },
  { id: 'SEC-02', code: 'ADI-BRC-01', name: 'Ahmedabad - Nadiad Section (Up Line)', lengthKm: 46, maxSpeed: 130, trackLines: ['Up Line', 'Down Line', 'Both Lines'] },
  { id: 'SEC-03', code: 'BRC-ST-01', name: 'Vadodara - Bharuch Section (Up Line)', lengthKm: 71, maxSpeed: 130, trackLines: ['Up Line', 'Down Line'] },
  { id: 'SEC-04', code: 'ADI-HAPA-01', name: 'Ahmedabad - Surendranagar Section', lengthKm: 130, maxSpeed: 110, trackLines: ['Up Line', 'Down Line', 'Both Lines'] },
  { id: 'SEC-05', code: 'ADI-PNU-03', name: 'Kalol - Palanpur Freight Corridor', lengthKm: 112, maxSpeed: 100, trackLines: ['Both Lines', 'Yard Siding'] }
];

export const AVAILABLE_BLOCKS = [
  { blockId: 'MB-101', section: 'SEC-01', name: 'Viramgam Outer Block 1', date: '2026-08-31', availableFrom: '06:00', availableUntil: '09:00', maxDurationMinutes: 180 },
  { blockId: 'MB-102', section: 'SEC-01', name: 'Viramgam Outer Block 2', date: '2026-08-31', availableFrom: '13:00', availableUntil: '16:00', maxDurationMinutes: 180 },
  { blockId: 'MB-201', section: 'SEC-02', name: 'Nadiad Corridor Block 1', date: '2026-08-31', availableFrom: '08:30', availableUntil: '11:00', maxDurationMinutes: 150 },
  { blockId: 'MB-202', section: 'SEC-02', name: 'Sabarmati Yard Block', date: '2026-08-31', availableFrom: '12:30', availableUntil: '15:30', maxDurationMinutes: 180 },
  { blockId: 'MB-203', section: 'SEC-02', name: 'Nadiad - Anand Block 2', date: '2026-08-31', availableFrom: '16:00', availableUntil: '19:00', maxDurationMinutes: 180 },
  { blockId: 'MB-204', section: 'SEC-04', name: 'Surendranagar Track Block', date: '2026-08-31', availableFrom: '12:30', availableUntil: '16:30', maxDurationMinutes: 240 },
  { blockId: 'MB-301', section: 'SEC-03', name: 'Bharuch OHE Power Block', date: '2026-08-31', availableFrom: '10:00', availableUntil: '13:00', maxDurationMinutes: 180 },
  { blockId: 'MB-302', section: 'SEC-03', name: 'Vadodara South Block', date: '2026-08-31', availableFrom: '14:00', availableUntil: '17:30', maxDurationMinutes: 210 },
  { blockId: 'MB-401', section: 'SEC-04', name: 'Surendranagar Night Block', date: '2026-08-31', availableFrom: '22:00', availableUntil: '04:00', maxDurationMinutes: 360 },
  { blockId: 'MB-501', section: 'SEC-05', name: 'Palanpur Freight Window Day', date: '2026-08-31', availableFrom: '11:00', availableUntil: '15:00', maxDurationMinutes: 240 },
  { blockId: 'MB-502', section: 'SEC-05', name: 'Palanpur Freight Window Night', date: '2026-08-31', availableFrom: '22:00', availableUntil: '03:00', maxDurationMinutes: 300 }
];

export const MOCK_TRAINS = [
  { trainId: 'T-182', trainNo: '12958', name: 'New Delhi - Ahmedabad Swarna Jayanti Rajdhani', section: 'SEC-04', start: '10:00', end: '10:45', priority: 'Superfast Rajdhani', timetableAvailable: true, maxSpeed: 130 },
  { trainId: 'T-201', trainNo: '20901', name: 'Mumbai Central - Gandhinagar Vande Bharat Exp', section: 'SEC-02', start: '11:00', end: '12:30', priority: 'High Speed Passenger', timetableAvailable: true, maxSpeed: 130 },
  { trainId: 'T-105', trainNo: '19015', name: 'Saurashtra Express', section: 'SEC-01', start: '12:00', end: '13:00', priority: 'Express Passenger', timetableAvailable: true, maxSpeed: 110 },
  { trainId: 'T-310', trainNo: '12952', name: 'New Delhi - Mumbai Central Tejas Rajdhani', section: 'SEC-03', start: '11:30', end: '12:45', priority: 'Superfast Rajdhani', timetableAvailable: true, maxSpeed: 130 },
  { trainId: 'F-882', trainNo: 'BOXN-8821', name: 'Coal Rake Freight (Mundra Port to NTPC)', section: 'SEC-05', start: '11:00', end: '13:00', priority: 'Freight Rake', timetableAvailable: false, hasMissingOperationalData: true },
  { trainId: 'T-190', trainNo: '22955', name: 'Bandra Terminus - Bhuj Kutch Express', section: 'SEC-01', start: '16:00', end: '17:15', priority: 'Superfast Express', timetableAvailable: true, maxSpeed: 110 }
];

export const DEPARTMENT_RESOURCES = {
  Engineering: [
    { key: 'ENG_TRACK_TEAM_1', name: 'P-Way Track Maintenance Gang #1' },
    { key: 'ENG_BCM_RAKE_1', name: 'Ballast Cleaning Machine (BCM Rake #402)' },
    { key: 'ENG_BRIDGE_GANG_1', name: 'Bridge Heavy Repair Unit #04' },
    { key: 'ENG_TAMPING_UNIT_1', name: 'Track Tamping Machine (CSM #12)' }
  ],
  'S&T': [
    { key: 'ST_SIGNAL_TEAM_1', name: 'Signal & Point Interlocking Gang #1' },
    { key: 'ST_TELECOM_TEAM_1', name: 'OFC & Telecom Maintenance Crew' },
    { key: 'ST_AXLE_MAINT_1', name: 'Digital Axle Counter Testing Team' },
    { key: 'ST_INTERLOCK_CREW_1', name: 'Electronic Interlocking Specialist Crew' }
  ],
  'Traction Distribution': [
    { key: 'TRD_OHE_TEAM_1', name: '25kV OHE Maintenance Gang #1' },
    { key: 'TRD_TOWER_WAGON_1', name: 'Self-Propelled 4-Wheeler Tower Wagon #TW-88' },
    { key: 'TRD_SUBSTATION_CREW_1', name: 'Traction Sub-Station (TSS) High Voltage Team' },
    { key: 'TRD_CABLE_GANG_1', name: 'Feeder Cable & Earthing Mat Gang' }
  ]
};

export const INITIAL_REQUESTS = [
  {
    id: 'REQ-2026-0001',
    title: 'Ballast Screening & Track Renewal',
    department: 'Engineering',
    submittedBy: 'S. K. Sharma (Sr. DEN/Co-ADI)',
    location: 'Km 114/2 to 118/6 - Viramgam Outer',
    section: 'SEC-01',
    blockOrTrack: 'Up Line',
    resourceKey: 'ENG_BCM_RAKE_1',
    maintenanceType: 'Track Renewal',
    description: 'Deep ballast screening and sleeper replacement between KM 114/2 and KM 118/6. Pre-monsoon safety mandate.',
    priority: 'HIGH',
    requestedPriority: 'HIGH',
    systemAssessedPriority: 'HIGH',
    approvedPriority: 'HIGH',
    priorityEvidence: {
      assetCriticality: 'HIGH',
      overdueDays: 15,
      maintenanceUrgency: 'PRE_MONSOON_SAFETY',
      operationalImpact: 'HIGH_TRAFFIC_CORRIDOR',
      assetAvailability: 'PARTIAL_REDUNDANCY'
    },
    requestedDate: '2026-08-31',
    requestedStart: '12:00',
    requestedEnd: '14:00',
    estimatedDurationMinutes: 120,
    deadline: '2026-08-31 18:00',
    operationalNotes: 'Requires 30 km/h speed restriction after work completion.',
    status: 'Approved',
    safetyRequirements: ['Speed Restriction 30 km/h', 'Lookout Men Deployed'],
    conflicts: [
      {
        type: 'Train Movement Conflict',
        severity: 'High',
        description: 'Requested window (12:00-14:00) overlaps with Saurashtra Express #19015 (12:00-13:00) on SEC-01.'
      }
    ],
    recommendation: {
      recommendedSection: 'SEC-01',
      recommendedBlockId: 'MB-102',
      recommendedDate: '2026-08-31',
      recommendedStart: '13:00',
      recommendedEnd: '15:00',
      status: 'RESCHEDULED',
      factors: [
        { name: 'Train Conflict Avoidance', status: 'pass', detail: 'Avoided Saurashtra Express #19015 (12:00-13:00).' },
        { name: 'Block Fit', status: 'pass', detail: 'Fits maintenance block MB-102 (13:00-16:00).' },
        { name: 'Resource Availability', status: 'pass', detail: 'ENG_TRACK_TEAM_1 available in window.' },
        { name: 'Deadline Compliance', status: 'pass', detail: 'Completed well before deadline (18:00).' }
      ],
      explanation: 'Requested window 12:00–14:00 conflicted with train #19015 on SEC-01 (12:00–13:00). Next valid block MB-102 assigned from 13:00–15:00 before deadline 18:00.'
    },
    decision: {
      action: 'Approved',
      approvedBlockId: 'MB-102',
      approvedDate: '2026-08-31',
      approvedStart: '13:00',
      approvedEnd: '15:00',
      reason: 'Approved for shifted window 13:00-15:00 in Block MB-102 to avoid train conflict.',
      decidedBy: 'R. K. Verma (CTPM / Central Planning)',
      decidedAt: '2026-08-30T16:10:00Z'
    },
    activityLog: [
      { timestamp: '30 Aug 2026 • 02:15 PM', text: 'Request REQ-2026-0001 submitted by Engineering Dept.' },
      { timestamp: '30 Aug 2026 • 02:16 PM', text: 'Central Planning received request. Train conflict detected with #19015.' },
      { timestamp: '30 Aug 2026 • 02:18 PM', text: 'Planning Engine recommended Block MB-102 (13:00-15:00).' },
      { timestamp: '30 Aug 2026 • 04:10 PM', text: 'Central Control APPROVED block MB-102 (13:00-15:00). Decision returned to Engineering.' }
    ],
    createdAt: '2026-08-30T14:15:00Z'
  },
  {
    id: 'REQ-2026-0002',
    title: 'Electronic Interlocking Point Sensor Testing',
    department: 'S&T',
    submittedBy: 'V. P. Namboodiri (Sr. DSTE/ADI)',
    location: 'Sabarmati Yard Point #102B',
    section: 'SEC-02',
    blockOrTrack: 'Up Line',
    resourceKey: 'ST_SIGNAL_TEAM_1',
    maintenanceType: 'Signal Interlocking',
    description: 'Quarterly electronic interlocking calibration and dual point machine detection sensor testing.',
    priority: 'CRITICAL',
    requestedPriority: 'CRITICAL',
    systemAssessedPriority: 'MEDIUM',
    approvedPriority: 'MEDIUM',
    priorityEvidence: {
      assetCriticality: 'MEDIUM',
      overdueDays: 0,
      maintenanceUrgency: 'ROUTINE',
      operationalImpact: 'LOW_TRAFFIC_BRANCH',
      assetAvailability: 'FULL_REDUNDANCY'
    },
    requestedDate: '2026-08-31',
    requestedStart: '12:30',
    requestedEnd: '13:15',
    estimatedDurationMinutes: 45,
    deadline: '2026-08-31 17:00',
    operationalNotes: 'Platform 2 & 3 reception signals isolated during point testing.',
    status: 'Submitted',
    safetyRequirements: ['Signal Neutral Section Active', 'Station Master Point Lock'],
    conflicts: [],
    recommendation: null,
    decision: null,
    activityLog: [
      { timestamp: '30 Aug 2026 • 03:00 PM', text: 'Request REQ-2026-0002 submitted by S&T Dept.' }
    ],
    createdAt: '2026-08-30T15:00:00Z'
  },
  {
    id: 'REQ-2026-0003',
    title: '25kV OHE Cantilever Insulator Replacement',
    department: 'Traction Distribution',
    submittedBy: 'A. K. Mehta (Sr. DEE/TRD-BRC)',
    location: 'Bharuch Yard OHE Mast 312/4',
    section: 'SEC-03',
    blockOrTrack: 'Up Line',
    resourceKey: 'TRD_OHE_TEAM_1',
    maintenanceType: 'OHE Maintenance',
    description: 'Annual cantilever insulator replacement and 25kV traction overhead wire tension tuning.',
    priority: 'LOW',
    requestedPriority: 'LOW',
    systemAssessedPriority: 'HIGH',
    approvedPriority: 'HIGH',
    priorityEvidence: {
      assetCriticality: 'HIGH',
      overdueDays: 25,
      maintenanceUrgency: 'PREVENTIVE',
      operationalImpact: 'MAIN_LINE_SHUTDOWN',
      assetAvailability: 'NO_REDUNDANCY'
    },
    requestedDate: '2026-08-31',
    requestedStart: '14:00',
    requestedEnd: '16:00',
    estimatedDurationMinutes: 120,
    deadline: '2026-08-31 18:00',
    operationalNotes: 'Power block issued for 25kV traction line between KM 310 and 315.',
    status: 'Submitted',
    safetyRequirements: ['25kV Power Block Mandatory', 'Earthing Rods Installed'],
    conflicts: [],
    recommendation: null,
    decision: null,
    activityLog: [
      { timestamp: '30 Aug 2026 • 03:30 PM', text: 'Request REQ-2026-0003 submitted by Traction Distribution Dept.' }
    ],
    createdAt: '2026-08-30T15:30:00Z'
  },
  {
    id: 'REQ-2026-0004',
    title: 'Bridge Bearing Inspection & Epoxy Grouting',
    department: 'Engineering',
    submittedBy: 'M. R. Patel (DEN/Bridges-ADI)',
    location: 'Sabarmati River Bridge Pier #4',
    section: 'SEC-04',
    blockOrTrack: 'Both Lines',
    resourceKey: 'ENG_BRIDGE_GANG_1',
    maintenanceType: 'Bridge Repair',
    description: 'Elastomeric bridge bearing inspection and pier cap epoxy grouting over Sabarmati River.',
    priority: 'CRITICAL',
    requestedPriority: 'CRITICAL',
    systemAssessedPriority: 'CRITICAL',
    approvedPriority: 'CRITICAL',
    priorityEvidence: {
      assetCriticality: 'CRITICAL',
      overdueDays: 45,
      maintenanceUrgency: 'SAFETY_MANDATE',
      operationalImpact: 'MAIN_LINE_SHUTDOWN',
      assetAvailability: 'NO_REDUNDANCY'
    },
    requestedDate: '2026-08-31',
    requestedStart: '12:30',
    requestedEnd: '14:30',
    estimatedDurationMinutes: 120,
    deadline: '2026-08-31 18:00',
    operationalNotes: 'Speed restriction 20 km/h during bridge works.',
    status: 'Submitted',
    safetyRequirements: ['Speed Restriction 20 km/h', 'Safety Harness & Scaffolding'],
    conflicts: [],
    recommendation: null,
    decision: null,
    activityLog: [
      { timestamp: '30 Aug 2026 • 04:00 PM', text: 'Request REQ-2026-0004 submitted by Engineering Dept.' }
    ],
    createdAt: '2026-08-30T16:00:00Z'
  },
  {
    id: 'REQ-2026-0005',
    title: 'Track Circuit & Axle Counter Tuning',
    department: 'S&T',
    submittedBy: 'V. P. Namboodiri (Sr. DSTE/ADI)',
    location: 'Nadiad Yard South Cabin',
    section: 'SEC-02',
    blockOrTrack: 'Down Line',
    resourceKey: 'ST_AXLE_MAINT_1',
    maintenanceType: 'Signal Maintenance',
    description: 'High frequency track circuit tuning and reset unit maintenance at south cabin crossover.',
    priority: 'HIGH',
    requestedPriority: 'HIGH',
    systemAssessedPriority: 'HIGH',
    approvedPriority: 'HIGH',
    priorityEvidence: {
      assetCriticality: 'HIGH',
      overdueDays: 12,
      maintenanceUrgency: 'PREVENTIVE',
      operationalImpact: 'HIGH_TRAFFIC_CORRIDOR',
      assetAvailability: 'PARTIAL_REDUNDANCY'
    },
    requestedDate: '2026-08-31',
    requestedStart: '16:00',
    requestedEnd: '18:00',
    estimatedDurationMinutes: 120,
    deadline: '2026-08-31 20:00',
    operationalNotes: 'Manual pilot train operation during axle counter loop adjustment.',
    status: 'Submitted',
    safetyRequirements: ['Signal Neutral Section Active'],
    conflicts: [],
    recommendation: null,
    decision: null,
    activityLog: [
      { timestamp: '30 Aug 2026 • 04:30 PM', text: 'Request REQ-2026-0005 submitted by S&T Dept.' }
    ],
    createdAt: '2026-08-30T16:30:00Z'
  },
  {
    id: 'REQ-2026-0006',
    title: 'Traction Sub-Station Transformer Maintenance',
    department: 'Traction Distribution',
    submittedBy: 'A. K. Mehta (Sr. DEE/TRD-BRC)',
    location: 'Nadiad Traction Substation',
    section: 'SEC-02',
    blockOrTrack: 'Both Lines',
    resourceKey: 'TRD_SUBSTATION_CREW_1',
    maintenanceType: 'Power-related Maintenance',
    description: '132kV/25kV Traction transformer oil filtration and Buchholz protective relay testing.',
    priority: 'LOW',
    requestedPriority: 'LOW',
    systemAssessedPriority: 'LOW',
    approvedPriority: 'LOW',
    priorityEvidence: {
      assetCriticality: 'LOW',
      overdueDays: 0,
      maintenanceUrgency: 'ROUTINE',
      operationalImpact: 'LOW_TRAFFIC_BRANCH',
      assetAvailability: 'FULL_REDUNDANCY'
    },
    requestedDate: '2026-08-31',
    requestedStart: '08:30',
    requestedEnd: '11:00',
    estimatedDurationMinutes: 150,
    deadline: '2026-08-31 16:00',
    operationalNotes: 'Feeder switching from Vadodara TSS required.',
    status: 'Submitted',
    safetyRequirements: ['Substation Dead-Section Isolation', 'Fire System Audit'],
    conflicts: [],
    recommendation: null,
    decision: null,
    activityLog: [
      { timestamp: '30 Aug 2026 • 05:00 PM', text: 'Request REQ-2026-0006 submitted by Traction Distribution Dept.' }
    ],
    createdAt: '2026-08-30T17:00:00Z'
  },
  {
    id: 'REQ-2026-0007',
    title: 'Track Gauge Alignment & Fastener Packing',
    department: 'Engineering',
    submittedBy: 'S. K. Sharma (Sr. DEN/Co-ADI)',
    location: 'Km 62/4 - Nadiad Up Line Corridor',
    section: 'SEC-02',
    blockOrTrack: 'Up Line',
    resourceKey: 'ENG_TRACK_TEAM_1',
    maintenanceType: 'Track Maintenance',
    description: 'Precision gauge realignment, sleeper fastener tightening, and joint inspection on main high-speed track.',
    priority: 'HIGH',
    requestedPriority: 'HIGH',
    systemAssessedPriority: 'HIGH',
    approvedPriority: 'HIGH',
    priorityEvidence: {
      assetCriticality: 'HIGH',
      overdueDays: 10,
      maintenanceUrgency: 'PRE_MONSOON_SAFETY',
      operationalImpact: 'HIGH_TRAFFIC_CORRIDOR',
      assetAvailability: 'PARTIAL_REDUNDANCY'
    },
    requestedDate: '2026-08-31',
    requestedStart: '12:30',
    requestedEnd: '13:30',
    estimatedDurationMinutes: 60,
    deadline: '2026-08-31 17:00',
    operationalNotes: 'Lookout protection required on adjacent Down Line.',
    status: 'Submitted',
    safetyRequirements: ['Speed Restriction 30 km/h', 'Lookout Men Deployed'],
    conflicts: [],
    recommendation: null,
    decision: null,
    activityLog: [
      { timestamp: '30 Aug 2026 • 05:15 PM', text: 'Request REQ-2026-0007 submitted by Engineering Dept.' }
    ],
    createdAt: '2026-08-30T17:15:00Z'
  },
  {
    id: 'REQ-2026-0008',
    title: '25kV OHE Dropper & Contact Wire Tuning',
    department: 'Traction Distribution',
    submittedBy: 'A. K. Mehta (Sr. DEE/TRD-BRC)',
    location: 'Nadiad Section OHE Mast 62/12 to 64/0',
    section: 'SEC-02',
    blockOrTrack: 'Up Line',
    resourceKey: 'TRD_OHE_TEAM_1',
    maintenanceType: 'OHE Maintenance',
    description: 'Current collection dropper alignment, contact wire height measurement, and feeder jumper inspection.',
    priority: 'MEDIUM',
    requestedPriority: 'MEDIUM',
    systemAssessedPriority: 'MEDIUM',
    approvedPriority: 'MEDIUM',
    priorityEvidence: {
      assetCriticality: 'MEDIUM',
      overdueDays: 5,
      maintenanceUrgency: 'PREVENTIVE',
      operationalImpact: 'HIGH_TRAFFIC_CORRIDOR',
      assetAvailability: 'FULL_REDUNDANCY'
    },
    requestedDate: '2026-08-31',
    requestedStart: '13:00',
    requestedEnd: '14:00',
    estimatedDurationMinutes: 60,
    deadline: '2026-08-31 17:00',
    operationalNotes: '25kV power block coordinated with section track window.',
    status: 'Submitted',
    safetyRequirements: ['25kV Power Block Mandatory', 'Earthing Rods Installed'],
    conflicts: [],
    recommendation: null,
    decision: null,
    activityLog: [
      { timestamp: '30 Aug 2026 • 05:20 PM', text: 'Request REQ-2026-0008 submitted by Traction Distribution Dept.' }
    ],
    createdAt: '2026-08-30T17:20:00Z'
  },
  {
    id: 'REQ-2026-0009',
    title: 'OFC Telecommunication Cable Joint Testing',
    department: 'S&T',
    submittedBy: 'V. P. Namboodiri (Sr. DSTE/ADI)',
    location: 'Surendranagar Track Km 88/2',
    section: 'SEC-04',
    blockOrTrack: 'Both Lines',
    resourceKey: 'ST_TELECOM_TEAM_1',
    maintenanceType: 'OFC & Telecom Work',
    description: 'Optical Fiber Cable (OFC) optical loss testing and digital signal regenerator unit inspection.',
    priority: 'HIGH',
    requestedPriority: 'HIGH',
    systemAssessedPriority: 'HIGH',
    approvedPriority: 'HIGH',
    priorityEvidence: {
      assetCriticality: 'HIGH',
      overdueDays: 14,
      maintenanceUrgency: 'PREVENTIVE',
      operationalImpact: 'HIGH_TRAFFIC_CORRIDOR',
      assetAvailability: 'PARTIAL_REDUNDANCY'
    },
    requestedDate: '2026-08-31',
    requestedStart: '12:30',
    requestedEnd: '14:00',
    estimatedDurationMinutes: 90,
    deadline: '2026-08-31 18:00',
    operationalNotes: 'Backup wireless VHF communication active during cable testing.',
    status: 'Submitted',
    safetyRequirements: ['Signal Neutral Section Active'],
    conflicts: [],
    recommendation: null,
    decision: null,
    activityLog: [
      { timestamp: '30 Aug 2026 • 05:30 PM', text: 'Request REQ-2026-0009 submitted by S&T Dept.' }
    ],
    createdAt: '2026-08-30T17:30:00Z'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-101',
    targetDept: 'Engineering',
    requestId: 'REQ-2026-0001',
    type: 'approval',
    title: 'Maintenance Block Approved',
    message: 'Central Planning approved REQ-2026-0001 for SEC-01 in Block MB-102 (13:00-15:00).',
    timestamp: '30 Aug 2026 • 04:10 PM',
    read: false
  },
  {
    id: 'NOTIF-102',
    targetDept: 'Central Control',
    requestId: 'REQ-2026-0002',
    type: 'conflict',
    title: 'Corridor Conflict Detected',
    message: 'S&T Request REQ-2026-0002 conflicts with Vande Bharat Exp #20901 on SEC-02.',
    timestamp: '30 Aug 2026 • 03:01 PM',
    read: false
  },
  {
    id: 'NOTIF-103',
    targetDept: 'Traction Distribution',
    requestId: 'REQ-2026-0003',
    type: 'recommendation',
    title: 'Planning Recommendation Ready',
    message: 'RailPlan generated optimal block recommendation (MB-302) for Bharuch OHE work.',
    timestamp: '30 Aug 2026 • 03:31 PM',
    read: true
  }
];
