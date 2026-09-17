import { permanentRedirect } from "next/navigation";

// Route historique unifiee : /memoire redirige durablement (301) vers /histoire.
export default function MemoireRedirectPage() {
  permanentRedirect("/histoire");
}
