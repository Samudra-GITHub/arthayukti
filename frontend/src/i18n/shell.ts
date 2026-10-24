// Words for the signed-in shell and the sign-in screens, in English and Hindi. The Hindi is a
// first draft that a native reader should check before it goes in front of people.

export interface ShellCopy {
  tagline: string
  nav: {
    label: string
    dashboard: string
    profile: string
    finances: string
    goals: string
    assets: string
    debts: string
    insurance: string
    taxes: string
    outlook: string
    advisor: string
    import: string
    alerts: string
    settings: string
    outlookItems: {
      household: string
      investment: string
      debt: string
      expenditure: string
      custom: string
      feasibility: string
      scenarios: string
    }
  }
  header: {
    menu: string
    welcome: string
    primary: string
    collapse: string
    expand: string
    scenario: string
    scenarios: { normal: string; no_income: string; expense: string }
    scenarioNote: string
    notifications: string
    noNotifications: string
    account: string
    signOut: string
    settings: string
    saved: string
    unsaved: string
    saving: string
    saveFailed: string
    save: string
    skip: string
  }
  auth: {
    loginTitle: string
    loginSubtitle: string
    email: string
    password: string
    show: string
    hide: string
    signIn: string
    signingIn: string
    forgot: string
    noAccount: string
    createAccount: string
    haveAccount: string
    signInLink: string
    expired: string
    wrong: string
    offline: string
    slow: string
    needEmail: string
    needPassword: string
    signupTitle: string
    signupSubtitle: string
    name: string
    nameHint: string
    passwordRules: string
    confirm: string
    mismatch: string
    tooShort: string
    needsLetterAndDigit: string
    language: string
    consent: string
    consentRequired: string
    create: string
    creating: string
    createFailed: string
    forgotTitle: string
    forgotSubtitle: string
    sendLink: string
    sending: string
    sent: string
    unavailable: string
    backToSignIn: string
    explore: string
    heroTitle: string
    heroBody: string
    heroPoints: string[]
  }
}

