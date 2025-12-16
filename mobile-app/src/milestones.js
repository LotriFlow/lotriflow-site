// ==================== MILESTONES ====================
const milestones = [
  {
    time: 20 * 60,
    title: "Heart Rate Stabilizes",
    desc: "Pulse and blood pressure start to settle",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  },
  {
    time: 8 * 3600,
    title: "Carbon Monoxide Falling",
    desc: "Oxygen levels rising as CO leaves your blood",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lungs" viewBox="0 0 16 16"><path d="M8.5 1.5a.5.5 0 1 0-1 0v5.243L7 7.1V4.72C7 3.77 6.23 3 5.28 3c-.524 0-1.023.27-1.443.592-.431.332-.847.773-1.216 1.229-.736.908-1.347 1.946-1.58 2.48-.176.405-.393 1.16-.556 2.011-.165.857-.283 1.857-.241 2.759.04.867.233 1.79.838 2.33.67.6 1.622.556 2.741-.004l1.795-.897A2.5 2.5 0 0 0 7 11.264V10.5a.5.5 0 0 0-1 0v.764a1.5 1.5 0 0 1-.83 1.342l-1.794.897c-.978.489-1.415.343-1.628.152-.28-.25-.467-.801-.505-1.63-.037-.795.068-1.71.224-2.525.157-.82.357-1.491.491-1.8.19-.438.75-1.4 1.44-2.25.342-.422.703-.799 1.049-1.065.358-.276.639-.385.833-.385a.72.72 0 0 1 .72.72v3.094l-1.79 1.28a.5.5 0 0 0 .58.813L8 7.614l3.21 2.293a.5.5 0 1 0 .58-.814L10 7.814V4.72a.72.72 0 0 1 .72-.72c.194 0 .475.11.833.385.346.266.706.643 1.05 1.066.688.85 1.248 1.811 1.439 2.249.134.309.334.98.491 1.8.156.814.26 1.73.224 2.525-.038.829-.224 1.38-.505 1.63-.213.19-.65.337-1.628-.152l-1.795-.897A1.5 1.5 0 0 1 10 11.264V10.5a.5.5 0 0 0-1 0v.764a2.5 2.5 0 0 0 1.382 2.236l1.795.897c1.12.56 2.07.603 2.741.004.605-.54.798-1.463.838-2.33.042-.902-.076-1.902-.24-2.759-.164-.852-.38-1.606-.558-2.012-.232-.533-.843-1.571-1.579-2.479-.37-.456-.785-.897-1.216-1.229C11.743 3.27 11.244 3 10.72 3 9.77 3 9 3.77 9 4.72V7.1l-.5-.357z"/></svg>`,
  },
  {
    time: 12 * 3600,
    title: "CO Near Normal",
    desc: "Blood oxygen back toward normal ranges",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
  },
  {
    time: 24 * 3600,
    title: "Nicotine Clearing",
    desc: "Most nicotine is gone; cravings can still peak days 1–3",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line></svg>`,
  },
  {
    time: 48 * 3600,
    title: "Taste & Smell Improving",
    desc: "Nerve endings start recovering",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>`,
  },
  {
    time: 72 * 3600,
    title: "Breathing Getting Easier",
    desc: "Bronchial tubes begin to relax",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>`,
  },
  {
    time: 7 * 24 * 3600,
    title: "1 Week In",
    desc: "Craving intensity often starts to ease",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
  },
  {
    time: 14 * 24 * 3600,
    title: "Circulation Boost",
    desc: "Blood flow and endurance improving",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
  },
  {
    time: 21 * 24 * 3600,
    title: "Brain Rebalancing",
    desc: "Nicotine receptors down-regulating",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  },
  {
    time: 30 * 24 * 3600,
    title: "1 Month Milestone",
    desc: "Lung function beginning to improve",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  },
  {
    time: 60 * 24 * 3600,
    title: "2 Months Smoke-Free",
    desc: "Energy and stamina continue to rise",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  },
  {
    time: 90 * 24 * 3600,
    title: "3 Months Strong",
    desc: "Breathing and circulation meaningfully improved",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.89"></polyline></svg>`,
  },
  {
    time: 180 * 24 * 3600,
    title: "6 Months",
    desc: "Coughing and wheezing often reduced",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
  },
  {
    time: 270 * 24 * 3600,
    title: "9 Months",
    desc: "Cilia recovery lowers lung infection risk",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  },
  {
    time: 365 * 24 * 3600,
    title: "1 Year Smoke-Free",
    desc: "Heart disease risk may be significantly reduced",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>`,
  },
  {
    time: 2 * 365 * 24 * 3600,
    title: "2 Years",
    desc: "Cardiovascular health often continues improving",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  },
  {
    time: 5 * 365 * 24 * 3600,
    title: "5 Years",
    desc: "Stroke risk may approach non-smoker levels",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  },
  {
    time: 10 * 365 * 24 * 3600,
    title: "10 Years",
    desc: "Long-term lung health significantly improved",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.89"></polyline></svg>`,
  },
];


