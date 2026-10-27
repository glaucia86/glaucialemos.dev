import "./globals.css";
import "./red-tide.css";
import { RedTide } from "@/components/notfound/RedTide";

export default function RootNotFound() {
  return <html lang="pt-BR" className="not-found-document"><body><RedTide forcedLang="pt" /></body></html>;
}
