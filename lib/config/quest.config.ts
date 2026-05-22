import { BicepsFlexed, Flame, Zap } from "lucide-react"

export const QUEST_CONFIG = {
  stats: {
    activeOperatives: "10K+",
  },
  nav: {
    links: [
      { label: "Bounty Board", href: "#bounty-board" },
      { label: "Arsenal", href: "#arsenal" },
      { label: "Guild", href: "#guild" },
      { label: "The Ledger", href: "#the-ledger" },
    ],
  },
  hero: {
    chapterLabel: "CHAPTER 01",
    headlineTop: "LEGENDS ARE NOT BORN",
    headlineBottom: "THEY ARE EARNED",
    subtext:
      "Pick a task. Do the work. Stack your credits. Every mission you complete writes your name permanently into the Cardano ledger.",
    primaryCta: "START QUEST",
    secondaryCta: "BROWSE THE BOARD",
    avatarStack: [
      "/images/avatars/avatar-1.webp",
      "/images/avatars/avatar-2.webp",
      "/images/avatars/avatar-3.webp",
    ],
    statLabel: "ACTIVE OPERATIVES",
  },
  operatives: [
    {
      id: "patricia",
      name: "PATRICIA",
      // rank: "Level 42 Vanguard Commander",
      // tags: ["ELITE", "TACTICAL"],
      image: "/images/operatives/patricia.webp",
      featured: true,
    },
    {
      id: "amanda",
      name: "AMANDA",
      image: "/images/operatives/amanda.webp",
      featured: false,
    },
    {
      id: "murphy",
      name: "MURPHY",
      image: "/images/operatives/murphy.webp",
      featured: false,
    },
  ],

  bountyBoard: {
    chapterLabel: "CHAPTER 02",
    title: "THE BOUNTY BOARD",
    subtext:
      "Every mission posted here is a chance to prove your worth. Pick your target. Deliver. Get paid.",
    ctaLabel: "VIEW ALL BOUNTIES",
  },

  bounties: [
    {
      id: "infiltrate-data-vault",
      category: "RESEARCH",
      difficulty: "EASY",
      title: "Infiltrate the Data Vault",
      description:
        "Access the primary archives and extract the missing historical logs regarding the fall of the first guild. Stealth is required; alerting...",
      xp: 500,
      featured: false,
    },
    {
      id: "decrypt-core-protocol",
      category: "CODE",
      difficulty: "MEDIUM",
      title: "Decrypt the Core Protocol",
      description:
        "A rogue AI has locked down the sector's main trading hub. Write a bypass script to override the security protocols and restore...",
      xp: 1200,
      featured: false,
    },
    {
      id: "slay-synth-beast",
      category: "COMBAT",
      difficulty: "HARD",
      title: "Slay the Synth-Beast",
      description:
        "A corrupted cybernetic abomination is terrorizing the lower levels. It is heavily armored and armed with plasma weaponry.",
      xp: 3000,
      featured: false,
    },
    {
      id: "draft-resistance-banner",
      category: "DESIGN",
      difficulty: "EASY",
      title: "Draft the Resistance Banner",
      description:
        "The newly formed alliance needs a symbol to rally behind. Create a striking emblem that incorporates elements of both the old...",
      xp: 400,
      featured: false,
    },
    {
      id: "secure-supply-line",
      category: "LOGISTICS",
      difficulty: "MEDIUM",
      title: "Secure the Supply Line",
      description:
        "Raiders have been intercepting energy cell shipments bound for Sector 7. Map a new, secure route through the hazardous...",
      xp: 1500,
      featured: false,
    },
    {
      id: "assassinate-overlord",
      category: "LEGENDARY",
      difficulty: "HARD",
      title: "Assassinate the Overlord",
      description:
        "The tyrannical ruler of the sky-city has oppressed the ground-dwellers for too long. Infiltrate the floating fortress, bypass...",
      xp: 10000,
      featured: true,
    },
  ],

  difficultyConfig: {
    EASY: {
      label: "EASY",
      icon: Zap,
      className: "bg-green-950 text-green-400 border-green-800",
    },
    MEDIUM: {
      label: "MEDIUM",
      icon: BicepsFlexed,
      className: "bg-amber-950 text-amber-400 border-amber-800",
    },
    HARD: {
      label: "HARD",
      icon: Flame,
      className: "bg-red-950 text-red-400 border-red-800",
    },
  },

  arsenal: {
    chapterLabel: "CHAPTER 03",
    title: "THE ARSENAL",
    subtext:
      "Everything you need to earn, grow, and leave your mark on the realm. The tools are simple. What you build with them is up to you.",
    ctaLabel: "DEPLOY PROTOCOL",
    features: [
      {
        id: "post-a-mission",
        icon: "Megaphone",
        title: "Post a Mission",
        description:
          "Have work that needs doing? Post it. Set the reward. Let the realm handle the rest.",
      },
      {
        id: "claim-a-bounty",
        icon: "Sword",
        title: "Claim a Bounty",
        description:
          "Browse open tasks and lock one in. No bidding wars. First to claim, first to earn.",
      },
      {
        id: "earn-credits",
        icon: "Coins",
        title: "Earn Credits",
        description:
          "Every completed mission pays out. Credits stack. Reputation grows.",
      },
      {
        id: "build-your-record",
        icon: "ScrollText",
        title: "Build Your Record",
        description:
          "Every task you complete adds to your public contribution history. Visible to all.",
      },
      {
        id: "on-chain-proof",
        icon: "ShieldCheck",
        title: "On-Chain Proof",
        description:
          "Completed missions are recorded on Cardano. Permanent. Verifiable. Yours forever.",
      },
      {
        id: "climb-the-ranks",
        icon: "Trophy",
        title: "Climb the Ranks",
        description:
          "The more you deliver, the higher you rise. Legend status is earned, not given.",
      },
    ],
  },

  guild: {
    chapterLabel: "CHAPTER 04",
    title: "THE GUILD",
    subtext:
      "Every operative starts at zero. The path from here is yours to walk.",
    ctaLabel: "ENTER THE GUILD",
    ctaHref: "/signup",
    steps: [
      {
        id: "pick-your-mission",
        number: "01",
        icon: "ClipboardList",
        title: "PICK YOUR MISSION",
        description:
          "The board has tasks across design, writing, code, research and more. Claim one. Own it.",
      },
      {
        id: "do-the-work",
        number: "02",
        icon: "Swords",
        title: "DO THE WORK",
        description:
          "Complete the task. Submit your proof. Quality gets confirmed. Excuses don't.",
      },
      {
        id: "collect-your-legacy",
        number: "03",
        icon: "Gem",
        title: "COLLECT YOUR LEGACY",
        description:
          "Get paid in credits. Get recorded on-chain. Your reputation grows with every delivery.",
      },
    ],
  },

  ledger: {
    chapterLabel: "CHAPTER 05",
    title: "THE LEDGER",
    subtext:
      "When you complete a task on The Quest, we don't just update a database. We submit a transaction to the Cardano blockchain. That record cannot be altered, deleted, or taken from you. Ever.",
    chainStatus: {
      network: "Cardano Mainnet",
      totalRepMinted: "12,450",
      activeContracts: 3,
      ctaLabel: "VIEW FULL LEDGER",
      ctaHref: "#",
    },
    transactions: [
      {
        id: "tx-dragons-hoard",
        icon: "CheckSquare",
        title: "Bounty: Dragon's Hoard",
        timestamp: "2024-10-24 14:32:01 UTC",
        status: "CONFIRMED",
        blockHash: "0x8fB32C1...9a4b21D4",
        txId: "d74a9c1b...8e3f2a1c",
        repMinted: 500,
      },
      {
        id: "tx-mapping-abyss",
        icon: "Compass",
        title: "Mission: Mapping the Abyss",
        timestamp: "2024-10-22 09:15:44 UTC",
        status: "ARCHIVED",
        blockHash: "0x2a1C...4b9d",
        txId: "e82c...1a9f",
        repMinted: null,
      },
    ],
    txStatusConfig: {
      CONFIRMED: {
        label: "CONFIRMED",
        dotClass: "bg-green-500",
        textClass: "text-green-400",
      },
      ARCHIVED: {
        label: "ARCHIVED",
        dotClass: "bg-muted-foreground",
        textClass: "text-muted-foreground",
      },
    },
  },

  gates: {
    chapterLabel: "CHAPTER 06",
    title: "THE GATES",
    subtext:
      "The shadows await your command. Will you forge your legacy or fade into obscurity?",
    primaryCta: {
      label: "START YOUR QUEST",
      href: "/signup",
    },
    secondaryCta: {
      label: "JOIN THE COMMUNITY",
      href: "#",
    },
    backgroundImage: "/images/gates-bg.webp",
  },

  footer: {
    logo: "THE QUEST",
    links: [
      { label: "PRIVACY POLICY", href: "/privacy" },
      { label: "TERMS OF ENGAGEMENT", href: "/terms" },
      { label: "SUPPORT", href: "/support" },
    ],
    copyright: "© 2024 THE QUEST PROTOCOL. ALL RIGHTS RESERVED.",
  },
  realmNav: [
    { label: 'Realm',       href: '/realm',       icon: 'Home' },
    { label: 'Missions',    href: '/missions',     icon: 'Sword' },
    { label: 'Post',        href: '/post',         icon: 'Plus' },
    { label: 'Record',      href: '/record',       icon: 'ScrollText' },
    { label: 'Leaderboard', href: '/leaderboard',  icon: 'Trophy' },
  ] as const,

  realmDropdown: [
    { label: 'Profile',  href: '/profile',  icon: 'User' },
    { label: 'Settings', href: '/settings', icon: 'Settings' },
    { label: 'Sign Out', href: null,        icon: 'LogOut' },
  ] as const,

  onboarding: {
    title: 'FORGE YOUR IDENTITY',
    subtext: 'One name. One record. Everything you earn ties back to it.',
    usernamePlaceholder: 'Choose your username',
    usernameLabel: 'USERNAME',
    usernameTaken: 'This username is already claimed. Choose another.',
    usernameRequired: 'Username is required.',
    usernameMinLength: 3,
    usernameMaxLength: 20,
    walletTitle: 'LINK YOUR WALLET',
    walletSubtext: 'Connect your Cardano wallet to unlock on-chain proof of your work.',
    walletNoneDetected: 'No Cardano wallet detected.',
    walletNoneSubtext: 'Install Nami, Eternl or Lace to get started.',
    walletGetLink: 'https://namiwallet.io',
    walletGetLabel: 'GET A WALLET',
    walletSkip: 'SKIP FOR NOW',
    walletConnect: 'CONNECT',
    cta: 'ENTER THE REALM',
  } as const,
  auth: {
    dialog: {
      title: 'IDENTIFY YOURSELF',
      subtext: 'Sign in to claim missions, earn credits, and build your on-chain legacy.',
      xButton: 'CONTINUE WITH X',
      xSubtext: 'Sign in with your X account',
      terms: 'By continuing you agree to our Terms of Engagement and Privacy Policy.',
    },
    redirects: {
      onboarding: '/onboarding',
      home: '/realm',
    },
    triggerRoutes: ['/realm', '/tasks/create', '/tasks/claim'],
  },
  realm: {
    feedFilters: [
      { label: 'ALL',       value: 'ALL' },
      { label: 'BOUNTIES',  value: 'BOUNTIES' },
      { label: 'CLAIMED',   value: 'CLAIMED' },
      { label: 'COMPLETED', value: 'COMPLETED' },
    ],
    feedEmptyState: {
      title: 'The board is quiet.',
      subtext: 'Be the first to post a mission or claim a bounty.',
    },
    activeMission: {
      label: 'ACTIVE MISSION',
      submitLabel: 'SUBMIT WORK',
      dropLabel: 'DROP MISSION',
    },
    rightPanel: {
      topQuestersTitle: 'TOP QUESTERS',
      postMissionLabel: 'POST A MISSION',
      postMissionHref: '/post',
    },
  } as const,
  mobileNav: [
    { label: 'Realm',       href: '/realm',       icon: 'Home' },
    { label: 'Missions',    href: '/missions',     icon: 'Sword' },
    { label: 'Record',      href: '/record',       icon: 'ScrollText' },
    { label: 'Leaderboard', href: '/leaderboard',  icon: 'Trophy' },
  ],
  mobileNavPost: {
    href: '/post',
    icon: 'Plus',
  },
  taskDetail: {
    statusLabels: {
      open:      'OPEN',
      claimed:   'IN PROGRESS',
      completed: 'COMPLETED',
      cancelled: 'CANCELLED',
    },
    statusColors: {
      open:      'text-green-400 border-green-800 bg-green-950',
      claimed:   'text-amber-400 border-amber-800 bg-amber-950',
      completed: 'text-blue-400 border-blue-800 bg-blue-950',
      cancelled: 'text-muted-foreground border-border bg-muted',
    },
    actions: {
      claim:       'CLAIM THIS MISSION',
      submitWork:  'SUBMIT WORK',
      drop:        'DROP MISSION',
      youPosted:   'YOU POSTED THIS',
      inProgress:  'MISSION IN PROGRESS',
      loginPrompt: 'SIGN IN TO CLAIM',
    },
    onChainTitle:   'ON-CHAIN PROOF',
    onChainSubtext: 'This mission has been permanently recorded on the Cardano blockchain.',
  } as const,
  missions: {
    title: 'OPEN MISSIONS',
    subtext: 'Browse all available bounties. Pick your target. Head to the mission for details.',
    emptyState: {
      title: 'No missions found.',
      subtext: 'Try a different filter or check back later.',
    },
    categories: [
      { label: 'All',       value: 'ALL' },
      { label: 'Design',    value: 'DESIGN' },
      { label: 'Code',      value: 'CODE' },
      { label: 'Writing',   value: 'WRITING' },
      { label: 'Research',  value: 'RESEARCH' },
      { label: 'Marketing', value: 'MARKETING' },
      { label: 'Combat',    value: 'COMBAT' },
    ],
    difficulties: [
      { label: 'All',    value: 'ALL' },
      { label: 'Easy',   value: 'easy' },
      { label: 'Medium', value: 'medium' },
      { label: 'Hard',   value: 'hard' },
    ],
    sortOptions: [
      { label: 'Newest First',    value: 'newest' },
      { label: 'Oldest First',    value: 'oldest' },
      { label: 'Highest Reward',  value: 'reward' },
    ],
    pageSize: 12,
  } as const,
  record: {
    title: 'MY RECORD',
    subtext: 'Your permanent on-chain contribution history. Every deed. Forever.',
    emptyState: {
      title: 'No contributions yet.',
      subtext: 'Complete a mission to start building your record.',
      ctaLabel: 'BROWSE MISSIONS',
      ctaHref: '/missions',
    },
    stats: [
      { key: 'completed', label: 'Tasks Completed', icon: 'CheckCircle2' },
      { key: 'credits',   label: 'Credits Earned',  icon: 'Coins' },
      { key: 'rank',      label: 'Current Rank',     icon: 'Trophy' },
      { key: 'proofs',    label: 'On-Chain Proofs',  icon: 'Link2' },
    ],
    profileCard: {
      memberSince:    'MEMBER SINCE',
      walletLabel:    'CARDANO WALLET',
      walletUnlinked: 'No wallet linked',
      linkWalletLabel: 'LINK WALLET',
      linkWalletHref:  '/settings',
      xHandleLabel:   'X ACCOUNT',
    },
  } as const,
  leaderboard: {
    title: 'THE HALL OF FAME',
    subtext: 'The names that echo through the realm. Ranked by credits earned.',
    tableHeaders: {
      rank:      'RANK',
      operative: 'OPERATIVE',
      credits:   'CREDITS',
      completed: 'COMPLETED',
      proofs:    'PROOFS',
    },
    emptyState: {
      title: 'No operatives ranked yet.',
      subtext: 'Complete missions to appear on the leaderboard.',
    },
    pageSize: 20,
  } as const,
} as const