// ==================== ACHIEVEMENTS ====================
const achievementDefs = [
  {
    id: "first_hour",
    title: "First Hour",
    desc: "1 hour smoke-free",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    condition: () => getElapsedSeconds() >= 3600,
  },
  {
    id: "first_day",
    title: "Day One",
    desc: "24 hours smoke-free",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="2" x2="12" y2="9"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="8 6 12 2 16 6"></polyline></svg>`,
    condition: () => getElapsedSeconds() >= 86400,
  },
  {
    id: "first_week",
    title: "Week Warrior",
    desc: "7 days smoke-free",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    condition: () => getElapsedSeconds() >= 7 * 86400,
  },
  {
    id: "two_weeks",
    title: "Fortnight Fighter",
    desc: "14 days smoke-free",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
    condition: () => getElapsedSeconds() >= 14 * 86400,
  },
  {
    id: "first_month",
    title: "Monthly Master",
    desc: "30 days smoke-free",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    condition: () => getElapsedSeconds() >= 30 * 86400,
  },
  {
    id: "saver_10",
    title: "$10 Saved",
    desc: "Saved $10+",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    condition: () => getMoneySaved() >= 10,
  },
  {
    id: "saver_50",
    title: "$50 Saved",
    desc: "Saved $50+",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    condition: () => getMoneySaved() >= 50,
  },
  {
    id: "saver_100",
    title: "$100 Club",
    desc: "Saved $100+",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    condition: () => getMoneySaved() >= 100,
  },
  {
    id: "avoided_20",
    title: "Pack Saved",
    desc: "Avoided 20+ cigarettes",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>`,
    condition: () => getCigarettesAvoided() >= 20,
  },
  {
    id: "avoided_100",
    title: "5 Packs Saved",
    desc: "Avoided 100+ cigarettes",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>`,
    condition: () => getCigarettesAvoided() >= 100,
  },
  {
    id: "avoided_200",
    title: "Carton Saved",
    desc: "Avoided 200+ cigarettes",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>`,
    condition: () => getCigarettesAvoided() >= 200,
  },
  {
    id: "avoided_500",
    title: "Freedom Fighter",
    desc: "Avoided 500+ cigarettes",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.93"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    condition: () => getCigarettesAvoided() >= 500,
  },
  {
    id: "streak_3",
    title: "3 Day Streak",
    desc: "3 days under limit",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    condition: (s) => s.streak >= 3,
  },
  {
    id: "streak_7",
    title: "Week Streak",
    desc: "7 days under limit",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
    condition: (s) => s.streak >= 7,
  },
  {
    id: "streak_30",
    title: "Month Streak",
    desc: "30 days under limit",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.89"></polyline></svg>`,
    condition: (s) => s.streak >= 30,
  },
  {
    id: "clean_3",
    title: "3 Days Clean",
    desc: "3 smoke-free days",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    condition: (s) => s.smokeFreeStreak >= 3,
  },
  {
    id: "clean_7",
    title: "Week Clean",
    desc: "7 smoke-free days",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.45 10.53L12 22 1.55 10.53 12 2 22.45 10.53z"></path></svg>`,
    condition: (s) => s.smokeFreeStreak >= 7,
  },
  {
    id: "clean_30",
    title: "Month Clean",
    desc: "30 smoke-free days",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.89"></polyline></svg>`,
    condition: (s) => s.smokeFreeStreak >= 30,
  },
  {
    id: "night_owl",
    title: "Night Owl",
    desc: "Log between midnight-5am",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    condition: (s) =>
      s.cigaretteLog.some((log) => {
        const hour = new Date(log).getHours();
        return hour >= 0 && hour < 5;
      }),
  },
];

