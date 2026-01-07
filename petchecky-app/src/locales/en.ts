import { TranslationKeys } from "./ko";

export const en: TranslationKeys = {
  // Common
  common: {
    appName: "PetChecky",
    tagline: "AI-Powered Pet Health Check",
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    submit: "Submit",
    send: "Send",
  },

  // Navigation
  nav: {
    home: "Home",
    chat: "Consult",
    history: "History",
    profile: "Profile",
    settings: "Settings",
    community: "Community",
    subscription: "Subscription",
  },

  // Landing Page
  landing: {
    heroDescription: "When your pet seems unwell or you're worried about symptoms,\nAI analyzes the symptoms and guides you on appropriate responses.",
    startChat: "💬 Start Consultation",
    registerPet: "🐾 Register Your Pet",
    chatHistory: "📋 Consultation History",
    healthReport: "📊 Health Report",
    symptomsQuestion: "Do you have these symptoms?",
    featuresTitle: "PetChecky Can Help",
  },

  // Features
  features: {
    aiAnalysis: {
      title: "AI Symptom Analysis",
      description: "Enter your pet's symptoms and AI will guide you on possible causes and responses.",
    },
    riskAssessment: {
      title: "Automatic Risk Assessment",
      description: "Analyzes symptom severity to let you know if a vet visit is needed.",
    },
    chatHistory: {
      title: "Save Consultation History",
      description: "Save previous consultations and review them anytime.",
    },
    community: {
      title: "Community",
      description: "Share information and connect with other pet owners.",
    },
  },

  // Symptoms
  symptoms: {
    vomiting: "Vomiting",
    diarrhea: "Diarrhea",
    lossOfAppetite: "Loss of Appetite",
    fever: "Fever",
    limping: "Limping",
    lethargy: "Lethargy",
  },

  // Pet Profile
  pet: {
    dog: "Dog",
    cat: "Cat",
    name: "Name",
    species: "Species",
    breed: "Breed",
    age: "Age",
    weight: "Weight",
    years: "years",
    kg: "kg",
    register: "Register",
    edit: "Edit",
    delete: "Delete",
    selectPet: "Select Pet",
    addPet: "Add New Pet",
  },

  // Chat
  chat: {
    welcome: "Hello! I'll check {petName}'s health. 🐾\n\nWhat symptoms are you experiencing? Please tell me in detail for more accurate analysis.",
    placeholder: "Enter symptoms...",
    imagePlaceholder: "Describe the photo...",
    consulting: "Health Consultation",
    disclaimer: "* AI consultation is for reference only. Please consult a vet for accurate diagnosis.",
    imageAnalysis: "📷 Image analysis available",
    networkError: "Please check your network connection. If connected, please try again later.",
  },

  // Severity
  severity: {
    high: "🚨 Critical - Vet Visit Recommended",
    medium: "⚠️ Caution - Observation Needed",
    low: "✅ Safe - Common Symptom",
  },

  // Hospital
  hospital: {
    find: "🏥 Find Nearby Vet Clinics",
    loading: "Searching for clinics...",
    noResults: "No vet clinics nearby",
    call: "Call",
    directions: "Directions",
    reserve: "Reserve",
    distance: "Distance",
    highSeverityTitle: "Immediate Vet Visit Recommended",
    highSeverityDesc: "Serious symptoms are suspected. Please visit a nearby vet clinic.",
    mediumSeverityTitle: "Consider Visiting a Vet",
    mediumSeverityDesc: "If symptoms persist, we recommend consulting a veterinarian.",
    disclaimer: "* Please contact the clinic directly for hours and availability",
  },

  // Reservation
  reservation: {
    title: "Reservation Request",
    symptoms: "Symptoms & Consultation Details",
    preferredDate: "Preferred Date",
    preferredTime: "Preferred Time",
    contactPhone: "Contact Number",
    notes: "Additional Notes (Optional)",
    submit: "Submit Reservation",
    success: "Reservation request completed!",
    notice: "* The clinic will contact you to confirm",
  },

  // Vet Consultation
  vetConsultation: {
    title: "Live Consultation with Veterinarian",
    subtitle: "Professional vets available 24/7",
    startConsult: "Start Consultation",
    normalType: "Normal Consultation",
    urgentType: "Urgent Consultation",
    waitingMessage: "Connecting to a veterinarian...",
    connected: "Veterinarian connected",
  },

  // Community
  community: {
    title: "Community",
    writePost: "Write Post",
    categories: {
      all: "All",
      question: "Questions",
      tip: "Tips",
      daily: "Daily",
      review: "Reviews",
    },
    postTitle: "Title",
    postContent: "Content",
    likes: "Likes",
    comments: "Comments",
  },

  // Subscription
  subscription: {
    free: "Free",
    premium: "Premium",
    premiumPlus: "Premium+",
    monthlyLimit: "{count} free consultations/month",
    unlimited: "Unlimited consultations",
    imageAnalysis: "Image analysis",
    prioritySupport: "Priority support",
    subscribe: "Subscribe",
    limitExceeded: "You've used all free consultations this month",
    limitExceededDesc: "Subscribe to Premium for unlimited AI consultations!",
    viewPremium: "View Premium",
    resetNotice: "Free consultations reset on the 1st of next month",
  },

  // Health Report
  healthReport: {
    title: "Health Report",
    downloadPdf: "Download PDF",
    petInfo: "Pet Information",
    consultHistory: "Consultation History",
    monthlyStats: "Monthly Statistics",
    noData: "No data to display",
  },

  // Notifications
  notifications: {
    title: "Notification Settings",
    enable: "Enable Notifications",
    disable: "Disable Notifications",
    permissionDenied: "Notification permission denied",
    notSupported: "This browser doesn't support notifications",
  },

  // Disclaimer
  disclaimer: {
    main: "⚠️ PetChecky provides reference information. Please consult a vet for accurate diagnosis.",
    emergency: "In case of emergency, please visit the nearest vet clinic.",
  },

  // Footer
  footer: {
    copyright: "© 2024 PetChecky. AI Pet Health Consultation Service.",
  },
};
