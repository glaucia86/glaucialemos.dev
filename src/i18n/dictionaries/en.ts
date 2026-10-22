import type { Dictionary } from "./pt";
import pt from "./pt";
const en: Dictionary = {
  ...pt,
  metadata: { title: "Glaucia Lemos — AI for builders", description: "Engineering, leadership, and responsible AI adoption in software development." },
  nav: { home: "Home", about: "About", projects: "Projects", content: "Content", events: "Events", services: "Services", language: "Language" }, motion: { reduce: "Reduce motion", enable: "Enable motion" }, common: { source: "Source", stars: "stars", language: "Language", all: "All", unavailable: "Not specified" },
  accessibility: { skip: "Skip to content", primaryNav: "Primary navigation", highlights: "Highlights in numbers" },
  home: { ...pt.home, eyebrow: "Engineering • Leadership • AI", value: "I teach engineers and leaders to adopt AI across the development lifecycle — with practice, strategy, and responsibility.", primaryCta: "Book a workshop or mentorship", secondaryCta: "See events", stats: ["events","countries","languages","stars across top projects"], servicesEyebrow: "How I can help", servicesTitle: "From AI curiosity to practice", servicesBody: "Team workshops, leadership mentoring, and talks connecting technology to real decisions.", crawlTitle: "A story still being written", crawl: ["From software developer to global educator, Glaucia built her path by sharing knowledge.","As a Microsoft MVP and former Cloud Advocate, she connected Latin American communities with JavaScript, TypeScript, cloud, and AI.","Today she helps people and organizations turn AI adoption into an engineering capability — not just another tool."], heroImageAlt: "Master Yoda in the swamps of Dagobah", aboutTitle: "About me", aboutImageAlt: "Glaucia Lemos portrayed as a Jedi in brown robes with a blue lightsaber" },
  about: { ...pt.about,
    bio: [
      [
        "A Brazilian developer, educator, and technical leader, Glaucia works at the intersection of software engineering, communities, and artificial intelligence.",
      ],
      [
        "She is currently Principal Software Engineer and AI Transformation Lead at Itaú Unibanco, where she helps engineering teams take generative AI from isolated experiments to secure, governed delivery at scale, using agentic architecture, RAG, context engineering, and Spec-Driven Development.",
      ],
      [
        "She is a ",
        { text: "Microsoft MVP", href: "https://mvp.microsoft.com/pt-BR/MVP/profile/d3200941-395d-423b-a0ec-eb0577d3bb86" },
        ", ",
        { text: "OpenAI Codex Ambassador", href: "https://developers.openai.com/community/codex-ambassadors/directory?site_locale=en&ambassador=glaucia-lemos" },
        ", and ",
        { text: "Devin Ambassador", href: "https://devin.ai/community" },
        ". As a former Cloud Advocate, she spent more than six years at Microsoft making JavaScript, TypeScript, cloud, and AI more accessible to global communities. During that time, she reached more than 100,000 developers through talks and workshops in Portuguese, Spanish, and English, as well as more than 100 videos and 30 technical articles. She created Microblog AI, contributed to the Generative AI for Beginners curriculum, and led the modernization of Contoso Real Estate.",
      ],
      [
        "She is a coauthor and technical reviewer of the book ",
        { text: "Building Agentic AI Apps with Next.js, TypeScript and MCP", italic: true },
        " (Packt). Beyond coding, she has mentored many women in technology and continues to advocate for a more diverse and inclusive tech community.",
      ],
    ],
    primaryCta: "Explore my journey", secondaryCta: "LinkedIn", metadata: { title: "About — Glaucia Lemos", description: "Glaucia Lemos' professional path and community work." }, eyebrow: "The journey", title: "Technology matters when knowledge moves.", intro: "A Brazilian developer, educator, and technical leader working at the intersection of software engineering, communities, and AI.", mvp: "A Microsoft MVP and former Cloud Advocate, she spent years making JavaScript, TypeScript, cloud, and AI approachable for global communities.", timeline: "Professional journey", heroImageAlt: "Princess Leia in the frozen landscape of Hoth" },
  projects: { ...pt.projects, primaryCta: "View on GitHub", secondaryCta: "View projects", metadata: { title: "Projects — Glaucia Lemos", description: "Open-source projects and current star counts." }, eyebrow: "Open source", title: "Projects that teach by building", intro: "Hands-on repositories about TypeScript, JavaScript, AI, and the web. Stars update from GitHub when available.", heroImageAlt: "R2-D2 among the bright dunes of Tatooine" },
  content: { ...pt.content, primaryCta: "Read articles", secondaryCta: "Watch on YouTube", metadata: { title: "Content — Glaucia Lemos", description: "Technical articles and learning resources." }, eyebrow: "Library", title: "Content for learning by doing", intro: "Articles in Portuguese, English, and Spanish across several platforms.", filter: "Filter by platform", heroImageAlt: "Chewbacca in a forest on Kashyyyk" },
  events: { ...pt.events, primaryCta: "Invite me to speak", secondaryCta: "View events", metadata: { title: "Events — Glaucia Lemos", description: "History of talks, workshops, and event organization." }, eyebrow: "Around the world", title: "Knowledge without borders", intro: "A journey of meeting communities, both in person and online.", labels: ["events","countries","languages"], languageBreakdown: "By language", typeBreakdown: "By format", history: "History by year", note: "Data from 2017–2023; new events coming soon.", audienceNote: "Audience is not totaled: estimates may overlap across events and streams.", heroImageAlt: "Grogu in the volcanic landscape of Nevarro", types: { palestra: "Talks", workshop: "Workshops", organizacao: "Organizing" } },
  services: { ...pt.services, talkMessage: "I would like to invite you to speak at an event.", metadata: { title: "Services — Glaucia Lemos", description: "Workshops, mentoring, consulting, and talks on AI and engineering." }, eyebrow: "Work with me", title: "AI applied to real work", intro: "Formats tailored to your team's context, from strategy to hands-on practice.", price: "pricing on request", formTitle: "Tell me about your challenge", name: "Name", message: "Message", send: "Send message", sending: "Sending…", success: "Message sent. Thank you!", error: "Message could not be sent. Please try again.", missing: "The form is not configured yet. You can get in touch on LinkedIn.", linkedin: "Send a LinkedIn DM", heroImageAlt: "Darth Vader before the clouds of Bespin", speech: "Join me" },
  footer: { socialLabels: { youtube: "YouTube by Glaucia Lemos", x: "X by Glaucia Lemos", linkedin: "LinkedIn by Glaucia Lemos", instagram: "Instagram by Glaucia Lemos" }, tagline: "Building bridges between people, software, and AI.", rights: "All rights reserved." }, notFound: { title: "This is not the page you are looking for", body: "This route got lost in a faraway galaxy.", back: "Back home", heroImageAlt: "Stormtrooper in a Death Star corridor" }, easterEgg: { message: "May the Force be with you", close: "Close" }
};
export default en;