const quotes = [
  {
    text: "Every cigarette you don't smoke is a victory.",
    author: "Your Future Self",
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  { text: "You are stronger than your cravings.", author: "LotriFlow Quit" },
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "Your lungs are thanking you right now.", author: "Science" },
  {
    text: "One day at a time, one craving at a time.",
    author: "Recovery Wisdom",
  },
  {
    text: "Freedom is on the other side of discipline.",
    author: "Jocko Willink",
  },
  { text: "Each craving only lasts 3-5 minutes.", author: "Medical Research" },
];

const coachMessages = [
  `You're doing amazing! Every minute counts. <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M12 3 s-1.5 2.5-1.5 4.5S12 11 12 11s1.5-1.5 1.5-3.5S12 3 12 3Z"/><path d="M8 11c-1.5 1.5-2.5 3.5-2 5.5C6.5 19.5 8.5 21 12 21s5.5-1.5 6-4.5C18.5 14.5 17.5 12.5 16 11M10.5 14c-.5.5-.8 1.1-.7 1.8.1.9.9 1.7 2.2 1.7 1.3 0 2.1-.8 2.2-1.7.1-.7-.2-1.3-.7-1.8"/></svg>`,
  "Cravings typically last only 3-5 minutes. You can outlast this!",
  "Take a deep breath. Your lungs are already healing.",
  "Remember why you started this journey. You've got this!",
  "Your body is thanking you right now. Keep going!",
  "The hardest part is behind you. Stay strong!",
  "You're breaking free from addiction. That takes real courage.",
  "Each craving you resist makes the next one weaker.",
];

// Enhanced AI Coach Data
const crisisMessages = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/><path d="M7 9h2m6 0h2"/></svg> I sense you're struggling right now. That's completely normal - cravings can be intense. Let's get through this together!`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9h16M9 3v4M15 3v4"/><path d="M9 13h6"/></svg> This craving will pass. Remember: it's temporary. You've already proven you can do this!`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> You're stronger than this moment. Take one breath at a time. I'm right here with you.`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 9h16M9 3v4M15 3v4"/><path d="M9 13h6"/></svg> Cravings peak and then fade. This one is no different. You've got the tools to beat it!`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m8-10h2M2 12H4"/></svg> Focus on the next 5 minutes. Just 5 minutes of resistance. You can do anything for 5 minutes!`,
];

const moodBasedMessages = {
  struggling: [
    `I know this is tough, but you're tougher. Every second you resist makes you stronger. <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    `This is the addiction trying to win. Don't let it. You're in control now. <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M12 3 s-1.5 2.5-1.5 4.5S12 11 12 11s1.5-1.5 1.5-3.5S12 3 12 3Z"/><path d="M8 11c-1.5 1.5-2.5 3.5-2 5.5C6.5 19.5 8.5 21 12 21s5.5-1.5 6-4.5C18.5 14.5 17.5 12.5 16 11M10.5 14c-.5.5-.8 1.1-.7 1.8.1.9.9 1.7 2.2 1.7 1.3 0 2.1-.8 2.2-1.7.1-.7-.2-1.3-.7-1.8"/></svg>`,
    `Remember your 'why' - why you started this journey. Hold onto that. <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    `You're not alone in this. Millions have walked this path before you and succeeded. <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/><path d="M7 9h2m6 0h2"/></svg>`,
  ],
  motivated: [
    `Your determination is inspiring! Keep that fire burning. <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M12 3 s-1.5 2.5-1.5 4.5S12 11 12 11s1.5-1.5 1.5-3.5S12 3 12 3Z"/><path d="M8 11c-1.5 1.5-2.5 3.5-2 5.5C6.5 19.5 8.5 21 12 21s5.5-1.5 6-4.5C18.5 14.5 17.5 12.5 16 11M10.5 14c-.5.5-.8 1.1-.7 1.8.1.9.9 1.7 2.2 1.7 1.3 0 2.1-.8 2.2-1.7.1-.7-.2-1.3-.7-1.8"/></svg>`,
    `You're crushing this! Stay focused on your goals. <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m8-10h2M2 12H4"/></svg>`,
    `This is what champions look like - consistent, strong, unstoppable. <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    `Your commitment is paying off. Keep building momentum! <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M12 3 s-1.5 2.5-1.5 4.5S12 11 12 11s1.5-1.5 1.5-3.5S12 3 12 3Z"/><path d="M8 11c-1.5 1.5-2.5 3.5-2 5.5C6.5 19.5 8.5 21 12 21s5.5-1.5 6-4.5C18.5 14.5 17.5 12.5 16 11M10.5 14c-.5.5-.8 1.1-.7 1.8.1.9.9 1.7 2.2 1.7 1.3 0 2.1-.8 2.2-1.7.1-.7-.2-1.3-.7-1.8"/></svg>`,
  ],
  celebrating: [
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> AMAZING! You're absolutely crushing your goals!`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> You're a smoke-free warrior! Celebrate this victory!`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> Champion status unlocked! You're doing incredible things!`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> This calls for a celebration! You've earned every bit of pride!`,
  ],
};

