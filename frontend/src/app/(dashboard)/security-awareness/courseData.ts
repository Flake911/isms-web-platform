export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SimulationChoice {
  text: string;
  correct: boolean;
  feedback: string;
}

export interface Simulation {
  scenario: string;
  context: string;
  emailFrom?: string;
  emailSubject?: string;
  emailBody?: string;
  choices: SimulationChoice[];
}

export interface AttackStep {
  icon: string;
  title: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  category: string;
  color: string;
  icon: string;
  attackFlow: AttackStep[];
  explanation: string;
  simulation: Simulation;
  quiz: QuizQuestion[];
}

export const courses: Course[] = [
  {
    id: 'phishing',
    title: 'Phishing Attacks',
    description: 'Learn how attackers use fake emails and websites to steal your credentials and sensitive information.',
    difficulty: 'Beginner',
    duration: '8 min',
    category: 'Phishing',
    color: '#EF4444',
    icon: '🎣',
    attackFlow: [
      { icon: '🎭', title: 'Attacker Prepares', description: 'Attacker creates a fake website that looks identical to a legitimate one (bank, email provider, etc.)' },
      { icon: '📧', title: 'Sends Bait Email', description: 'A convincing email is sent with urgent language: "Your account will be locked!"' },
      { icon: '🖱️', title: 'Victim Clicks Link', description: 'The victim clicks the malicious link, which leads to the fake website' },
      { icon: '🔑', title: 'Credentials Stolen', description: 'Victim enters username & password on the fake site — data goes straight to the attacker' },
      { icon: '💰', title: 'Account Compromised', description: 'Attacker uses stolen credentials to access the real account and steal data or money' },
    ],
    explanation: 'Phishing is a cyberattack where attackers impersonate trusted entities (banks, employers, services) via email or messages to trick victims into revealing sensitive information like passwords, credit card numbers, or personal data. It remains the #1 attack vector, responsible for over 90% of data breaches.',
    simulation: {
      scenario: 'You receive the following email in your inbox at work:',
      context: 'It\'s Monday morning and you just logged in.',
      emailFrom: 'security@micros0ft-support.com',
      emailSubject: '⚠️ URGENT: Your account has been suspended',
      emailBody: 'Dear User,\n\nWe detected unusual activity on your Microsoft 365 account. Your account has been temporarily suspended.\n\nClick here immediately to verify your identity and restore access:\nhttps://micros0ft-verify.suspicious-domain.com/login\n\nIf you do not verify within 24 hours, your account will be permanently deleted.\n\nMicrosoft Security Team',
      choices: [
        { text: 'Click the link and enter your password', correct: false, feedback: '❌ NEVER click suspicious links! The URL "micros0ft-support.com" uses a zero instead of "o" — a classic phishing trick.' },
        { text: 'Forward to IT/Security team and report it', correct: true, feedback: '✅ Excellent! Reporting suspicious emails to your security team is the best response. They can investigate and block the sender.' },
        { text: 'Reply asking if it\'s legitimate', correct: false, feedback: '❌ Never reply to suspicious emails. This confirms your email is active and you may receive more attacks.' },
        { text: 'Ignore and delete the email', correct: true, feedback: '✅ Good instinct! Deleting is safe, but reporting to IT is even better so they can protect other employees too.' },
      ],
    },
    quiz: [
      { question: 'What is the most common sign of a phishing email?', options: ['Official company logo', 'Urgent language demanding immediate action', 'Sent during business hours', 'Short email length'], correctIndex: 1, explanation: 'Phishing emails create urgency to bypass your critical thinking. Phrases like "Act NOW" or "Account will be deleted" are red flags.' },
      { question: 'Which URL is likely a phishing attempt?', options: ['https://login.microsoft.com/auth', 'https://micros0ft-login.com/verify', 'https://outlook.office365.com', 'https://teams.microsoft.com'], correctIndex: 1, explanation: 'The URL uses "micros0ft" (with a zero) instead of "microsoft" — a technique called typosquatting.' },
      { question: 'What should you do if you accidentally clicked a phishing link?', options: ['Ignore it and hope for the best', 'Immediately change your password and report to IT', 'Delete the email and forget about it', 'Reply to the sender'], correctIndex: 1, explanation: 'If you clicked a phishing link, immediately change your password, enable 2FA, and report the incident to IT security.' },
    ],
  },
  {
    id: 'spear-phishing',
    title: 'Spear Phishing & Whaling',
    description: 'Understand targeted phishing attacks that use personal information to trick specific individuals or executives.',
    difficulty: 'Intermediate',
    duration: '10 min',
    category: 'Phishing',
    color: '#DC2626',
    icon: '🎯',
    attackFlow: [
      { icon: '🔍', title: 'Research Target', description: 'Attacker studies the victim\'s LinkedIn, social media, and company website for personal details' },
      { icon: '✍️', title: 'Craft Personal Email', description: 'Creates a highly personalized email referencing real colleagues, projects, or events' },
      { icon: '👤', title: 'Impersonate Authority', description: 'Poses as CEO, CFO, or trusted partner requesting urgent action' },
      { icon: '💸', title: 'Request Action', description: 'Asks for wire transfer, sensitive data, or credential sharing' },
      { icon: '🏦', title: 'Financial Loss', description: 'Company loses money or data through the trusted relationship exploitation' },
    ],
    explanation: 'Spear phishing targets specific individuals using personalized information gathered from social media and public sources. Whaling targets C-level executives (the "big fish"). These attacks are far more dangerous than regular phishing because they appear to come from trusted colleagues.',
    simulation: {
      scenario: 'You receive this email from what appears to be your CEO:',
      context: 'You work in finance. Your CEO is currently traveling for a conference.',
      emailFrom: 'ceo.johnson@company-corp.net',
      emailSubject: 'Urgent — Wire Transfer Needed Today',
      emailBody: 'Hi,\n\nI\'m at the Berlin conference and need you to process an urgent wire transfer of €45,000 to our new vendor. This must be completed today before 3 PM.\n\nPlease don\'t discuss this with others as it\'s a confidential acquisition deal.\n\nI\'ll send the bank details shortly. Please confirm you can handle this ASAP.\n\nBest,\nJohn Johnson\nCEO',
      choices: [
        { text: 'Process the wire transfer immediately', correct: false, feedback: '❌ Never process urgent financial requests without verification! The "don\'t tell anyone" instruction is a major red flag.' },
        { text: 'Call the CEO directly on their known phone number to verify', correct: true, feedback: '✅ Always verify unusual requests through a separate communication channel. Call using a known number, not one from the email.' },
        { text: 'Reply to the email asking for more details', correct: false, feedback: '❌ Replying to the email goes back to the attacker. Always use a separate, verified channel to confirm.' },
        { text: 'Forward to IT security and your manager', correct: true, feedback: '✅ Great choice! Alerting security and your manager helps prevent the attack and protects the organization.' },
      ],
    },
    quiz: [
      { question: 'What makes spear phishing different from regular phishing?', options: ['It uses more spam', 'It targets specific individuals with personalized info', 'It only happens via phone', 'It\'s less dangerous'], correctIndex: 1, explanation: 'Spear phishing uses personally researched information to make the attack highly convincing and targeted.' },
      { question: 'A "whaling" attack specifically targets:', options: ['IT staff', 'New employees', 'C-level executives and senior management', 'Customers'], correctIndex: 2, explanation: 'Whaling targets senior executives — the "big fish" — because they have authority over financial and sensitive decisions.' },
      { question: 'Which is a red flag in a CEO fraud email?', options: ['Requesting urgent, confidential wire transfer', 'Sent from corporate email domain', 'Discussing a routine meeting', 'Including team members in CC'], correctIndex: 0, explanation: 'Urgency + secrecy + financial request is the classic CEO fraud pattern.' },
    ],
  },
  {
    id: 'password-security',
    title: 'Password Security',
    description: 'Master the art of creating and managing strong passwords to protect your accounts from brute-force attacks.',
    difficulty: 'Beginner',
    duration: '7 min',
    category: 'Access Control',
    color: '#2563EB',
    icon: '🔐',
    attackFlow: [
      { icon: '📋', title: 'Data Breach Occurs', description: 'A website or service gets hacked and user databases with hashed passwords are leaked' },
      { icon: '⚡', title: 'Brute Force / Dictionary', description: 'Attacker uses automated tools to try millions of password combinations per second' },
      { icon: '🔓', title: 'Weak Passwords Cracked', description: 'Simple passwords like "password123" are cracked in seconds; complex ones take years' },
      { icon: '🔄', title: 'Credential Stuffing', description: 'Attacker tries the cracked password on other sites (banking, email) — most people reuse passwords' },
      { icon: '🏴‍☠️', title: 'Multiple Accounts Breached', description: 'All accounts using the same password are now compromised' },
    ],
    explanation: 'Password attacks include brute force (trying every combination), dictionary attacks (common passwords), credential stuffing (reusing leaked passwords), and rainbow tables. A strong, unique password is your first line of defense. Enable Multi-Factor Authentication (MFA) wherever possible.',
    simulation: {
      scenario: 'You need to create a new password for the company HR portal. Which would you choose?',
      context: 'The system requires at least 12 characters.',
      choices: [
        { text: 'Company2024!', correct: false, feedback: '❌ This uses a predictable pattern (company name + year). Attackers try these combinations first.' },
        { text: 'Correct-Horse-Battery-Staple-7!', correct: true, feedback: '✅ Excellent! A passphrase with random words, numbers, and symbols is both strong and memorable. This would take centuries to crack.' },
        { text: 'P@ssw0rd123!', correct: false, feedback: '❌ Despite having symbols and numbers, this is one of the most commonly used passwords and appears in every hacker\'s dictionary.' },
        { text: 'qwerty12345678', correct: false, feedback: '❌ Keyboard patterns are among the first combinations attackers try. This would be cracked in seconds.' },
      ],
    },
    quiz: [
      { question: 'How long would it take to crack the password "123456"?', options: ['1 hour', 'Less than 1 second', '1 day', '1 week'], correctIndex: 1, explanation: '"123456" is the most common password in the world and is instantly cracked by any password-cracking tool.' },
      { question: 'What is the best practice for managing passwords?', options: ['Use the same strong password everywhere', 'Write them on a sticky note', 'Use a password manager with unique passwords', 'Change all passwords monthly to the same new one'], correctIndex: 2, explanation: 'A password manager generates and stores unique, strong passwords for every account, eliminating reuse.' },
      { question: 'What does MFA/2FA protect against?', options: ['Slow internet', 'Attackers who have your password', 'Computer viruses', 'Spam emails'], correctIndex: 1, explanation: 'Even if your password is stolen, MFA requires a second factor (phone code, fingerprint) making the password alone useless.' },
    ],
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering',
    description: 'Recognize manipulation tactics that exploit human psychology to bypass security controls.',
    difficulty: 'Intermediate',
    duration: '10 min',
    category: 'Social Engineering',
    color: '#8B5CF6',
    icon: '🧠',
    attackFlow: [
      { icon: '🎭', title: 'Build Trust', description: 'Attacker poses as IT support, delivery person, or authority figure to establish credibility' },
      { icon: '😰', title: 'Create Pressure', description: 'Uses urgency, fear, or helpfulness: "Server is crashing, I need your login NOW!"' },
      { icon: '🤝', title: 'Exploit Trust', description: 'Victim provides access, credentials, or sensitive information trusting the fake identity' },
      { icon: '🚪', title: 'Gain Access', description: 'Attacker uses acquired information to breach systems or physical locations' },
      { icon: '📤', title: 'Exfiltrate Data', description: 'Sensitive data is stolen, copied, or systems are compromised from the inside' },
    ],
    explanation: 'Social engineering exploits human psychology rather than technical vulnerabilities. Tactics include pretexting (creating a fake scenario), baiting (offering something enticing), tailgating (following someone through a secure door), and quid pro quo (offering a service in exchange for info).',
    simulation: {
      scenario: 'You receive a phone call at your desk:',
      context: '"Hi, this is Mike from IT Support. We\'re seeing some unusual network activity from your computer. I need to remotely access your machine to run a security scan. Can you give me your login credentials so I can check right away? This is urgent — we think there might be a breach."',
      choices: [
        { text: 'Give them your credentials — they\'re from IT', correct: false, feedback: '❌ Real IT staff never ask for passwords over the phone! This is a classic pretexting attack.' },
        { text: 'Ask for their employee ID and call the IT helpdesk to verify', correct: true, feedback: '✅ Always verify identity through official channels. Call the known IT helpdesk number, not any number the caller provides.' },
        { text: 'Let them remote in — it sounds urgent', correct: false, feedback: '❌ Urgency is a manipulation tactic. Never grant remote access to unverified callers.' },
        { text: 'Hang up and report to your manager', correct: true, feedback: '✅ Good choice! When in doubt, disconnect and report. It\'s better to be safe than compromised.' },
      ],
    },
    quiz: [
      { question: 'What is "pretexting" in social engineering?', options: ['Sending spam texts', 'Creating a fabricated scenario to gain trust', 'Pretending to be a customer', 'Using preview text in emails'], correctIndex: 1, explanation: 'Pretexting involves creating a fake but believable story to manipulate the victim into sharing information or access.' },
      { question: 'An attacker follows an employee through a locked door. This is called:', options: ['Shoulder surfing', 'Tailgating / Piggybacking', 'Dumpster diving', 'Phishing'], correctIndex: 1, explanation: 'Tailgating is when an unauthorized person follows an authorized person through a secure entrance.' },
      { question: 'Which psychological principle do social engineers exploit most?', options: ['Laziness', 'Authority and urgency', 'Boredom', 'Curiosity only'], correctIndex: 1, explanation: 'Social engineers leverage authority ("I\'m from IT") and urgency ("Do it NOW") to bypass rational thinking.' },
    ],
  },
  {
    id: 'malware-ransomware',
    title: 'Malware & Ransomware',
    description: 'Understand different types of malicious software and how ransomware encrypts your files for extortion.',
    difficulty: 'Beginner',
    duration: '9 min',
    category: 'Malware',
    color: '#F97316',
    icon: '🦠',
    attackFlow: [
      { icon: '📎', title: 'Delivery', description: 'Malware arrives via email attachment, malicious download, infected USB, or compromised website' },
      { icon: '⚙️', title: 'Execution', description: 'User opens the file or runs the program — malware installs silently in the background' },
      { icon: '🔒', title: 'Encryption (Ransomware)', description: 'Ransomware encrypts all files on the system and connected network drives' },
      { icon: '💀', title: 'Ransom Demand', description: 'A message appears demanding payment in cryptocurrency to decrypt files' },
      { icon: '📊', title: 'Data Exfiltration', description: 'Modern ransomware also steals data, threatening to publish it if ransom isn\'t paid (double extortion)' },
    ],
    explanation: 'Malware includes viruses, worms, trojans, spyware, adware, and ransomware. Ransomware is the most devastating — it encrypts files and demands payment. Average ransom in 2024: $1.5 million. Prevention: never open unknown attachments, keep software updated, maintain backups.',
    simulation: {
      scenario: 'You receive an email with an attachment:',
      context: 'The email says: "Please review the attached invoice for project #4521. Payment is overdue." The attachment is named "Invoice_4521.pdf.exe"',
      emailFrom: 'billing@vendor-payments.net',
      emailSubject: 'Overdue Invoice #4521 — Action Required',
      emailBody: 'Dear Accounts Team,\n\nPlease find attached the overdue invoice for project #4521.\nPayment of $12,500 is past due by 15 days.\n\nPlease process immediately to avoid late fees.\n\nAttachment: Invoice_4521.pdf.exe (245 KB)\n\nBest regards,\nAccounts Department',
      choices: [
        { text: 'Open the attachment to check the invoice', correct: false, feedback: '❌ The file extension ".pdf.exe" means it\'s an executable program disguised as a PDF! Opening it would install malware.' },
        { text: 'Delete the email and report to IT security', correct: true, feedback: '✅ The double extension ".pdf.exe" is a classic malware trick. Real invoices are never .exe files. Report it immediately.' },
        { text: 'Save the attachment and scan it later', correct: false, feedback: '❌ Even saving the file is risky. Some malware can execute on download. Don\'t interact with suspicious attachments at all.' },
        { text: 'Forward it to the finance team to handle', correct: false, feedback: '❌ Never forward suspicious attachments! You\'d be spreading the potential malware to more people.' },
      ],
    },
    quiz: [
      { question: 'What type of malware encrypts files and demands payment?', options: ['Trojan', 'Spyware', 'Ransomware', 'Adware'], correctIndex: 2, explanation: 'Ransomware encrypts the victim\'s files and demands a ransom (usually in cryptocurrency) for the decryption key.' },
      { question: 'Which file extension is suspicious for an "invoice"?', options: ['.pdf', '.xlsx', '.pdf.exe', '.docx'], correctIndex: 2, explanation: 'Double extensions like ".pdf.exe" are a trick to disguise executable malware as documents. Windows may hide the .exe part.' },
      { question: 'What is the best protection against ransomware?', options: ['Paying the ransom quickly', 'Regular offline backups + keeping software updated', 'Using only Mac computers', 'Avoiding the internet'], correctIndex: 1, explanation: 'Regular offline/offsite backups ensure you can recover without paying. Keeping software patched prevents known vulnerabilities.' },
    ],
  },
  {
    id: 'usb-physical',
    title: 'USB & Physical Attacks',
    description: 'Learn about physical attack vectors including USB drops, evil twin devices, and physical intrusion.',
    difficulty: 'Beginner',
    duration: '6 min',
    category: 'Physical Security',
    color: '#06B6D4',
    icon: '💾',
    attackFlow: [
      { icon: '💾', title: 'USB Drop', description: 'Attacker leaves infected USB drives in parking lots, lobbies, or on desks' },
      { icon: '🤔', title: 'Curiosity Exploited', description: 'Employee finds the USB and plugs it into their work computer out of curiosity' },
      { icon: '⚡', title: 'Auto-Execute', description: 'Malware runs automatically when the USB is inserted — some USBs can fry the computer (USB Killer)' },
      { icon: '🌐', title: 'Network Access', description: 'Malware spreads through the corporate network from the infected computer' },
      { icon: '🏢', title: 'Full Compromise', description: 'Attacker gains remote access to the entire corporate network' },
    ],
    explanation: 'Physical attacks bypass digital security entirely. USB drops exploit curiosity — studies show 48% of people plug in found USBs. Other physical attacks include installing keyloggers, evil maid attacks on unattended laptops, and shoulder surfing to steal passwords.',
    simulation: {
      scenario: 'You find a USB drive in the office parking lot with a label that says "Employee Salaries Q4 2024":',
      context: 'It\'s a branded USB drive that looks like it belongs to your company.',
      choices: [
        { text: 'Plug it into your computer — it might belong to HR', correct: false, feedback: '❌ This is exactly what attackers want! 48% of people plug in found USBs. It could install malware instantly.' },
        { text: 'Turn it in to IT security without plugging it in', correct: true, feedback: '✅ Perfect! IT security has isolated systems to safely examine unknown devices. Never plug unknown USBs into your work computer.' },
        { text: 'Plug it into a personal device instead', correct: false, feedback: '❌ This just compromises your personal device instead. The malware doesn\'t care which computer it infects.' },
        { text: 'Throw it in the trash', correct: false, feedback: '⚠️ While this avoids infection, turning it in to IT is better — they can analyze it and potentially identify a targeted attack.' },
      ],
    },
    quiz: [
      { question: 'What percentage of people plug in found USB drives (per research)?', options: ['5%', '25%', '48%', '75%'], correctIndex: 2, explanation: 'Research shows that 48% of people who find USB drives will plug them in, and 68% take no precautions.' },
      { question: 'What is a "USB Killer"?', options: ['Antivirus for USB', 'A device that sends a power surge to destroy the computer', 'A USB formatting tool', 'A brand of USB drives'], correctIndex: 1, explanation: 'A USB Killer sends a high-voltage power surge through the USB port, physically destroying the computer\'s hardware.' },
      { question: 'What should you do with an unattended laptop in a public place?', options: ['Leave the screen unlocked', 'Lock it (Win+L) or take it with you', 'Just close the lid', 'Ask a stranger to watch it'], correctIndex: 1, explanation: 'Always lock your screen (Win+L or Cmd+Control+Q on Mac) when stepping away, even briefly.' },
    ],
  },
  {
    id: 'wifi-risks',
    title: 'Public Wi-Fi Risks',
    description: 'Discover how attackers exploit public Wi-Fi networks to intercept your data through man-in-the-middle attacks.',
    difficulty: 'Beginner',
    duration: '7 min',
    category: 'Network Security',
    color: '#10B981',
    icon: '📶',
    attackFlow: [
      { icon: '📡', title: 'Evil Twin AP', description: 'Attacker creates a fake Wi-Fi hotspot with a trusted name like "Starbucks_Free_WiFi"' },
      { icon: '📱', title: 'Device Connects', description: 'Your device automatically connects to the strongest signal with a familiar name' },
      { icon: '👁️', title: 'Traffic Interception', description: 'All your internet traffic now flows through the attacker\'s device (Man-in-the-Middle)' },
      { icon: '🔍', title: 'Data Captured', description: 'Login credentials, emails, banking info — anything sent over HTTP is visible in plain text' },
      { icon: '💳', title: 'Identity Theft', description: 'Attacker harvests credentials and personal information for financial fraud' },
    ],
    explanation: 'Public Wi-Fi is inherently insecure. Man-in-the-Middle (MITM) attacks allow hackers to intercept data between your device and the internet. Evil twin attacks create fake hotspots. Always use a VPN on public networks and verify you\'re connecting to legitimate access points.',
    simulation: {
      scenario: 'You\'re at a coffee shop and need to check your work email. You see these Wi-Fi networks:',
      context: '1. "CoffeeShop_Guest" (no password)\n2. "CoffeeShop_Free_WiFi" (no password)\n3. Your phone\'s mobile hotspot (password protected)',
      choices: [
        { text: 'Connect to "CoffeeShop_Guest" — it\'s the shop\'s Wi-Fi', correct: false, feedback: '❌ Open Wi-Fi networks can be intercepted. Without a VPN, your data is exposed to anyone on the network.' },
        { text: 'Use your phone\'s mobile hotspot with VPN', correct: true, feedback: '✅ Your own hotspot + VPN is the safest option. You control the network and VPN encrypts all traffic.' },
        { text: 'Connect to whichever has the strongest signal', correct: false, feedback: '❌ Attackers boost their evil twin signal to be the strongest. Signal strength doesn\'t indicate legitimacy.' },
        { text: 'Ask staff which is the real network, then use VPN', correct: true, feedback: '✅ Verifying the network name with staff and using a VPN is a solid approach for public Wi-Fi.' },
      ],
    },
    quiz: [
      { question: 'What is an "Evil Twin" attack?', options: ['A duplicate phishing email', 'A fake Wi-Fi access point mimicking a legitimate one', 'Two malware infections', 'A cloned credit card'], correctIndex: 1, explanation: 'An evil twin is a rogue Wi-Fi access point that impersonates a legitimate network to intercept user traffic.' },
      { question: 'What technology encrypts your internet traffic on public Wi-Fi?', options: ['Firewall', 'Antivirus', 'VPN (Virtual Private Network)', 'Ad blocker'], correctIndex: 2, explanation: 'A VPN encrypts all traffic between your device and the VPN server, making it unreadable to MITM attackers.' },
      { question: 'Which activity is MOST dangerous on unsecured public Wi-Fi?', options: ['Reading news articles', 'Logging into your bank account', 'Checking the weather', 'Browsing Wikipedia'], correctIndex: 1, explanation: 'Banking involves sensitive credentials and financial data. Without encryption, this can be intercepted.' },
    ],
  },
  {
    id: 'email-bec',
    title: 'Email Scams & BEC',
    description: 'Identify business email compromise (BEC) schemes and common email fraud patterns that cost billions.',
    difficulty: 'Intermediate',
    duration: '9 min',
    category: 'Phishing',
    color: '#F43F5E',
    icon: '📨',
    attackFlow: [
      { icon: '🔓', title: 'Email Compromise', description: 'Attacker gains access to a real business email account or creates a convincing lookalike domain' },
      { icon: '📧', title: 'Monitor Communications', description: 'Reads email threads to understand business relationships, payment patterns, and communication style' },
      { icon: '📝', title: 'Insert Fake Invoice', description: 'At the right moment, sends a fake invoice or payment redirect from the compromised/spoofed account' },
      { icon: '🏦', title: 'Redirect Payment', description: '"Our bank details have changed, please use these new account details for all future payments"' },
      { icon: '💸', title: 'Funds Stolen', description: 'Payments go to attacker-controlled accounts. BEC losses: $2.7 billion/year (FBI)' },
    ],
    explanation: 'Business Email Compromise (BEC) is one of the most financially devastating cybercrimes. Attackers compromise or spoof email accounts to redirect payments, request wire transfers, or steal sensitive data. BEC cost businesses $2.7 billion in 2023 according to the FBI.',
    simulation: {
      scenario: 'You receive an email from a long-time vendor:',
      emailFrom: 'accounts@vendor-company.com',
      emailSubject: 'Updated Banking Details — Please Update Records',
      emailBody: 'Dear Accounts Payable,\n\nPlease be advised that our company has changed banks. Going forward, all payments should be directed to our new account:\n\nBank: International Trust Bank\nAccount: 4421-8834-2215\nRouting: 0887-2341\n\nPlease update your records and use these details for the outstanding invoice #2847 ($34,500).\n\nThank you for your continued partnership.\n\nBest regards,\nSarah Mitchell\nAccounts - Vendor Company',
      context: 'This vendor has been your partner for 3 years. The email looks legitimate.',
      choices: [
        { text: 'Update the bank details and process payment', correct: false, feedback: '❌ This is a classic BEC attack! Always verify bank detail changes through a separate, known communication channel.' },
        { text: 'Call the vendor using the phone number from your records (not the email)', correct: true, feedback: '✅ Perfect! Always verify financial changes through a known, separate channel. The phone number on file, not in the email.' },
        { text: 'Reply asking them to confirm', correct: false, feedback: '❌ If the email account is compromised, the attacker will confirm. Always verify through a different channel.' },
        { text: 'Forward to your finance manager for review', correct: true, feedback: '✅ Good practice! Any request to change bank details should go through proper verification channels.' },
      ],
    },
    quiz: [
      { question: 'How much did BEC scams cost globally in 2023?', options: ['$500 million', '$1 billion', '$2.7 billion', '$500,000'], correctIndex: 2, explanation: 'The FBI reported BEC losses of $2.7 billion in 2023, making it one of the most costly cybercrimes.' },
      { question: 'A vendor emails asking to change their bank details. What should you do?', options: ['Update immediately', 'Call them using a known phone number to verify', 'Reply to confirm', 'Forward to accounting without checking'], correctIndex: 1, explanation: 'Always verify bank detail changes through a separate, known communication channel — never trust the email alone.' },
    ],
  },
  {
    id: 'data-leakage',
    title: 'Data Leakage Prevention',
    description: 'Learn to classify, handle, and protect sensitive information from accidental or intentional exposure.',
    difficulty: 'Intermediate',
    duration: '8 min',
    category: 'Data Security',
    color: '#6366F1',
    icon: '🗂️',
    attackFlow: [
      { icon: '📤', title: 'Data Shared Carelessly', description: 'Employee sends sensitive data via personal email, uploads to unauthorized cloud, or prints without shredding' },
      { icon: '🌐', title: 'Exposed Publicly', description: 'Misconfigured cloud storage, accidental "Reply All", or posting on wrong Slack channel' },
      { icon: '🔍', title: 'Discovered by Attacker', description: 'Automated scanners find exposed databases, documents indexed by search engines' },
      { icon: '📊', title: 'Data Harvested', description: 'Customer data, financial records, intellectual property collected and sold' },
      { icon: '⚖️', title: 'Regulatory Fines', description: 'GDPR fines up to €20M or 4% of global revenue. Reputational damage is even worse.' },
    ],
    explanation: 'Data leakage is the unauthorized transfer of information outside an organization. It can be accidental (misconfigured S3 bucket, wrong email recipient) or intentional (insider threat). Classify data properly: Public, Internal, Confidential, Restricted. Handle each level appropriately.',
    simulation: {
      scenario: 'You need to share a spreadsheet containing employee personal data with an external auditor:',
      context: 'The spreadsheet has names, social security numbers, salaries, and addresses.',
      choices: [
        { text: 'Email it as a regular attachment', correct: false, feedback: '❌ Email is not encrypted by default. Sensitive PII should never be sent as a plain attachment.' },
        { text: 'Upload to a password-protected, encrypted file-sharing platform approved by IT', correct: true, feedback: '✅ Use company-approved, encrypted file sharing with access controls and audit logs.' },
        { text: 'Share via personal Google Drive link', correct: false, feedback: '❌ Personal cloud storage is not approved for company data. It lacks proper security controls and audit trails.' },
        { text: 'Print it and mail it physically', correct: false, feedback: '❌ Physical copies of sensitive data can be lost, stolen, or improperly disposed of.' },
      ],
    },
    quiz: [
      { question: 'What is the maximum GDPR fine for data breaches?', options: ['€1 million', '€10 million', '€20 million or 4% of global revenue', '€100,000'], correctIndex: 2, explanation: 'GDPR allows fines up to €20 million or 4% of annual worldwide turnover, whichever is higher.' },
      { question: 'Which data classification level requires the highest protection?', options: ['Public', 'Internal', 'Confidential', 'Restricted'], correctIndex: 3, explanation: 'Restricted data (e.g., encryption keys, medical records) requires the strictest access controls and handling.' },
    ],
  },
  {
    id: 'insider-threats',
    title: 'Insider Threats',
    description: 'Recognize warning signs of insider threats from employees, contractors, or partners with legitimate access.',
    difficulty: 'Intermediate',
    duration: '8 min',
    category: 'Human Factors',
    color: '#EC4899',
    icon: '🕵️',
    attackFlow: [
      { icon: '👤', title: 'Trusted Insider', description: 'An employee, contractor, or partner with legitimate access to systems and data' },
      { icon: '😤', title: 'Motivation', description: 'Financial pressure, disgruntlement, ideology, or recruitment by external actors' },
      { icon: '📁', title: 'Data Gathering', description: 'Insider accesses data beyond their role, downloads files, copies to personal devices' },
      { icon: '📤', title: 'Exfiltration', description: 'Data sent to personal email, USB drive, cloud storage, or directly to competitors/adversaries' },
      { icon: '🚨', title: 'Damage Done', description: 'IP stolen, customer data leaked, sabotage to systems — detection often takes months' },
    ],
    explanation: 'Insider threats are among the hardest to detect because the person has legitimate access. They can be malicious (intentional data theft) or negligent (accidental exposure). Warning signs include unusual access patterns, working odd hours, copying large amounts of data, and expressing dissatisfaction.',
    simulation: {
      scenario: 'You notice a colleague exhibiting the following behaviors:',
      context: '• Accessing files outside their department after hours\n• Recently passed over for promotion and expressed frustration\n• Copied large amounts of customer data to a USB drive\n• Asked you for your login credentials "because theirs aren\'t working"',
      choices: [
        { text: 'Share your credentials — they\'re a trusted colleague', correct: false, feedback: '❌ Never share credentials, regardless of who asks. This violates security policy and enables unauthorized access.' },
        { text: 'Report the concerning behavior to your manager or security team', correct: true, feedback: '✅ These are classic insider threat indicators. Reporting protects both the company and potentially the colleague.' },
        { text: 'Confront them directly about their behavior', correct: false, feedback: '❌ Direct confrontation could tip off a malicious insider, leading to accelerated data theft or evidence destruction.' },
        { text: 'Ignore it — they\'re probably just working extra hard', correct: false, feedback: '❌ Multiple red flags together warrant reporting. "See something, say something" is critical for insider threat prevention.' },
      ],
    },
    quiz: [
      { question: 'Which is NOT a typical insider threat indicator?', options: ['Accessing data outside their role', 'Working during normal business hours', 'Copying large amounts of data to USB', 'Expressing strong dissatisfaction'], correctIndex: 1, explanation: 'Working normal hours is expected behavior. The other options are all classic insider threat warning signs.' },
      { question: 'Insider threats can be:', options: ['Only malicious', 'Only negligent', 'Both malicious and negligent', 'Neither — insiders are always trusted'], correctIndex: 2, explanation: 'Insider threats can be intentional (malicious theft) or unintentional (negligent mistakes like sending data to the wrong person).' },
    ],
  },
  {
    id: 'device-security',
    title: 'Device & Endpoint Security',
    description: 'Protect your work devices — laptops, phones, tablets — from theft, unauthorized access, and compromise.',
    difficulty: 'Beginner',
    duration: '6 min',
    category: 'Physical Security',
    color: '#14B8A6',
    icon: '💻',
    attackFlow: [
      { icon: '📱', title: 'Device Left Unattended', description: 'Laptop left unlocked at a coffee shop, phone left on a restaurant table' },
      { icon: '👁️', title: 'Shoulder Surfing', description: 'Attacker watches you type passwords, PINs, or reads sensitive content on your screen' },
      { icon: '🔓', title: 'Access Gained', description: 'Thief takes the device or someone accesses the unlocked device' },
      { icon: '💾', title: 'Data Extracted', description: 'Without disk encryption, all files are accessible even without the password' },
      { icon: '🏢', title: 'Corporate Breach', description: 'VPN tokens, saved passwords, and emails give access to the entire corporate network' },
    ],
    explanation: 'Endpoint security protects the devices that connect to your corporate network. Key practices: enable full-disk encryption (BitLocker/FileVault), use strong PIN/biometrics, lock your screen when away (Win+L), keep software updated, and never leave devices unattended.',
    simulation: {
      scenario: 'You\'re working from a café and need to use the restroom. Your laptop has your email and VPN open:',
      context: 'You\'ll only be gone for 2 minutes.',
      choices: [
        { text: 'Leave it open — you\'ll be right back', correct: false, feedback: '❌ 2 minutes is enough for someone to install malware, copy files, or steal the device. Always lock it.' },
        { text: 'Lock the screen (Win+L) and take your phone', correct: true, feedback: '✅ Always lock your screen, even for brief moments. It takes less than 30 seconds to compromise an unlocked device.' },
        { text: 'Ask a stranger to watch it', correct: false, feedback: '❌ Never trust strangers with your work device. They could be the attacker waiting for this opportunity.' },
        { text: 'Take the laptop with you', correct: true, feedback: '✅ Taking the device with you is the most secure option. You can\'t compromise what isn\'t there.' },
      ],
    },
    quiz: [
      { question: 'What keyboard shortcut locks your Windows screen?', options: ['Ctrl + L', 'Alt + F4', 'Win + L', 'Ctrl + Alt + Delete'], correctIndex: 2, explanation: 'Windows + L instantly locks your screen. Make it a habit every time you step away from your computer.' },
      { question: 'What technology ensures data is unreadable if a laptop is stolen?', options: ['Firewall', 'Antivirus', 'Full-disk encryption (BitLocker/FileVault)', 'Screen protector'], correctIndex: 2, explanation: 'Full-disk encryption ensures all data on the drive is unreadable without the encryption key, even if physically removed.' },
    ],
  },
  {
    id: 'safe-browsing',
    title: 'Safe Browsing & Downloads',
    description: 'Navigate the internet safely — identify malicious websites, avoid drive-by downloads, and browse securely.',
    difficulty: 'Beginner',
    duration: '7 min',
    category: 'Network Security',
    color: '#0EA5E9',
    icon: '🌐',
    attackFlow: [
      { icon: '🔍', title: 'Search / Click Ad', description: 'User searches for free software or clicks a malicious advertisement (malvertising)' },
      { icon: '🌐', title: 'Malicious Website', description: 'Redirected to a fake website that looks like a legitimate download page' },
      { icon: '⬇️', title: 'Drive-by Download', description: 'Malware downloads automatically, or user downloads a trojanized version of the software' },
      { icon: '⚙️', title: 'Silent Installation', description: 'Malware installs alongside the "free" software or through browser vulnerability' },
      { icon: '🔑', title: 'System Compromised', description: 'Keylogger captures passwords, cryptominer uses your CPU, or backdoor enables remote access' },
    ],
    explanation: 'Safe browsing means verifying URLs before clicking, only downloading from official sources, keeping your browser updated, using ad blockers, and checking for HTTPS. Drive-by downloads can infect your system just by visiting a compromised website.',
    simulation: {
      scenario: 'You need to download a PDF reader for work. You search online and see these results:',
      context: 'Your company hasn\'t specified an approved software list.',
      choices: [
        { text: 'Click the first Google ad: "Free PDF Reader — Download Now!" from pdf-reader-free.xyz', correct: false, feedback: '❌ Malicious ads (malvertising) are common. Unknown domains with generic names are often malware distribution sites.' },
        { text: 'Go directly to adobe.com or the official vendor website', correct: true, feedback: '✅ Always download software directly from the official vendor website. Type the URL manually or use a bookmarked link.' },
        { text: 'Download from a file-sharing site like a torrent', correct: false, feedback: '❌ Torrent and file-sharing sites frequently host trojanized software bundled with malware.' },
        { text: 'Ask IT to install approved software through the company portal', correct: true, feedback: '✅ Best practice! IT-approved software ensures it\'s vetted, licensed, and free from malware.' },
      ],
    },
    quiz: [
      { question: 'What does HTTPS in a URL indicate?', options: ['The site is completely safe', 'The connection is encrypted', 'The site is government-approved', 'The site has no viruses'], correctIndex: 1, explanation: 'HTTPS means the connection is encrypted, but it doesn\'t guarantee the site is legitimate. Phishing sites also use HTTPS.' },
      { question: 'What is a "drive-by download"?', options: ['Downloading while driving', 'Malware that downloads without user interaction', 'A fast download speed', 'Downloading from a USB drive'], correctIndex: 1, explanation: 'Drive-by downloads install malware simply by visiting a compromised or malicious website, with no user clicks required.' },
    ],
  },
  {
    id: 'two-factor-auth',
    title: 'Two-Factor Authentication (2FA)',
    description: 'Add a powerful second layer of defense to every account using authenticator apps, hardware keys, and SMS codes.',
    difficulty: 'Beginner',
    duration: '5 min',
    category: 'Access Control',
    color: '#3B82F6',
    icon: '🔑',
    attackFlow: [
      { icon: '💻', title: 'Password Stolen',     description: 'Attacker obtains your password via phishing, data breach, or brute force attack' },
      { icon: '🔓', title: 'Login Attempted',     description: 'Attacker enters your password on the login page — authentication succeeds' },
      { icon: '📱', title: '2FA Code Requested',  description: 'The system requests a second factor — the time-based code from your authenticator app' },
      { icon: '🚫', title: 'Attack Blocked',      description: 'Without your physical device, the attacker cannot generate the correct OTP code' },
      { icon: '🛡️', title: 'Account Protected',   description: 'Your account remains secure even though your password was fully compromised' },
    ],
    explanation: 'Two-Factor Authentication adds a second verification step beyond your password. Even if attackers steal your password, they cannot access your account without the second factor. Use authenticator apps (Google Authenticator, Authy) rather than SMS when possible — SIM-swapping attacks can hijack SMS codes.',
    simulation: {
      scenario: 'You receive a 2FA code text message you never requested:',
      context: 'An SMS reads: "Your login code is 847291. If you didn\'t request this, call +1-888-555-0199 immediately."',
      choices: [
        { text: 'Enter the code — maybe your session auto-expired', correct: false, feedback: '❌ If you didn\'t initiate a login, someone else is using your password. The code proves it. Change your password immediately!' },
        { text: 'Call the number in the SMS to investigate', correct: false, feedback: '❌ That number could belong to the attacker. Never call back numbers from unsolicited security messages.' },
        { text: 'Ignore the code and change your password right away', correct: true, feedback: '✅ An unsolicited 2FA code means your password is compromised. Change it immediately and enable stronger 2FA if possible.' },
        { text: 'Share the code with anyone who calls asking for it', correct: false, feedback: '❌ "Real-time phishing" — attackers call you posing as your bank or IT team asking to relay the code. Never share OTP codes.' },
      ],
    },
    quiz: [
      { question: 'Why is an authenticator app more secure than SMS 2FA?', options: ['It looks nicer', 'SMS can be hijacked via SIM-swapping attacks', 'Apps are always free', 'SMS requires internet'], correctIndex: 1, explanation: 'SIM-swapping transfers your phone number to the attacker, allowing them to receive your SMS verification codes.' },
      { question: 'You receive an unexpected 2FA code. What does this likely mean?', options: ['Auto-renewal', 'Someone has your password and is attempting to log in', 'A glitch', 'Your session expired'], correctIndex: 1, explanation: 'Unsolicited 2FA codes mean someone has your password and is attempting a login. Change it immediately.' },
      { question: 'Which 2FA method is strongest?', options: ['SMS text', 'Email code', 'TOTP authenticator app or hardware key', 'Security questions'], correctIndex: 2, explanation: 'TOTP apps and hardware keys (YubiKey) generate codes that cannot be intercepted in transit or SIM-swapped.' },
    ],
  },
  {
    id: 'cloud-security',
    title: 'Cloud Security & Misconfigurations',
    description: 'Discover how exposed S3 buckets, weak IAM policies, and cloud misconfigurations have leaked billions of records.',
    difficulty: 'Intermediate',
    duration: '9 min',
    category: 'Data Security',
    color: '#0EA5E9',
    icon: '☁️',
    attackFlow: [
      { icon: '⚙️', title: 'Misconfiguration',   description: 'Developer accidentally marks an AWS S3 bucket as public or leaves an API without authentication' },
      { icon: '🔍', title: 'Automated Scanning',  description: 'Attackers run automated tools scanning millions of cloud endpoints for misconfigurations daily' },
      { icon: '📂', title: 'Data Discovered',     description: 'Customer databases, backups, source code, or API keys are found in the exposed storage' },
      { icon: '⬇️', title: 'Mass Download',       description: 'Attacker downloads terabytes of sensitive data silently without any alerts triggered' },
      { icon: '📰', title: 'Breach Disclosed',    description: 'Company faces GDPR fines up to €20M, mandatory customer notifications, and reputational damage' },
    ],
    explanation: 'Cloud misconfigurations are the #1 cause of cloud data breaches. Common mistakes include public S3 buckets, overly permissive IAM roles, exposed databases, unchanged default credentials, and accidental public storage access. Always apply the principle of least privilege and enable cloud security posture management tools.',
    simulation: {
      scenario: 'You need to share one file from your S3 bucket with an external auditor:',
      context: 'The bucket contains the file they need PLUS thousands of customer records in subfolders.',
      choices: [
        { text: 'Set the entire bucket to public so they can download it', correct: false, feedback: '❌ Making the bucket public exposes everything — including all customer data — to the entire internet permanently.' },
        { text: 'Generate a pre-signed URL for just that file with a 24-hour expiry', correct: true, feedback: '✅ Pre-signed URLs grant temporary, scoped access to a single file. They expire automatically and leave everything else private.' },
        { text: 'Create a permanent public URL for just the one file', correct: false, feedback: '❌ Permanent public URLs never expire and can spread. Use time-limited pre-signed URLs instead.' },
        { text: 'Email them your AWS access keys to download the file themselves', correct: false, feedback: '❌ Never share cloud access keys. They grant broad access and are extremely difficult to contain once leaked.' },
      ],
    },
    quiz: [
      { question: 'What caused the Capital One breach exposing 100M+ records?', options: ['Phishing', 'Misconfigured AWS WAF + SSRF vulnerability exposing S3', 'Stolen USB', 'Brute force'], correctIndex: 1, explanation: 'A misconfigured Web Application Firewall combined with a Server-Side Request Forgery flaw exposed AWS metadata and S3 data.' },
      { question: 'What is the "principle of least privilege"?', options: ['Use the cheapest tier', 'Grant only the minimum permissions necessary for a task', 'Limit number of cloud users', 'Store only non-sensitive data'], correctIndex: 1, explanation: 'Every user, service, and app should have only the minimal access needed. Excess permissions massively expand your attack surface.' },
      { question: 'How should you securely share a cloud file externally?', options: ['Make the bucket public temporarily', 'Use a pre-signed URL with an expiration', 'Email your access keys', 'Create a new account for them'], correctIndex: 1, explanation: 'Pre-signed URLs provide time-limited, single-file access without exposing any credentials or other resources.' },
    ],
  },
  {
    id: 'incident-response',
    title: 'Security Incident Response',
    description: 'Know exactly what to do when a security incident occurs — from first detection through containment, reporting, and recovery.',
    difficulty: 'Beginner',
    duration: '7 min',
    category: 'Human Factors',
    color: '#EF4444',
    icon: '🚨',
    attackFlow: [
      { icon: '🔍', title: 'Detection',           description: 'You notice something unusual: strange pop-ups, slow performance, unknown login, or unexpected alerts' },
      { icon: '📢', title: 'Report Immediately',  description: 'Contact IT security right away — do NOT try to fix it yourself or hide it to avoid embarrassment' },
      { icon: '🔒', title: 'Containment',         description: 'IT isolates the affected system from the network to stop the incident spreading further' },
      { icon: '🔬', title: 'Investigation',       description: 'Security team forensically analyzes what happened, what was accessed, and the attacker\'s entry point' },
      { icon: '🔄', title: 'Recovery & Lessons',  description: 'Systems restored from clean backups, vulnerabilities patched, incident documented to prevent recurrence' },
    ],
    explanation: 'Security incidents include malware infections, suspected breaches, lost/stolen devices, accidental phishing clicks, and unauthorized access. The most critical action is immediate reporting — every minute of delay allows attackers more time. Never attempt to fix incidents yourself, as this destroys forensic evidence needed for investigation.',
    simulation: {
      scenario: 'You arrive at work and your computer shows this message:',
      context: '"YOUR FILES HAVE BEEN ENCRYPTED. Send 0.5 BTC to wallet 1A2B3C... within 72 hours or lose everything permanently." Your desktop wallpaper is a red ransom note.',
      choices: [
        { text: 'Search online for a free decryption tool to fix it yourself', correct: false, feedback: '❌ Your first action must be containment. Disconnect from the network immediately — ransomware spreads to shared drives and other computers.' },
        { text: 'Disconnect from the network immediately and call IT security', correct: true, feedback: '✅ Exactly right! Unplug the network cable or disable Wi-Fi first to contain the spread, then immediately report to IT security.' },
        { text: 'Pay the ransom to recover your files quickly', correct: false, feedback: '❌ Only 65% of victims who pay ever get files back. Payment funds more attacks. Always report to IT and law enforcement first.' },
        { text: 'Restart the computer to try clearing it', correct: false, feedback: '❌ Restarting may destroy forensic evidence and trigger additional encryption stages. Disconnect from network first, then call IT.' },
      ],
    },
    quiz: [
      { question: 'What should you do FIRST when you suspect a security incident?', options: ['Fix it yourself', 'Ignore it', 'Report to IT security immediately', 'Tell colleagues casually'], correctIndex: 2, explanation: 'Immediate reporting is critical. Every minute of delay allows more damage. IT security has the tools and authority to respond properly.' },
      { question: 'Why should you NOT fix a suspected malware infection yourself?', options: ['Takes too long', 'You may destroy forensic evidence and spread the infection', 'IT will charge you', 'Your computer isn\'t fast enough'], correctIndex: 1, explanation: 'DIY responses can destroy log files and artifacts needed to understand the attack scope, trace the attacker, and prevent future incidents.' },
      { question: 'What is the FIRST physical action for a ransomware-infected computer?', options: ['Shut it down', 'Pay the ransom', 'Disconnect it from the network', 'Take a screenshot'], correctIndex: 2, explanation: 'Isolating the machine from the network (cable or Wi-Fi) prevents ransomware spreading to shared drives and other connected systems.' },
    ],
  },
  {
    id: 'ai-deepfakes',
    title: 'AI-Powered Attacks & Deepfakes',
    description: 'Recognize AI-generated phishing, real-time voice cloning, and deepfake video fraud — the new wave of social engineering.',
    difficulty: 'Intermediate',
    duration: '8 min',
    category: 'Social Engineering',
    color: '#A855F7',
    icon: '🤖',
    attackFlow: [
      { icon: '🎤', title: 'Voice Harvesting',    description: 'Attacker collects 3 seconds of audio from your CEO\'s LinkedIn video, podcast, or conference talk' },
      { icon: '🧠', title: 'AI Cloning',          description: 'An AI voice-cloning model creates a perfect replica indistinguishable from the real person' },
      { icon: '📞', title: 'Fraudulent Call',     description: 'Finance team receives a call in the CEO\'s exact voice demanding an urgent wire transfer' },
      { icon: '🎭', title: 'Deepfake Video',      description: 'A real-time deepfake of the CEO\'s face confirms the request on a Teams/Zoom video call' },
      { icon: '💸', title: 'Funds Stolen',        description: 'Convinced by the hyper-realistic voice and video, employee authorizes and processes the transfer' },
    ],
    explanation: 'AI has dramatically amplified social engineering. Voice cloning tools can replicate any voice from just 3 seconds of audio — available freely on social media. Real-time deepfake video is increasingly accessible. AI also writes flawless, perfectly personalized phishing emails with no spelling errors. Countermeasures: pre-agreed code words for financial approvals, multi-channel verification, and healthy skepticism.',
    simulation: {
      scenario: 'You receive a WhatsApp voice message from what sounds exactly like your Director:',
      context: '"Hi, it\'s [Director name]. I\'m in a confidential board meeting. I need you to process a €30,000 payment to a new supplier RIGHT NOW — it\'s time-sensitive. I\'ll send bank details by email. Don\'t call my office line while I\'m in this meeting. Thanks."',
      choices: [
        { text: 'Process it — you clearly recognize their voice and it sounds urgent', correct: false, feedback: '❌ Voice cloning is now trivially available. The combination of urgency + "don\'t call me back" is a classic social engineering red flag. Always verify through a second channel.' },
        { text: 'Call their known office or mobile number (from your contacts) to verify', correct: true, feedback: '✅ Always verify unusual financial requests via a separate channel you initiate yourself. The "don\'t call me" instruction is designed to prevent exactly this.' },
        { text: 'Wait for the email details, then process the payment', correct: false, feedback: '❌ The follow-up email could also be spoofed or compromised. You must verify the requester\'s identity through an independent channel.' },
        { text: 'Ask them for the pre-agreed company code word before proceeding', correct: true, feedback: '✅ Excellent! Pre-arranged code words for financial authorizations are a proven countermeasure against AI voice fraud and CEO impersonation.' },
      ],
    },
    quiz: [
      { question: 'How much audio can modern AI use to convincingly clone a voice?', options: ['30 minutes', '5 minutes', 'As little as 3 seconds', 'Audio cloning isn\'t yet possible'], correctIndex: 2, explanation: 'Modern AI voice cloning tools replicate a person\'s voice from 3–10 seconds of audio — easily harvested from YouTube, podcasts, or social media.' },
      { question: 'What is the best defense against AI voice fraud for financial requests?', options: ['Better phone audio quality', 'Pre-agreed code words and multi-channel verification', 'Recording all calls', 'Using video instead of audio only'], correctIndex: 1, explanation: 'Pre-agreed authorization codes and requiring multi-channel, independently-initiated verification defeat AI voice fraud entirely.' },
      { question: 'AI-generated phishing emails are especially dangerous because:', options: ['They arrive faster', 'They are flawless, highly personalized, and contain no spelling errors', 'They use bigger fonts', 'They cost more to send'], correctIndex: 1, explanation: 'Traditional phishing detection relied on grammar errors and generic content. AI generates perfect, context-aware emails that bypass these detection signals.' },
    ],
  },
  {
    id: 'gdpr-privacy',
    title: 'GDPR & Data Privacy Basics',
    description: 'Understand GDPR obligations, personal data definitions, lawful processing bases, consent rules, and 72-hour breach notification.',
    difficulty: 'Intermediate',
    duration: '8 min',
    category: 'Data Security',
    color: '#14B8A6',
    icon: '⚖️',
    attackFlow: [
      { icon: '📋', title: 'Data Collected',        description: 'Organization collects personal data without a clear legal basis, adequate consent, or purpose limitation' },
      { icon: '🔓', title: 'Data Breach Occurs',    description: 'Poorly secured database is accessed — names, emails, health data, national IDs exposed' },
      { icon: '⏰', title: 'Delayed Notification',  description: 'Company waits weeks to report the breach rather than within the mandatory 72 hours' },
      { icon: '🔍', title: 'Regulatory Audit',      description: 'The Data Protection Authority launches a formal investigation into the breach and response' },
      { icon: '💸', title: 'Maximum Fine Issued',   description: 'Fine of €20M or 4% of global annual revenue (whichever is higher) plus mandatory remediation' },
    ],
    explanation: 'GDPR gives EU citizens control over their personal data. Personal data includes names, emails, IP addresses, location, biometrics, and anything identifying a natural person. Key principles: data minimization (collect only what you need), purpose limitation (only use it for stated purposes), consent (freely given, informed, and revocable), and 72-hour breach notification.',
    simulation: {
      scenario: 'A colleague asks you to export all customer email addresses and phone numbers for a new marketing campaign:',
      context: 'These customers originally signed up only for product update notifications. This campaign is for an entirely new, unrelated product line.',
      choices: [
        { text: 'Export the list — they\'re existing customers so it\'s fine', correct: false, feedback: '❌ This likely violates GDPR. Customers consented to product updates, not unrelated marketing. Purpose limitation is a core GDPR principle.' },
        { text: 'Check consent records — only include those who opted into marketing communications', correct: true, feedback: '✅ GDPR requires purpose limitation. You can only use personal data for the purposes customers originally consented to.' },
        { text: 'Ask customers to re-consent by sending them the marketing email directly', correct: false, feedback: '⚠️ You still need a lawful basis to send that initial re-consent email. Verify existing permissions with your DPO first.' },
        { text: 'Refuse entirely since any use of customer data violates GDPR', correct: false, feedback: '⚠️ Not accurate — GDPR allows legitimate uses. The issue is using data beyond its original consented purpose, not using it at all.' },
      ],
    },
    quiz: [
      { question: 'Under GDPR Article 33, how many hours do you have to report a breach to authorities?', options: ['24 hours', '48 hours', '72 hours', '1 week'], correctIndex: 2, explanation: 'GDPR requires notification to the supervisory authority within 72 hours of becoming aware of a personal data breach, where feasible.' },
      { question: 'Which of these is NOT personal data under GDPR?', options: ['Email address', 'IP address', 'A limited company\'s trading name (no individual named)', 'A person\'s photo'], correctIndex: 2, explanation: 'GDPR protects data about natural persons. A company\'s trading name without identifying individuals is not personal data.' },
      { question: 'What does "data minimization" require under GDPR?', options: ['Deleting all old emails', 'Collecting only data adequate and necessary for the specified purpose', 'Using smaller file sizes', 'Limiting database storage'], correctIndex: 1, explanation: 'Data minimization means collecting only what is strictly necessary. Collecting surplus data creates liability with no benefit.' },
    ],
  },
  {
    id: 'zero-trust',
    title: 'Zero Trust Security',
    description: 'Master the "never trust, always verify" framework that assumes breach and continuously validates every single access request.',
    difficulty: 'Advanced',
    duration: '10 min',
    category: 'Network Security',
    color: '#7C3AED',
    icon: '🛡️',
    attackFlow: [
      { icon: '🏰', title: 'Old Perimeter Model',   description: 'Traditional model: everything inside the network is trusted. VPN = full internal access to all systems' },
      { icon: '🔓', title: 'Single Compromise',     description: 'Attacker phishes one employee\'s VPN credentials — now they\'re "inside" with broad trust' },
      { icon: '🦠', title: 'Lateral Movement',      description: 'Attacker moves freely through the internal network, accessing servers, databases, and admin panels' },
      { icon: '🛡️', title: 'Zero Trust Applied',    description: 'Every request requires fresh verification regardless of network location. Inside ≠ trusted.' },
      { icon: '🚫', title: 'Breach Contained',      description: 'Even with one compromised account, lateral movement is blocked by per-resource, continuous verification' },
    ],
    explanation: 'Zero Trust eliminates implicit trust based on network location. Core principles: Verify Explicitly (authenticate every request with multiple factors), Use Least Privilege (minimal permissions for every identity), Assume Breach (design systems as if attackers are already inside). Zero Trust is essential for cloud environments, remote work, and protecting against insider threats.',
    simulation: {
      scenario: 'You\'re reviewing an access request in IT security:',
      context: 'A user is connected via corporate VPN. They are requesting access to the payroll database. Their credentials are valid. However, they are connecting from an unmanaged personal laptop from an unusual geographic location.',
      choices: [
        { text: 'Grant access — valid credentials + VPN = sufficient trust', correct: false, feedback: '❌ Zero Trust explicitly rejects VPN-as-trust. Unmanaged devices may be compromised. Network location is never sufficient evidence of identity.' },
        { text: 'Deny access and require a managed, compliance-checked device for payroll', correct: true, feedback: '✅ Zero Trust requires device health attestation alongside identity verification. Unmanaged personal devices must never access sensitive systems.' },
        { text: 'Ask the user to confirm by email, then grant access', correct: false, feedback: '❌ Email confirmation doesn\'t verify device health, location risk, or comply with continuous verification requirements.' },
        { text: 'Grant read-only access as a compromise', correct: false, feedback: '❌ Zero Trust doesn\'t grant access based on "reduced scope" to an unverified device. The data exposure risk is identical regardless of read vs. write.' },
      ],
    },
    quiz: [
      { question: 'What is the core principle of Zero Trust?', options: ['Trust but verify', 'Never trust, always verify', 'Trust all internal users', 'VPN equals security'], correctIndex: 1, explanation: '"Never trust, always verify" — Zero Trust assumes threats exist both inside and outside the network and validates every access request.' },
      { question: 'In Zero Trust, access decisions are based on:', options: ['Network location only', 'Username and password only', 'Multiple factors: identity, device health, behavior, and context', 'VPN connection status'], correctIndex: 2, explanation: 'Zero Trust evaluates multiple continuous signals: user identity, device compliance, location, time, behavior patterns, and resource sensitivity.' },
      { question: 'Why is Zero Trust critical for remote and hybrid work?', options: ['Remote workers need fewer permissions', 'The traditional network perimeter no longer exists — users work from anywhere on any device', 'VPN is sufficient for remote work security', 'Remote workers always use managed devices'], correctIndex: 1, explanation: 'Remote work dissolved the castle-and-moat perimeter. Zero Trust provides security that works regardless of where users connect from or what device they use.' },
    ],
  },
];

