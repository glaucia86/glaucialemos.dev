import roles from "@/data/experiencia.json";
import contributions from "@/data/contribuicoes.json";

// Explicit curation: preserve the documented sources, never infer personal memories.
export const storySources = [
  roles.find(role => role.empresa === "Udemy")!.fonte,
  roles.find(role => role.empresa === "Node.js Foundation")!.fonte,
  contributions.find(item => item.repo === "microsoft/generative-ai-for-beginners")!.prs,
];