export const shellCopy: Record<'en' | 'hi', ShellCopy> = {
  en: {
    tagline: 'Every Goal. One Smarter Plan.',
    nav: {
      label: 'Main menu',
      dashboard: 'Dashboard',
      profile: 'Household profile',
      finances: 'Income & expenses',
      goals: 'Financial goals',
      assets: 'Assets & investments',
      debts: 'Debt & liabilities',
      insurance: 'Insurance',
      taxes: 'Taxes',
      outlook: 'Financial outlook',
      advisor: 'AI advisor',
      import: 'Import & transactions',
      alerts: 'Alerts & events',
      settings: 'Settings',
      outlookItems: {
        household: 'Household trajectory',
        investment: 'Investment trajectory',
        debt: 'Debt trajectory',
        expenditure: 'Expenditure trajectory',
        custom: 'Custom trajectory',
        feasibility: 'Goal feasibility',
        scenarios: 'Scenario comparison',
      },
    },
    header: {
      menu: 'Open menu',
      welcome: 'Welcome back,',
      primary: 'Quick links',
      collapse: 'Collapse the sidebar',
      expand: 'Expand the sidebar',
      scenario: 'Scenario',
      scenarios: { normal: 'Baseline', no_income: 'Income stops for 6 months', expense: 'One-time expense' },
      scenarioNote: 'Other scenarios you create are kept here for this visit only.',
      notifications: 'Notifications',
      noNotifications: 'Nothing is due.',
      account: 'Account',
      signOut: 'Sign out',
      settings: 'Settings',
      saved: 'All changes saved',
      unsaved: 'Unsaved changes',
      saving: 'Saving…',
      saveFailed: 'Could not save. Your changes are still here.',
      save: 'Save changes',
      skip: 'Skip to content',
    },
    auth: {
      loginTitle: 'Welcome back.',
      loginSubtitle: 'Sign in to see where your goals stand.',
      email: 'Email address',
      password: 'Password',
      show: 'Show password',
      hide: 'Hide password',
      signIn: 'Sign in',
      signingIn: 'Signing in…',
      forgot: 'Forgot your password?',
      noAccount: 'New to ArthaYukti?',
      createAccount: 'Create an account',
      haveAccount: 'Already have an account?',
      signInLink: 'Sign in',
      expired: 'Your session ended. Please sign in again.',
      wrong: 'That email and password do not match.',
      offline: 'We could not reach the server. Check your connection and try again.',
      slow: 'Too many attempts. Please wait a few minutes and try again.',
      needEmail: 'Enter a valid email address.',
      needPassword: 'Enter your password.',
      signupTitle: 'Create your account.',
      signupSubtitle: 'Next, we will ask a few questions about your money, one step at a time.',
      name: 'Your name',
      nameHint: 'What should we call you? Optional.',
      passwordRules: 'At least 10 characters, with at least one letter and one number.',
      confirm: 'Type the password again',
      mismatch: 'The two passwords are not the same.',
      tooShort: 'The password needs at least 10 characters.',
      needsLetterAndDigit: 'The password needs at least one letter and one number.',
      language: 'Language',
      consent:
        'I understand ArthaYukti is a planning aid, not financial advice, and that the details I enter will be stored in my account.',
      consentRequired: 'Please confirm this to continue.',
      create: 'Create account',
      creating: 'Creating account…',
      createFailed: 'We could not create an account with these details. Try signing in, or use another address.',
      forgotTitle: 'Reset your password.',
      forgotSubtitle: 'Enter your email address. If an account exists, we will send a link.',
      sendLink: 'Send reset link',
      sending: 'Sending…',
      sent: 'If that address is registered, a reset link has been sent to it.',
      unavailable: 'Password reset by e-mail is not available yet. Please contact whoever runs this service.',
      backToSignIn: 'Back to sign in',
      explore: 'Look around without an account',
      heroTitle: 'See which goal waits, and why.',
      heroBody:
        'ArthaYukti works out, month by month, what your money can cover and which goal slips first when it cannot cover everything.',
      heroPoints: [
        'Every number comes from a calculation you can check.',
        'Try changes safely before you apply them.',
        'You can export or delete your data from Settings at any time.',
      ],
    },
  },
  hi: {
    tagline: 'हर लक्ष्य। एक समझदार योजना।',
    nav: {
      label: 'मुख्य मेन्यू',
      dashboard: 'डैशबोर्ड',
      profile: 'परिवार की जानकारी',
      finances: 'आमदनी और खर्च',
      goals: 'आर्थिक लक्ष्य',
      assets: 'संपत्ति और निवेश',
      debts: 'कर्ज़ और देनदारियाँ',
      insurance: 'बीमा',
      taxes: 'कर',
      outlook: 'आर्थिक अनुमान',
      advisor: 'AI सलाहकार',
      import: 'आयात और लेन-देन',
      alerts: 'सूचनाएँ और घटनाएँ',
      settings: 'सेटिंग',
      outlookItems: {
        household: 'परिवार का रुझान',
        investment: 'निवेश का रुझान',
        debt: 'कर्ज़ का रुझान',
        expenditure: 'खर्च का रुझान',
        custom: 'अपनी पसंद का रुझान',
        feasibility: 'लक्ष्य कितने संभव',
        scenarios: 'परिदृश्यों की तुलना',
      },
    },
    header: {
      menu: 'मेन्यू खोलें',
      welcome: 'वापसी पर स्वागत है,',
      primary: 'जल्दी के लिंक',
      collapse: 'साइडबार छोटा करें',
      expand: 'साइडबार बड़ा करें',
      scenario: 'परिदृश्य',
      scenarios: { normal: 'आधार', no_income: '6 महीने आमदनी बंद', expense: 'एक बार का खर्च' },
      scenarioNote: 'आपके बनाए दूसरे परिदृश्य सिर्फ़ इस बार के लिए यहाँ रहते हैं।',
      notifications: 'सूचनाएँ',
      noNotifications: 'कुछ भी बाकी नहीं है।',
      account: 'खाता',
      signOut: 'साइन आउट',
      settings: 'सेटिंग',
      saved: 'सारे बदलाव सेव हैं',
      unsaved: 'बदलाव सेव नहीं हुए',
      saving: 'सेव हो रहा है…',
      saveFailed: 'सेव नहीं हो सका। आपके बदलाव यहीं हैं।',
      save: 'बदलाव सेव करें',
      skip: 'सीधे सामग्री पर जाएँ',
    },
    auth: {
      loginTitle: 'वापसी पर स्वागत है।',
      loginSubtitle: 'साइन इन करके देखें कि आपके लक्ष्य कहाँ हैं।',
      email: 'ई-मेल पता',
      password: 'पासवर्ड',
      show: 'पासवर्ड दिखाएँ',
      hide: 'पासवर्ड छिपाएँ',
      signIn: 'साइन इन',
      signingIn: 'साइन इन हो रहा है…',
      forgot: 'पासवर्ड भूल गए?',
      noAccount: 'ArthaYukti पर नए हैं?',
      createAccount: 'खाता बनाएँ',
      haveAccount: 'पहले से खाता है?',
      signInLink: 'साइन इन',
      expired: 'आपका सत्र खत्म हो गया। कृपया फिर साइन इन करें।',
      wrong: 'यह ई-मेल और पासवर्ड मेल नहीं खाते।',
      offline: 'सर्वर तक नहीं पहुँच सके। कनेक्शन जाँचकर फिर कोशिश करें।',
      slow: 'बहुत ज़्यादा कोशिशें। कुछ मिनट रुककर फिर कोशिश करें।',
      needEmail: 'सही ई-मेल पता भरें।',
      needPassword: 'अपना पासवर्ड भरें।',
      signupTitle: 'अपना खाता बनाएँ।',
      signupSubtitle: 'इसके बाद हम आपके पैसों के बारे में एक-एक कदम में कुछ सवाल पूछेंगे।',
      name: 'आपका नाम',
      nameHint: 'हम आपको क्या कहकर बुलाएँ? वैकल्पिक।',
      passwordRules: 'कम से कम 10 अक्षर, जिसमें कम से कम एक अक्षर और एक अंक हो।',
      confirm: 'पासवर्ड फिर से लिखें',
      mismatch: 'दोनों पासवर्ड एक जैसे नहीं हैं।',
      tooShort: 'पासवर्ड में कम से कम 10 अक्षर होने चाहिए।',
      needsLetterAndDigit: 'पासवर्ड में कम से कम एक अक्षर और एक अंक होना चाहिए।',
      language: 'भाषा',
      consent:
        'मैं समझता/समझती हूँ कि ArthaYukti योजना बनाने में मदद है, वित्तीय सलाह नहीं, और मेरी भरी हुई जानकारी मेरे खाते में रखी जाएगी।',
      consentRequired: 'आगे बढ़ने के लिए कृपया इसकी पुष्टि करें।',
      create: 'खाता बनाएँ',
      creating: 'खाता बन रहा है…',
      createFailed: 'इन जानकारियों से खाता नहीं बन सका। साइन इन करके देखें, या कोई दूसरा पता इस्तेमाल करें।',
      forgotTitle: 'अपना पासवर्ड रीसेट करें।',
      forgotSubtitle: 'अपना ई-मेल पता भरें। अगर खाता है, तो हम एक लिंक भेजेंगे।',
      sendLink: 'रीसेट लिंक भेजें',
      sending: 'भेजा जा रहा है…',
      sent: 'अगर यह पता पंजीकृत है, तो उस पर रीसेट लिंक भेज दिया गया है।',
      unavailable: 'ई-मेल से पासवर्ड रीसेट अभी उपलब्ध नहीं है। कृपया इस सेवा को चलाने वाले से संपर्क करें।',
      backToSignIn: 'साइन इन पर वापस',
      explore: 'बिना खाते के देखें',
      heroTitle: 'देखें कौन सा लक्ष्य रुकेगा, और क्यों।',
      heroBody:
        'ArthaYukti महीने-दर-महीने निकालता है कि आपका पैसा क्या-क्या उठा सकता है, और सब कुछ न उठा पाए तो पहले कौन सा लक्ष्य खिसकता है।',
      heroPoints: [
        'हर आँकड़ा ऐसी गणना से आता है जिसे आप जाँच सकते हैं।',
        'लागू करने से पहले बदलाव सुरक्षित तरीके से आज़माएँ।',
        'आप कभी भी सेटिंग से अपना डेटा निर्यात या मिटा सकते हैं।',
      ],
    },
  },
}