// --- Progress tracking mock data ---
export interface UserCourseProgress {
  courseId: string;
  completed: boolean;
  score: number | null;
  completedAt: string | null;
  lastAccessed: string;
}

export interface EmployeeProgress {
  id: string;
  name: string;
  department: string;
  coursesCompleted: number;
  totalCourses: number;
  avgScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastActivity: string;
  phishingTestPassed: boolean;
}

export const mockUserProgress: UserCourseProgress[] = [
  { courseId: 'phishing', completed: true, score: 90, completedAt: '2024-11-15', lastAccessed: '2024-11-15' },
  { courseId: 'spear-phishing', completed: true, score: 75, completedAt: '2024-11-18', lastAccessed: '2024-11-18' },
  { courseId: 'password-security', completed: true, score: 100, completedAt: '2024-11-20', lastAccessed: '2024-11-20' },
  { courseId: 'social-engineering', completed: false, score: null, completedAt: null, lastAccessed: '2024-11-22' },
  { courseId: 'malware-ransomware', completed: true, score: 85, completedAt: '2024-11-25', lastAccessed: '2024-11-25' },
  { courseId: 'usb-physical', completed: false, score: null, completedAt: null, lastAccessed: '2024-11-10' },
  { courseId: 'wifi-risks', completed: true, score: 80, completedAt: '2024-12-01', lastAccessed: '2024-12-01' },
  { courseId: 'email-bec', completed: false, score: null, completedAt: null, lastAccessed: '' },
  { courseId: 'data-leakage', completed: false, score: null, completedAt: null, lastAccessed: '' },
  { courseId: 'insider-threats', completed: false, score: null, completedAt: null, lastAccessed: '' },
  { courseId: 'device-security', completed: false, score: null, completedAt: null, lastAccessed: '' },
  { courseId: 'safe-browsing',      completed: false, score: null, completedAt: null, lastAccessed: '' },
  { courseId: 'two-factor-auth',    completed: false, score: null, completedAt: null, lastAccessed: '' },
  { courseId: 'cloud-security',     completed: false, score: null, completedAt: null, lastAccessed: '' },
  { courseId: 'incident-response',  completed: false, score: null, completedAt: null, lastAccessed: '' },
  { courseId: 'ai-deepfakes',       completed: false, score: null, completedAt: null, lastAccessed: '' },
  { courseId: 'gdpr-privacy',       completed: false, score: null, completedAt: null, lastAccessed: '' },
  { courseId: 'zero-trust',         completed: false, score: null, completedAt: null, lastAccessed: '' },
];

