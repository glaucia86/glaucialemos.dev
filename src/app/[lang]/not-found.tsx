import "../red-tide.css";
import { RedTide } from "@/components/notfound/RedTide";

// Maré Rubra: a real 404 (Next sets the status); the language comes from the URL on the client.
export default function NotFound() {
  return <RedTide />;
}