const breathingTechniques = {
  478: {
    name: "4-7-8 Breathing",
    description: "Classic 4-7-8 breathing exercise for calm focus",
    // Use the same inline SVG icon as the selector card
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>`,
    phases: [
      { text: "Breathe In through nose...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 4 },
      { text: "Hold breath...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 7 },
      { text: "Breathe Out through mouth...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 8 },
    ],
  },
  box: {
    name: "Box Breathing",
    description: "Common tactical breathing for stress control",
    // Use the box icon used in the selector card
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`,
    phases: [
      { text: "Breathe In...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 4 },
      { text: "Hold...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 4 },
      { text: "Breathe Out...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 4 },
      { text: "Hold...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 4 },
    ],
  },
  alternate: {
    name: "Alternate Nostril",
    description: "Balances energy and reduces anxiety",
    // Yin-yang style icon representing balance and alternation
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><circle cx="12" cy="8" r="2" fill="currentColor"/><circle cx="12" cy="16" r="2"/></svg>`,
    phases: [
      { text: "Close right nostril, breathe in left...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 4 },
      { text: "Close left nostril, hold...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 4 },
      {
        text: "Open right, close left, breathe out right...",
        emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 4,
      },
      { text: "Breathe in right...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 4 },
      { text: "Close right, hold...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 4 },
      {
        text: "Open left, close right, breathe out left...",
        emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>`, time: 4,
      },
    ],
  },
  quick: {
    name: "Quick Reset",
    description: "Fast stress relief for intense moments",
    // Use the quick reset icon used in the selector card
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    phases: [
      { text: "Quick breath in...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 2 },
      { text: "Hold briefly...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 1 },
      { text: "Long slow exhale...", emoji: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-icon"><path d="M3 13h3.5l2-6 3 12 2.5-6H21"/><path d="M4 8c0-2.5 2-4.5 4.5-4.5 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2C18.9 3.5 21 5.5 21 8c0 4.5-5.5 8-9 11-3.5-3-9-6.5-9-11Z"/></svg>`, time: 4 },
    ],
  },
};

function renderMilestones() {
  const container = document.getElementById("milestonesList");
  if (!container) return;

  const elapsed = getElapsedSeconds();

  container.innerHTML = milestones
    .map((m) => {
      const achieved = elapsed >= m.time;
      const progress = Math.min((elapsed / m.time) * 100, 100);

      return `
      <div class="milestone ${achieved ? "achieved" : ""}">
        <div class="milestone-icon">${m.icon}</div>
        <div class="milestone-content">
          <div class="milestone-title">${m.title}</div>
          <div class="milestone-desc">${m.desc}</div>
          ${
            !achieved
              ? `
            <div class="milestone-progress">
              <div class="milestone-progress-bar" style="width: ${progress}%"></div>
            </div>
            <div class="milestone-time">${formatTimeUntil(
              elapsed
            )} of ${formatTimeUntil(m.time)}</div>
          `
              : '<div class="milestone-achieved-badge"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><polyline points="20 6 9 17 4 12"></polyline></svg>Achieved!</div>'
          }
        </div>
      </div>
    `;
    })
    .join("");
}

function renderAchievements() {
  // Ensure newly-eligible badges are unlocked before rendering
  checkAchievements({ render: false });

  const container = document.getElementById("achievementsGrid");
  if (!container) return;

  // Calculate badge stats
  const totalBadges = achievementDefs.length;
  const unlockedIds = Object.keys(state.achievements).filter((id) =>
    achievementDefs.some((a) => a.id === id)
  );
  const unlockedBadges = unlockedIds.length;
  const badgesPercent = Math.round((unlockedBadges / totalBadges) * 100);

  document.getElementById("badgesUnlocked").textContent = unlockedBadges;
  document.getElementById("badgesTotal").textContent = totalBadges;
  document.getElementById("badgesPercent").textContent = `${badgesPercent}%`;

  // Find next badge to unlock
  const nextBadge = achievementDefs.find((ach) => !state.achievements[ach.id]);
  const nextBadgeCard = document.getElementById("nextBadgeCard");

  if (nextBadge && nextBadgeCard) {
    nextBadgeCard.style.display = "block";
    document.getElementById("nextBadgeIcon").innerHTML = nextBadge.icon;
    document.getElementById("nextBadgeTitle").textContent = nextBadge.title;

    // Calculate progress for next badge
    let progressText = nextBadge.desc;

    // Time-based badges
    if (
      nextBadge.id.includes("hour") ||
      nextBadge.id.includes("day") ||
      nextBadge.id.includes("week") ||
      nextBadge.id.includes("month")
    ) {
      const elapsed = getElapsedSeconds();
      let targetSeconds = 0;

      if (nextBadge.id === "first_hour") targetSeconds = 3600;
      else if (nextBadge.id === "first_day") targetSeconds = 86400;
      else if (nextBadge.id === "first_week") targetSeconds = 7 * 86400;
      else if (nextBadge.id === "two_weeks") targetSeconds = 14 * 86400;
      else if (nextBadge.id === "first_month") targetSeconds = 30 * 86400;

      const remaining = targetSeconds - elapsed;
      if (remaining > 0) {
        progressText = formatTimeUntil(remaining) + " to go";
      } else {
        progressText = "Almost there!";
      }
    }
    // Money-based badges
    else if (nextBadge.id.includes("saver")) {
      const saved = getMoneySaved();
      let target = 0;
      if (nextBadge.id === "saver_10") target = 10;
      else if (nextBadge.id === "saver_50") target = 50;
      else if (nextBadge.id === "saver_100") target = 100;

      const remaining = target - saved;
      if (remaining > 0) {
        progressText = `${getCurrencySymbol()}${remaining.toFixed(2)} to go`;
      }
    }
    // Avoided badges
    else if (nextBadge.id.includes("avoided")) {
      const avoided = getCigarettesAvoided();
      let target = 0;
      if (nextBadge.id === "avoided_10") target = 10;
      else if (nextBadge.id === "avoided_50") target = 50;
      else if (nextBadge.id === "avoided_100") target = 100;

      const remaining = target - avoided;
      if (remaining > 0) {
        progressText = `${remaining} more to avoid`;
      }
    }
    // Streak badges
    else if (nextBadge.id.includes("streak")) {
      const streak = state.streak;
      let target = 0;
      if (nextBadge.id === "streak_3") target = 3;
      else if (nextBadge.id === "streak_7") target = 7;
      else if (nextBadge.id === "streak_30") target = 30;

      const remaining = target - streak;
      if (remaining > 0) {
        progressText = `${remaining} more days under limit`;
      }
    }

    document.getElementById("nextBadgeProgress").textContent = progressText;
  } else if (nextBadgeCard) {
    nextBadgeCard.style.display = "none";
  }

  container.innerHTML = achievementDefs
    .map((ach) => {
      // Only check unlocked from saved state (don't auto-unlock on render)
      const unlocked = !!state.achievements[ach.id];

      return `
      <div class="achievement ${unlocked ? "unlocked" : "locked"}">
        <div class="achievement-icon">${ach.icon}</div>
        <div class="achievement-title">${ach.title}</div>
        <div class="achievement-desc">${ach.desc}</div>
      </div>
    `;
    })
    .join("");
}

function formatTimeUntil(seconds) {
  if (seconds < 0) return "Now!";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function checkAchievements(options = { render: true }) {
  let newUnlock = false;
  achievementDefs.forEach((a) => {
    if (!state.achievements[a.id] && a.condition(state)) {
      state.achievements[a.id] = Date.now();
      newUnlock = true;
    }
  });
  if (newUnlock) {
    saveState();
    if (options.render) renderAchievements();
    showToast("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-award\"><circle cx=\"12\" cy=\"8\" r=\"7\"></circle><polyline points=\"8.21 13.89 7 23 12 20 17 23 15.79 13.89\"></polyline></svg> New achievement unlocked!", "success");
    emitStateUpdated("achievement_unlock");
    scheduleUIRefresh();
  }
}