export const mockEmployees: EmployeeProgress[] = [
  { id: '1', name: 'Sarah Johnson', department: 'Engineering', coursesCompleted: 14, totalCourses: 18, avgScore: 88, riskLevel: 'Low',    lastActivity: '2024-12-01', phishingTestPassed: true  },
  { id: '2', name: 'Mike Chen',     department: 'Marketing',   coursesCompleted: 9,  totalCourses: 18, avgScore: 72, riskLevel: 'Medium', lastActivity: '2024-11-28', phishingTestPassed: false },
  { id: '3', name: 'Emily Davis',   department: 'HR',          coursesCompleted: 18, totalCourses: 18, avgScore: 95, riskLevel: 'Low',    lastActivity: '2024-12-02', phishingTestPassed: true  },
  { id: '4', name: 'James Wilson',  department: 'Finance',     coursesCompleted: 5,  totalCourses: 18, avgScore: 58, riskLevel: 'High',   lastActivity: '2024-10-15', phishingTestPassed: false },
  { id: '5', name: 'Lisa Park',     department: 'Engineering', coursesCompleted: 13, totalCourses: 18, avgScore: 82, riskLevel: 'Low',    lastActivity: '2024-11-30', phishingTestPassed: true  },
  { id: '6', name: 'Alex Morgan',   department: 'Sales',       coursesCompleted: 4,  totalCourses: 18, avgScore: 45, riskLevel: 'High',   lastActivity: '2024-09-20', phishingTestPassed: false },
  { id: '7', name: 'Rachel Green',  department: 'Legal',       coursesCompleted: 16, totalCourses: 18, avgScore: 91, riskLevel: 'Low',    lastActivity: '2024-12-01', phishingTestPassed: true  },
  { id: '8', name: 'Tom Baker',     department: 'IT',          coursesCompleted: 8,  totalCourses: 18, avgScore: 67, riskLevel: 'Medium', lastActivity: '2024-11-05', phishingTestPassed: false },
];

export const categories = ['All', 'Phishing', 'Access Control', 'Social Engineering', 'Malware', 'Physical Security', 'Network Security', 'Data Security', 'Human Factors'];
