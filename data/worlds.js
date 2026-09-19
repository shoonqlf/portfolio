// Chaque monde = une planète du voyage. deco = éléments posés à la surface.
export const WORLDS = [
  {
    id: "sae24",
    idx: { fr: "ESCALE 01 / RÉSEAU", en: "STOP 01 / NETWORK" },
    title: "SAÉ 24",
    cat: { fr: "Infrastructure réseau complète", en: "Complete network infrastructure" },
    desc: {
      fr: "Une infra de bout en bout sous GNS3 : 5 routeurs Cisco (EIGRP, ACL), un serveur Python qui remonte des données de capteurs vers MySQL, affichées en direct sur une page web.",
      en: "An end-to-end infrastructure on GNS3: 5 Cisco routers (EIGRP, ACLs), a Python server pushing sensor data to MySQL, displayed live on a web page.",
    },
    tags: ["Cisco IOS", "EIGRP", "Python", "MySQL"],
    color: 0xe0704a, accent: 0xffc24b, ring: 0xffc24b, size: 30, deco: "antennas",
  },
  {
    id: "driveelite",
    idx: { fr: "ESCALE 02 / WEB", en: "STOP 02 / WEB" },
    title: "DriveElite",
    cat: { fr: "Location de voitures · e-commerce", en: "Car rental · e-commerce" },
    desc: {
      fr: "Un site complet de location : catalogue dynamique, comptes utilisateurs, sessions sécurisées, panier et CRUD complet. Toute la chaîne PHP / MySQL.",
      en: "A full rental site: dynamic catalog, user accounts, secure sessions, cart and full CRUD. The whole PHP / MySQL chain.",
    },
    tags: ["PHP", "MySQL", "Sessions", "CRUD"],
    color: 0xd94f7e, accent: 0xff8a5b, ring: 0, size: 26, deco: "city",
  },
  {
    id: "sae22",
    idx: { fr: "ESCALE 03 / ÉLECTRONIQUE", en: "STOP 03 / ELECTRONICS" },
    title: "SAÉ 22",
    cat: { fr: "Communication par fibre optique", en: "Optical fiber communication" },
    desc: {
      fr: "Transmettre des données entre deux Arduino à travers une fibre optique, en modulation FSK. Émetteur, récepteur, dimensionnement — un signal qui voyage dans la lumière.",
      en: "Transmitting data between two Arduinos through an optical fiber, in FSK modulation. Emitter, receiver, sizing — a signal traveling in light.",
    },
    tags: ["Arduino", "Fibre optique", "FSK"],
    color: 0x9a6cd9, accent: 0xffd9a0, ring: 0xff8a5b, size: 24, deco: "fiber",
  },
  {
    id: "react",
    idx: { fr: "ESCALE 04 / DATA", en: "STOP 04 / DATA" },
    title: "App React",
    cat: { fr: "Analyse de dépenses", en: "Spending analysis" },
    desc: {
      fr: "Une application React pour visualiser et analyser ses dépenses : graphiques dynamiques, catégories, et une interface fluide côté client.",
      en: "A React app to visualize and analyze spending: dynamic charts, categories, and a smooth client-side interface.",
    },
    tags: ["React", "JavaScript", "Data viz"],
    color: 0xe8a04c, accent: 0xff4e8c, ring: 0, size: 22, deco: "charts",
  },
  {
    id: "blizd",
    idx: { fr: "ESCALE 05 / FUN", en: "STOP 05 / FUN" },
    title: "Bliz'd",
    cat: { fr: "Quiz interactif sur PNL", en: "Interactive PNL quiz" },
    desc: {
      fr: "Un quiz web interactif autour du groupe PNL — une manière fun de mêler culture musicale et développement front.",
      en: "An interactive web quiz around the group PNL — a fun way to mix music culture and front-end dev.",
    },
    tags: ["HTML", "CSS", "JavaScript"],
    color: 0xd9628f, accent: 0xffc24b, ring: 0, size: 20, deco: "music",
  },
  {
    id: "skills",
    idx: { fr: "CONSTELLATION / COMPÉTENCES", en: "CONSTELLATION / SKILLS" },
    title: { fr: "Compétences", en: "Skills" },
    cat: { fr: "Réseau · Systèmes · Cyber · Dev", en: "Network · Systems · Cyber · Dev" },
    desc: {
      fr: "Cisco, VLAN, OSPF/EIGRP, VoIP · Linux, Windows Server, Debian · sécurité réseau, cryptographie · Python, PHP, GNS3, Wireshark.",
      en: "Cisco, VLAN, OSPF/EIGRP, VoIP · Linux, Windows Server, Debian · network security, cryptography · Python, PHP, GNS3, Wireshark.",
    },
    tags: ["Cisco", "VLAN", "OSPF", "Linux", "Python", "Wireshark"],
    color: 0xffb347, accent: 0xff8a5b, ring: 0, size: 34, deco: "antennas", star: true,
  },
  {
    id: "about",
    idx: { fr: "ORIGINE / À PROPOS", en: "ORIGIN / ABOUT" },
    title: { fr: "À propos", en: "About" },
    cat: { fr: "Qui suis-je", en: "Who I am" },
    desc: {
      fr: "Étudiant en 1re année de Réseaux & Télécommunications à l'IUT de Créteil-Vitry, en route vers la cybersécurité. J'aime comprendre comment marchent les systèmes pour mieux les protéger.",
      en: "First-year Networks & Telecom student at IUT Créteil-Vitry, heading toward cybersecurity. I like understanding how systems work to better protect them.",
    },
    tags: ["BUT R&T", "Cybersécurité", "Créatif"],
    color: 0xe07a5f, accent: 0xffe9c7, ring: 0xffc1d9, size: 28, deco: "home",
  },
  {
    id: "contact",
    idx: { fr: "SIGNAL / CONTACT", en: "SIGNAL / CONTACT" },
    title: "Contact",
    cat: { fr: "Établir une liaison", en: "Establish a link" },
    desc: { fr: "", en: "" },
    tags: [],
    color: 0xd94f7e, accent: 0x8b5cf6, ring: 0x8b5cf6, size: 24, deco: "antennas", contact: true,
  },
];

export const UI = {
  eyebrow: { fr: "Réseaux & Télécommunications · Cybersécurité", en: "Networks & Telecom · Cybersecurity" },
  tagline: {
    fr: "Je conçois des réseaux, je les protège — et j'en fais quelque chose de beau.",
    en: "I design networks, I protect them — and I make something beautiful out of them.",
  },
  ready: { fr: "Prêt à débuter l'exploration", en: "Ready to begin the exploration" },
  ignition: { fr: "Ignition ↓", en: "Ignition ↓" },
  scroll: { fr: "scrollez", en: "scroll" },
  recruiter: { fr: "Mode recruteur", en: "Recruiter mode" },
  enter: { fr: "Entrer dans ce monde →", en: "Enter this world →" },
  logbook: { fr: "Journal de bord", en: "Logbook" },
  askSamy: { fr: "Demande à Samy", en: "Ask Samy" },
  auto: { fr: "Réponses automatiques", en: "Automatic answers" },
  placeholder: { fr: "Écris ta question…", en: "Type your question…" },
  dlCv: { fr: "Télécharger mon CV", en: "Download my CV" },
};
