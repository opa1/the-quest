export const QUEST_CONFIG = {
  stats: {
    activeOperatives: '10K+',
    openMissions: '247',
    xpAwarded: '12,390',
    questers: '1,840',
  },
  nav: {
    links: [
      { label: 'War Room', href: '#war-room' },
      { label: 'Bounty Board', href: '#bounty-board' },
      { label: 'Arsenal', href: '#arsenal' },
      { label: 'Guild', href: '#guild' },
      { label: 'Order', href: '#order' },
      { label: 'Hall of Fame', href: '#hall-of-fame' },
    ],
  },
  hero: {
    chapterLabel: 'CHAPTER 01',
    headlineTop: 'CREATE YOUR',
    headlineBottom: 'LEGACY',
    subtext:
      'Enter the crucible of The Quest. Forge your path, conquer impossible bounties, and carve your name into the annals of the Order. The shadows await your command.',
    primaryCta: 'START QUEST',
    inputPlaceholder: 'ENTER COMM-LINK',
    inputCta: 'JOIN',
    statLabel: 'ACTIVE OPERATIVES',
  },
  operatives: [
    {
      id: 'patricia',
      name: 'PATRICIA',
      rank: 'Level 42 Vanguard Commander',
      tags: ['ELITE', 'TACTICAL'],
      image: '/images/operatives/patricia.jpg',
      featured: true,
    },
    {
      id: 'amanda',
      name: 'AMANDA',
      image: '/images/operatives/amanda.jpg',
      featured: false,
    },
    {
      id: 'murphy',
      name: 'MURPHY',
      image: '/images/operatives/murphy.jpg',
      featured: false,
    },
  ],

  bountyBoard: {
    chapterLabel: 'CHAPTER 02',
    title: 'THE BOUNTY BOARD',
    subtext:
      'High-priority tasks await execution. Select your target, complete the objective, and claim the XP. Only the skilled survive.',
    ctaLabel: 'VIEW ALL BOUNTIES',
  },

  bounties: [
    {
      id: 'infiltrate-data-vault',
      category: 'RESEARCH',
      difficulty: 'EASY',
      title: 'Infiltrate the Data Vault',
      description:
        'Access the primary archives and extract the missing historical logs regarding the fall of the first guild. Stealth is required; alerting...',
      xp: 500,
      featured: false,
    },
    {
      id: 'decrypt-core-protocol',
      category: 'CODE',
      difficulty: 'MEDIUM',
      title: 'Decrypt the Core Protocol',
      description:
        "A rogue AI has locked down the sector's main trading hub. Write a bypass script to override the security protocols and restore...",
      xp: 1200,
      featured: false,
    },
    {
      id: 'slay-synth-beast',
      category: 'COMBAT',
      difficulty: 'HARD',
      title: 'Slay the Synth-Beast',
      description:
        'A corrupted cybernetic abomination is terrorizing the lower levels. It is heavily armored and armed with plasma weaponry.',
      xp: 3000,
      featured: false,
    },
    {
      id: 'draft-resistance-banner',
      category: 'DESIGN',
      difficulty: 'EASY',
      title: 'Draft the Resistance Banner',
      description:
        'The newly formed alliance needs a symbol to rally behind. Create a striking emblem that incorporates elements of both the old...',
      xp: 400,
      featured: false,
    },
    {
      id: 'secure-supply-line',
      category: 'LOGISTICS',
      difficulty: 'MEDIUM',
      title: 'Secure the Supply Line',
      description:
        'Raiders have been intercepting energy cell shipments bound for Sector 7. Map a new, secure route through the hazardous...',
      xp: 1500,
      featured: false,
    },
    {
      id: 'assassinate-overlord',
      category: 'LEGENDARY',
      difficulty: 'HARD',
      title: 'Assassinate the Overlord',
      description:
        'The tyrannical ruler of the sky-city has oppressed the ground-dwellers for too long. Infiltrate the floating fortress, bypass...',
      xp: 10000,
      featured: true,
    },
  ],

  difficultyConfig: {
    EASY: {
      label: 'EASY',
      icon: '⚡',
      className: 'bg-green-950 text-green-400 border-green-800',
    },
    MEDIUM: {
      label: 'MEDIUM',
      icon: '△',
      className: 'bg-amber-950 text-amber-400 border-amber-800',
    },
    HARD: {
      label: 'HARD',
      icon: '◎',
      className: 'bg-red-950 text-red-400 border-red-800',
    },
  },

  arsenal: {
    chapterLabel: 'CHAPTER 03',
    title: 'THE ARSENAL',
    subtext:
      'Equip yourself with next-generation tools forged in the digital fires. Every weapon in your arsenal is designed to give you the edge in the high-stakes campaigns ahead.',
    ctaLabel: 'DEPLOY PROTOCOL',
    features: [
      {
        id: 'evolutionary-3d-engine',
        icon: 'Orbit',
        title: 'Evolutionary 3D Engine',
        description:
          'Harness the power of our proprietary voxel-rendering core. Build complex geometric structures in real-time with zero latency and absolute precision.',
      },
      {
        id: 'neural-integration',
        icon: 'Cpu',
        title: 'Neural Integration',
        description:
          'Direct sync with cybernetic implants allows for thought-to-design workflows. Bypass traditional peripherals and sculpt directly with your mind.',
      },
      {
        id: 'quantum-encryption',
        icon: 'ShieldCheck',
        title: 'Quantum Encryption',
        description:
          'Assets are shielded by state-of-the-art quantum lattices. Ensure your intellectual property remains impenetrable to corporate espionage.',
      },
    ],
  },

  guild: {
    chapterLabel: 'CHAPTER 04',
    title: 'THE GUILD',
    subtext: 'Your journey from initiate to legend follows a path forged in fire and digital ink.',
    ctaLabel: 'ENTER THE GUILD',
    ctaHref: '/signup',
    steps: [
      {
        id: 'claim-bounty',
        number: '01',
        icon: 'ClipboardList',
        title: 'Claim a Bounty',
        description:
          'Browse the board and select your challenge. High risks yield high rewards.',
      },
      {
        id: 'execute-mission',
        number: '02',
        icon: 'Swords',
        title: 'Execute Mission',
        description:
          'Complete the task and submit undeniable proof. Failure is not an option.',
      },
      {
        id: 'ascend-ranks',
        number: '03',
        icon: 'Gem',
        title: 'Ascend Ranks',
        description:
          'Earn XP and build your on-chain reputation. Become a legend.',
      },
    ],
  },

  order: {
    title: 'THE ORDER',
    subtext:
      'Choose your path. Each discipline commands distinct mastery over the digital battlefield. Your class dictates your destiny within the protocol.',
    classes: [
      {
        id: 'vanguard',
        roleLabel: 'FRONTLINE BRUISER',
        className: 'VANGUARD',
        description:
          'Masters of kinetic force and crowd control. Vanguards break enemy lines with heavy armor and overwhelming firepower.',
        accentColor: '#ef4444',
        accentColorClass: 'bg-red-500',
        image: '/images/classes/vanguard.jpg',
      },
      {
        id: 'shadow',
        roleLabel: 'COVERT OPERATIVE',
        className: 'SHADOW',
        description:
          'Operating in the margins. Shadows specialize in stealth, precision strikes, and intelligence gathering.',
        accentColor: '#D4A017',
        accentColorClass: 'bg-primary',
        image: '/images/classes/shadow.jpg',
      },
      {
        id: 'scholar',
        roleLabel: 'TACTICAL SUPPORT',
        className: 'SCHOLAR',
        description:
          'Manipulators of the digital weave. Scholars provide essential battlefield intelligence and systems mastery.',
        accentColor: '#38bdf8',
        accentColorClass: 'bg-sky-400',
        image: '/images/classes/scholar.jpg',
      },
    ],
  },

  ledger: {
    chapterLabel: 'CHAPTER 06',
    title: 'THE LEDGER',
    subtext:
      'Your deeds are eternal. Every bounty claimed and mission completed is etched into the Cardano blockchain.',
    chainStatus: {
      network: 'Cardano Mainnet',
      totalRepMinted: '12,450',
      activeContracts: 3,
      ctaLabel: 'VIEW FULL LEDGER',
      ctaHref: '#',
    },
    transactions: [
      {
        id: 'tx-dragons-hoard',
        icon: 'CheckSquare',
        title: "Bounty: Dragon's Hoard",
        timestamp: '2024-10-24 14:32:01 UTC',
        status: 'CONFIRMED',
        blockHash: '0x8fB32C1...9a4b21D4',
        txId: 'd74a9c1b...8e3f2a1c',
        repMinted: 500,
      },
      {
        id: 'tx-mapping-abyss',
        icon: 'Compass',
        title: 'Mission: Mapping the Abyss',
        timestamp: '2024-10-22 09:15:44 UTC',
        status: 'ARCHIVED',
        blockHash: '0x2a1C...4b9d',
        txId: 'e82c...1a9f',
        repMinted: null,
      },
    ],
    txStatusConfig: {
      CONFIRMED: {
        label: 'CONFIRMED',
        dotClass: 'bg-green-500',
        textClass: 'text-green-400',
      },
      ARCHIVED: {
        label: 'ARCHIVED',
        dotClass: 'bg-muted-foreground',
        textClass: 'text-muted-foreground',
      },
    },
  },

  hallOfFame: {
    chapterLabel: 'CHAPTER 07',
    title: 'THE HALL OF FAME',
    subtext:
      'The names that echo through the halls of history. Only the most dedicated operatives reach these heights.',
    rankBadgeConfig: {
      LEGEND: {
        label: 'LEGEND',
        className: 'bg-primary text-primary-foreground border-primary',
      },
      ELITE: {
        label: 'ELITE',
        className: 'bg-muted text-muted-foreground border-border',
      },
      VETERAN: {
        label: 'VETERAN',
        className: 'bg-orange-950 text-orange-400 border-orange-800',
      },
    },
    podiumBorderConfig: {
      1: 'border-primary shadow-[0_0_24px_oklch(0.795_0.184_86.047/0.3)]',
      2: 'border-border/60',
      3: 'border-orange-700/60',
    },
    topThree: [
      {
        rank: 1,
        username: 'Xero_Cool',
        badge: 'LEGEND',
        xp: 1500000,
        bounties: 521,
        avatar: '/images/operatives/xero-cool.jpg',
      },
      {
        rank: 2,
        username: 'Viper_99',
        badge: 'ELITE',
        xp: 1245000,
        bounties: 412,
        avatar: '/images/operatives/viper-99.jpg',
      },
      {
        rank: 3,
        username: 'Ghost_Protocol',
        badge: 'VETERAN',
        xp: 1198500,
        bounties: 398,
        avatar: '/images/operatives/ghost-protocol.jpg',
      },
    ],
    leaderboard: [
      { rank: 4,  username: 'Neon_Ninja',       xp: 1245000, bounties: 412, avatar: null },
      { rank: 5,  username: 'Shadow_Broker',    xp: 1198500, bounties: 398, avatar: null },
      { rank: 6,  username: 'Cyber_Punk_01',    xp: 1150200, bounties: 375, avatar: null },
      { rank: 7,  username: 'Rogue_AI',         xp: 1080000, bounties: 350, avatar: null },
      { rank: 8,  username: 'Net_Runner',       xp: 995400,  bounties: 321, avatar: null },
      { rank: 9,  username: 'Glitch_in_Matrix', xp: 950100,  bounties: 305, avatar: null },
      { rank: 10, username: 'Data_Phantom',     xp: 912800,  bounties: 290, avatar: null },
    ],
  },

  chronicle: {
    chapterLabel: 'CHAPTER 08',
    title: 'THE CHRONICLE',
    subtext:
      'Witness the evolution of the protocol in real-time. Transparent, decentralized, and community-driven. Every milestone forged in the fires of collaboration.',
    ctaLabel: 'LOAD ARCHIVES',
    ctaHref: '#',
    entries: [
      {
        id: 'new-class-unlocked',
        icon: 'Star',
        category: 'PROTOCOL UPDATE',
        title: 'New Class Unlocked',
        description:
          "The 'Shadowrunner' class is now available for minting. Equip specialized stealth gear and accept covert bounties in the Outer Rim sectors.",
        timelineLabel: 'T-MINUS 02:45:00',
        side: 'right',
      },
      {
        id: 'cardano-node-sync',
        icon: 'Zap',
        category: 'SYSTEM CORE',
        title: 'Cardano Node Sync Complete',
        description:
          'Cross-chain bridges initialized. The primary ledger is fully synchronized with the Cardano network, ensuring immutable quest verification.',
        timelineLabel: 'CYCLE 42.9',
        side: 'left',
      },
      {
        id: 'guild-alliance-formed',
        icon: 'Handshake',
        category: 'COMMUNITY',
        title: 'Guild Alliance Formed',
        description:
          "The 'Iron Vanguard' and 'Neon Syndicate' have formalized a pact. Shared resource pools and cooperative raid instancing are now active for these factions.",
        timelineLabel: 'EPOCH 128',
        side: 'right',
      },
    ],
  },
  oath: {
    chapterLabel: 'CHAPTER 09',
    title: 'THE OATH',
    subtext:
      'A pact between the protocol and the pioneer. We build for the long-term, powered by proof.',
    manifesto: [
      { id: 'line-1', text: 'WE REJECT THE EPHEMERAL GRIND.', size: 'md' },
      {
        id: 'line-2',
        text: 'EVERY ACTION ETCHED IN CODE IS A TESTAMENT TO EFFORT, SEALED BY CRYPTOGRAPHIC PROOF.',
        size: 'xl',
      },
      {
        id: 'line-3',
        text: 'THE ARCHIVES NEVER FORGET THE BRAVE. THE LEDGER ONLY REWARDS THE STEADFAST.',
        size: 'lg',
      },
      { id: 'line-4', text: 'THIS IS OUR DOMAIN. THIS IS THE QUEST.', size: 'lg' },
    ],
    ctaLabel: 'ACCEPT THE COVENANT',
    ctaHref: '/signup',
    topDividerIcon: 'Flame',
    bottomDividerIcon: 'Shield',
  },
  council: {
    chapterLabel: 'CHAPTER 10',
    title: 'THE COUNCIL',
    subtext: 'Seek wisdom. The elders have prepared the answers you require before you embark.',
    ctaSubtext: 'Still seeking answers?',
    ctaLabel: 'CONSULT THE ARCHIVES',
    ctaHref: '#',
    faqs: [
      {
        id: 'cardano-link',
        icon: 'HelpCircle',
        question: 'WHAT IS THE CARDANO LINK?',
        answer:
          'The Cardano link provides the immutable backbone for our campaign records. Every quest completed, every bounty claimed, and every level gained is securely etched onto the ledger, ensuring your achievements are permanent and verifiable across the entire network.',
        defaultOpen: true,
      },
      {
        id: 'earn-xp',
        icon: 'CircleDollarSign',
        question: 'HOW DO I EARN XP?',
        answer:
          'XP is earned by completing bounties and missions. Each task has a difficulty rating — Easy, Medium, or Hard — with corresponding XP rewards. Bonus XP is awarded for speed, quality of submission, and community votes.',
        defaultOpen: false,
      },
      {
        id: 'order-tiers',
        icon: 'Trophy',
        question: 'WHAT ARE THE ORDER TIERS?',
        answer:
          'The Order has four tiers: Initiate, Elite, Veteran, and Legend. Each tier unlocks new bounty categories, exclusive missions, and higher XP multipliers. Tier advancement is based on total XP and on-chain contribution history.',
        defaultOpen: false,
      },
      {
        id: 'disputes',
        icon: 'Scale',
        question: 'HOW ARE DISPUTES RESOLVED?',
        answer:
          'Disputes are handled by the Council — a rotating panel of Legend-tier operatives. Evidence is submitted on-chain and reviewed within 48 hours. Outcomes are recorded permanently on the ledger.',
        defaultOpen: false,
      },
    ],
  },
  gates: {
    chapterLabel: 'CHAPTER 11',
    title: 'THE GATES',
    subtext:
      'The shadows await your command. Will you forge your legacy or fade into obscurity?',
    primaryCta: {
      label: 'START YOUR QUEST',
      href: '/signup',
    },
    secondaryCta: {
      label: 'JOIN THE COMMUNITY',
      href: '#',
    },
    backgroundImage: '/images/gates-bg.jpg',
  },

  footer: {
    logo: 'THE QUEST',
    links: [
      { label: 'PRIVACY POLICY', href: '/privacy' },
      { label: 'TERMS OF ENGAGEMENT', href: '/terms' },
      { label: 'SUPPORT', href: '/support' },
    ],
    copyright: '© 2024 THE QUEST PROTOCOL. ALL RIGHTS RESERVED.',
  },
} as const
