import type { SiteLocale } from "@/lib/i18n/locale";

export type AccountUiCopy = {
  manageTitle: string;
  manageIntro: string;
  enterEmailPrompt: string;
  emailPlaceholder: string;
  openAccount: string;
  openingAccount: string;
  statPlan: string;
  statCompleted: string;
  statCompletionRate: string;
  loading: string;
  dash: string;
  changesRemaining: string;
  needMoreThemes: string;
  upgradeTo2: string;
  upgradeTo3: string;
  upgrading: string;
  todayObjective: string;
  noObjectiveToday: string;
  monthlyRecap: string;
  keepGoing: string;
  difficultyTime: string;
  difficulty: string;
  time: string;
  min: string;
  energyLow: string;
  energyMedium: string;
  energyHigh: string;
  languageEmails: string;
  languageHint: string;
  errNoSubscription: string;
  subscriptionSingleNote: string;
  saveSettings: string;
  saving: string;
  coachCheckin: string;
  howFeelToday: string;
  moodTooEasy: string;
  moodJustRight: string;
  moodTooHard: string;
  checkinPlaceholder: string;
  saveCheckin: string;
  lastCheckin: string;
  recentActions: string;
  noRecentActions: string;
  changeThemesQuestion: string;
  yesChangeThemes: string;
  notNow: string;
  saveThemes: string;
  allSetThemes: string;
  billingLink: string;
  billingOpening: string;
  themeLabels: Record<string, string>;
  statusCompleted: string;
  statusSkipped: string;
  statusPending: string;
  errLoadOverview: string;
  errFindAccount: string;
  errUpdateSettings: string;
  msgSettingsUpdated: string;
  errSaveCheckin: string;
  msgCheckinSaved: string;
  errUpgradePlan: string;
  msgPlanUpgraded: (label: string) => string;
  errOpenBilling: string;
  errUpdateThemes: string;
  msgThemesUpdated: (remaining: number) => string;
  loadingAccount: string;
};

