/**
 * Copy for /how-it-works. Kept out of the page component so the wording can be
 * revised without touching layout — same reasoning as QUEST_CONFIG.
 */
export const HOW_IT_WORKS = {
  intro: {
    headline: "Do the work. Get paid. On-chain.",
    body: "The Quest is a bounty board built on Cardano. Someone posts work and locks the ADA up front. You do the work and submit proof. They approve it, the ADA lands in your wallet, and the completion is written to the blockchain where nobody can take it back. That's it. No bidding wars, no invoices, no waiting 30 days.",
  },

  steps: [
    {
      id: "connect",
      title: "Connect your wallet",
      body: "Your Cardano wallet is your account. You sign a message to prove you control it — no password, no email. That wallet is also where your rewards get paid, so link the one you actually use.",
    },
    {
      id: "claim",
      title: "Claim a mission",
      body: "Browse the board and lock one in. No bidding and no proposals: if a slot is open, it's yours. Some missions take a single hunter, others have several slots and pay each person who delivers. Check the deadline before you claim — it's binding.",
    },
    {
      id: "work",
      title: "Do the work, submit proof",
      body: "Every mission states what proof it wants: a link, some text, an image, or any of the three. Submit it before the deadline. Match the brief as written — that's what you'll be judged against.",
    },
    {
      id: "review",
      title: "Get reviewed",
      body: "The poster reviews your submission and either approves or rejects it. Approval releases payment. A rejection should come with a reason; if the mission has slots left, the slot reopens for someone else.",
    },
    {
      id: "paid",
      title: "Get paid and recorded",
      body: "Approval sends the ADA straight to your wallet, credits your XP, and writes the completion to Cardano. The transaction hash is public — anyone can verify it on a blockchain explorer, forever.",
    },
  ],

  rewards: [
    {
      id: "escrow",
      icon: "ShieldCheck",
      title: "The ADA is locked before you start",
      body: "A poster deposits the full bounty when they post, and we verify that deposit on-chain before the mission goes live. The platform will never release a reward it didn't actually receive — so a poster cannot vanish on you after the work is done.",
    },
    {
      id: "payout",
      icon: "Coins",
      title: "Paid on approval, not on a schedule",
      body: "The moment your submission is approved, the payout transaction is built and submitted to Cardano. There's no invoice and no payment run. Settlement takes as long as the network takes.",
    },
    {
      id: "multi",
      icon: "Sword",
      title: "Multi-hunter missions pay per person",
      body: "A mission with several slots shows the reward per person, not the total pot. Each hunter who gets approved is paid that amount in full. Your payout doesn't shrink because someone else also finished.",
    },
    {
      id: "refund",
      icon: "ScrollText",
      title: "Unfilled slots are refunded",
      body: "If a deadline passes with slots still unclaimed, the ADA for those slots goes back to the poster automatically. Money never sits in limbo — it's either paid out or returned.",
    },
    {
      id: "xp",
      icon: "Trophy",
      title: "XP is separate from ADA",
      body: "Every completed mission also awards XP. XP isn't a token and can't be traded or cashed out — it's the score that drives your rank and your position on the leaderboard.",
    },
    {
      id: "fees",
      icon: "Megaphone",
      title: "Network fees are the network's",
      body: "Cardano charges a small fee per transaction, and confirmation times depend on network conditions. Neither is something the platform sets or controls.",
    },
  ],

  reputation: [
    "Most platforms keep your track record in their database. If they shut down, change their mind, or decide they don't like you, it's gone — and it was never really yours to begin with.",
    "The Quest writes completions to the Cardano blockchain. That record is public, permanent, and independent of us. It isn't a badge we grant you; it's a transaction anyone can verify with a block explorer, whether or not this platform still exists.",
    "In practice that means your history travels with you. Your wallet address is the thread connecting every mission you've delivered, and any poster deciding whether to trust you with a bounty can check the receipts themselves rather than taking our word for it.",
    "The flip side is worth saying plainly: permanence cuts both ways. What goes on-chain stays on-chain, and neither you nor we can edit or delete it later. Complete missions you'd be happy to have attached to your name.",
  ],

  faq: [
    {
      q: "Do I need to already own ADA to start?",
      a: "Not to claim missions and earn. You need a Cardano wallet to receive rewards, but claiming and completing work costs you nothing. You only need ADA up front if you want to post a mission, since the bounty is deposited when you post.",
    },
    {
      q: "What happens if the poster never reviews my submission?",
      a: "Posters are expected to review promptly. If a submission is being ignored, raise it in the Discord and we'll look into it. Note that we can mediate, but we can't reverse a payout that has already settled on-chain.",
    },
    {
      q: "Can I claim more than one mission at a time?",
      a: "Yes. Just be realistic about deadlines — a missed deadline is a missed deadline, and the slot may reopen for someone else.",
    },
    {
      q: "What if my submission is rejected?",
      a: "The poster should tell you why. You aren't paid for a rejected submission. If the mission still has open slots and time on the clock, it goes back on the board.",
    },
    {
      q: "Why did a mission disappear from the board?",
      a: "It didn't. Missions are never hidden or deleted — a mission that's fully claimed, in review, completed, expired, or cancelled stays on the board with a badge saying so. Use the Open Only filter if you want to see just the ones you can still claim.",
    },
    {
      q: "Can I delete my account and my history?",
      a: "We can remove your off-chain profile data on request via Discord. Anything already written to Cardano is permanent and cannot be deleted by anyone, including us. See the Privacy Policy for detail.",
    },
    {
      q: "Is this mainnet or testnet?",
      a: "Both exist. The network switcher in the header shows which one you're viewing. Testnet ADA has no monetary value — check the header before you post a real bounty.",
    },
  ],
} as const