const COPY: Record<SiteLocale, AccountUiCopy> = {
  en: {
    manageTitle: "Manage themes",
    manageIntro:
      "You can change themes up to 3 times per month. Your plan still defines how many themes are allowed (1, 2, or 3).",
    enterEmailPrompt: "Enter your subscription email to open your account.",
    emailPlaceholder: "you@example.com",
    openAccount: "Open my account",
    openingAccount: "Opening...",
    statPlan: "Plan",
    statCompleted: "Completed",
    statCompletionRate: "Completion rate",
    loading: "Loading...",
    dash: "—",
    changesRemaining: "Changes remaining this month:",
    needMoreThemes: "Need more themes? Upgrade your plan without re-entering your card.",
    upgradeTo2: "Upgrade to 2 themes",
    upgradeTo3: "Upgrade to 3 themes",
    upgrading: "Upgrading...",
    todayObjective: "Today's objective",
    noObjectiveToday: "No objective sent yet today.",
    monthlyRecap: "Monthly recap",
    keepGoing: "Keep going.",
    difficultyTime: "Difficulty and time",
    difficulty: "Difficulty",
    time: "Time",
    min: "min",
    energyLow: "Low",
    energyMedium: "Medium",
    energyHigh: "High",
    languageEmails: "Language",
    languageHint:
      "Used for daily emails and this page. Changing it saves immediately and updates the site language.",
    errNoSubscription:
      "No active subscription is linked to this link yet. Wait a minute after payment, or open the account link from your welcome email.",
    subscriptionSingleNote:
      "One active plan is shown here. A new purchase updates this row (Stripe may list several subscriptions for the same email).",
    saveSettings: "Save settings",
    saving: "Saving...",
    coachCheckin: "Coach check-in",
    howFeelToday: "How did today's actions feel?",
    moodTooEasy: "Too easy",
    moodJustRight: "Just right",
    moodTooHard: "Too hard",
    checkinPlaceholder: "Optional note (what to prioritize or avoid tomorrow)",
    saveCheckin: "Save check-in",
    lastCheckin: "Last check-in:",
    recentActions: "Recent actions",
    noRecentActions: "No recent actions yet.",
    changeThemesQuestion: "Would you like to change your themes?",
    yesChangeThemes: "Yes, change themes",
    notNow: "Not now",
    saveThemes: "Save themes",
    allSetThemes: "You're all set. Your current themes stay active.",
    billingLink: "Billing & invoices (Stripe)",
    billingOpening: "Opening…",
    themeLabels: {
      mental_clarity: "Mental clarity",
      organization: "Organization",
      health_energy: "Health / Energy",
      work_business: "Work / Business",
      personal_projects: "Personal projects",
      relationships: "Relationships",
    },
    statusCompleted: "Completed",
    statusSkipped: "Skipped",
    statusPending: "Pending",
    errLoadOverview: "Unable to load account overview.",
    errFindAccount: "Unable to find your account.",
    errUpdateSettings: "Unable to update settings.",
    msgSettingsUpdated: "Settings updated.",
    errSaveCheckin: "Unable to save check-in.",
    msgCheckinSaved: "Check-in saved. Tomorrow's actions will adapt.",
    errUpgradePlan: "Unable to upgrade plan.",
    msgPlanUpgraded: (label) => `Plan upgraded to ${label}.`,
    errOpenBilling: "Unable to open billing.",
    errUpdateThemes: "Unable to update themes.",
    msgThemesUpdated: (remaining) =>
      `Themes updated. Changes remaining this month: ${remaining}.`,
    loadingAccount: "Loading account...",
  },
  fr: {
    manageTitle: "Gérer les thèmes",
    manageIntro:
      "Vous pouvez changer de thèmes jusqu’à 3 fois par mois. Votre formule limite toujours le nombre de thèmes (1, 2 ou 3).",
    enterEmailPrompt: "Saisissez l’e-mail d’abonnement pour ouvrir votre compte.",
    emailPlaceholder: "vous@exemple.com",
    openAccount: "Ouvrir mon compte",
    openingAccount: "Ouverture...",
    statPlan: "Formule",
    statCompleted: "Terminées",
    statCompletionRate: "Taux de complétion",
    loading: "Chargement...",
    dash: "—",
    changesRemaining: "Modifications restantes ce mois-ci :",
    needMoreThemes:
      "Besoin de plus de thèmes ? Passez à une formule supérieure sans ressaisir votre carte.",
    upgradeTo2: "Passer à 2 thèmes",
    upgradeTo3: "Passer à 3 thèmes",
    upgrading: "Mise à niveau...",
    todayObjective: "Objectif du jour",
    noObjectiveToday: "Aucun objectif envoyé aujourd’hui.",
    monthlyRecap: "Bilan du mois",
    keepGoing: "Continuez.",
    difficultyTime: "Difficulté et temps",
    difficulty: "Difficulté",
    time: "Temps",
    min: "min",
    energyLow: "Faible",
    energyMedium: "Moyen",
    energyHigh: "Élevé",
    languageEmails: "Langue",
    languageHint:
      "Utilisée pour les e-mails quotidiens et cette page. Le changement est enregistré tout de suite et met à jour la langue du site.",
    errNoSubscription:
      "Aucun abonnement actif n’est encore lié à ce lien. Attendez une minute après le paiement, ou ouvrez le lien « compte » depuis l’e-mail de bienvenue.",
    subscriptionSingleNote:
      "Une seule formule active s’affiche ici. Un nouvel achat met cette ligne à jour (Stripe peut lister plusieurs abonnements pour le même e-mail).",
    saveSettings: "Enregistrer les réglages",
    saving: "Enregistrement...",
    coachCheckin: "Point avec le coach",
    howFeelToday: "Comment ont été les actions aujourd’hui ?",
    moodTooEasy: "Trop facile",
    moodJustRight: "Juste bien",
    moodTooHard: "Trop dur",
    checkinPlaceholder: "Note facultative (priorité ou à éviter demain)",
    saveCheckin: "Enregistrer le point",
    lastCheckin: "Dernier point :",
    recentActions: "Actions récentes",
    noRecentActions: "Pas encore d’actions récentes.",
    changeThemesQuestion: "Souhaitez-vous changer vos thèmes ?",
    yesChangeThemes: "Oui, changer les thèmes",
    notNow: "Pas maintenant",
    saveThemes: "Enregistrer les thèmes",
    allSetThemes: "C’est bon. Vos thèmes actuels restent en place.",
    billingLink: "Facturation et factures (Stripe)",
    billingOpening: "Ouverture…",
    themeLabels: {
      mental_clarity: "Clarté mentale",
      organization: "Organisation",
      health_energy: "Santé / Énergie",
      work_business: "Travail / Activité",
      personal_projects: "Projets personnels",
      relationships: "Relations",
    },
    statusCompleted: "Terminé",
    statusSkipped: "Ignoré",
    statusPending: "En attente",
    errLoadOverview: "Impossible de charger le compte.",
    errFindAccount: "Impossible de trouver votre compte.",
    errUpdateSettings: "Impossible de mettre à jour les réglages.",
    msgSettingsUpdated: "Réglages enregistrés.",
    errSaveCheckin: "Impossible d’enregistrer le point.",
    msgCheckinSaved: "Point enregistré. Les actions de demain s’adapteront.",
    errUpgradePlan: "Impossible de changer de formule.",
    msgPlanUpgraded: (label) => `Formule mise à niveau : ${label}.`,
    errOpenBilling: "Impossible d’ouvrir la facturation.",
    errUpdateThemes: "Impossible de mettre à jour les thèmes.",
    msgThemesUpdated: (remaining) =>
      `Thèmes mis à jour. Modifications restantes ce mois-ci : ${remaining}.`,
    loadingAccount: "Chargement du compte...",
  },
  es: {
    manageTitle: "Gestionar temas",
    manageIntro:
      "Puedes cambiar de temas hasta 3 veces al mes. Tu plan sigue definiendo cuántos temas están permitidos (1, 2 o 3).",
    enterEmailPrompt: "Introduce el correo de tu suscripción para abrir tu cuenta.",
    emailPlaceholder: "tu@ejemplo.com",
    openAccount: "Abrir mi cuenta",
    openingAccount: "Abriendo...",
    statPlan: "Plan",
    statCompleted: "Completadas",
    statCompletionRate: "Tasa de finalización",
    loading: "Cargando...",
    dash: "—",
    changesRemaining: "Cambios restantes este mes:",
    needMoreThemes: "¿Más temas? Mejora tu plan sin volver a introducir la tarjeta.",
    upgradeTo2: "Mejorar a 2 temas",
    upgradeTo3: "Mejorar a 3 temas",
    upgrading: "Mejorando...",
    todayObjective: "Objetivo de hoy",
    noObjectiveToday: "Aún no hay objetivo enviado hoy.",
    monthlyRecap: "Resumen del mes",
    keepGoing: "Sigue así.",
    difficultyTime: "Dificultad y tiempo",
    difficulty: "Dificultad",
    time: "Tiempo",
    min: "min",
    energyLow: "Baja",
    energyMedium: "Media",
    energyHigh: "Alta",
    languageEmails: "Idioma",
    languageHint:
      "Se usa en los correos diarios y en esta página. Al cambiarlo se guarda al momento y actualiza el idioma del sitio.",
    errNoSubscription:
      "Aún no hay una suscripción activa vinculada a este enlace. Espera un minuto tras el pago o abre el enlace de cuenta del correo de bienvenida.",
    subscriptionSingleNote:
      "Solo se muestra un plan activo. Una compra nueva actualiza esta fila (Stripe puede mostrar varias suscripciones con el mismo correo).",
    saveSettings: "Guardar ajustes",
    saving: "Guardando...",
    coachCheckin: "Check-in con el coach",
    howFeelToday: "¿Cómo te han parecido las acciones de hoy?",
    moodTooEasy: "Demasiado fácil",
    moodJustRight: "En el punto",
    moodTooHard: "Demasiado difícil",
    checkinPlaceholder: "Nota opcional (priorizar o evitar mañana)",
    saveCheckin: "Guardar check-in",
    lastCheckin: "Último check-in:",
    recentActions: "Acciones recientes",
    noRecentActions: "Aún no hay acciones recientes.",
    changeThemesQuestion: "¿Quieres cambiar tus temas?",
    yesChangeThemes: "Sí, cambiar temas",
    notNow: "Ahora no",
    saveThemes: "Guardar temas",
    allSetThemes: "Listo. Tus temas actuales siguen activos.",
    billingLink: "Facturación y facturas (Stripe)",
    billingOpening: "Abriendo…",
    themeLabels: {
      mental_clarity: "Claridad mental",
      organization: "Organización",
      health_energy: "Salud / Energía",
      work_business: "Trabajo / Negocio",
      personal_projects: "Proyectos personales",
      relationships: "Relaciones",
    },
    statusCompleted: "Completado",
    statusSkipped: "Omitido",
    statusPending: "Pendiente",
    errLoadOverview: "No se pudo cargar la cuenta.",
    errFindAccount: "No se encontró tu cuenta.",
    errUpdateSettings: "No se pudieron actualizar los ajustes.",
    msgSettingsUpdated: "Ajustes guardados.",
    errSaveCheckin: "No se pudo guardar el check-in.",
    msgCheckinSaved: "Check-in guardado. Las acciones de mañana se adaptarán.",
    errUpgradePlan: "No se pudo mejorar el plan.",
    msgPlanUpgraded: (label) => `Plan mejorado: ${label}.`,
    errOpenBilling: "No se pudo abrir la facturación.",
    errUpdateThemes: "No se pudieron actualizar los temas.",
    msgThemesUpdated: (remaining) =>
      `Temas actualizados. Cambios restantes este mes: ${remaining}.`,
    loadingAccount: "Cargando cuenta...",
  },
};

export function getAccountUiCopy(locale: SiteLocale): AccountUiCopy {
  return COPY[locale] ?? COPY.en;
}
