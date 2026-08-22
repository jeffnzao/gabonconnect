// components/members/connect-button.tsx
"use client";

import { ConnectionState } from "@/lib/connections";
import {
  sendConnectionRequest,
  withdrawConnection,
  removeConnection,
  acceptConnection,
} from "@/lib/connections-actions";

interface ConnectButtonProps {
  targetProfileId: string;
  state: ConnectionState;
  isAuthenticated: boolean;
}

export function ConnectButton({ targetProfileId, state }: ConnectButtonProps) {
  switch (state.status) {
    case "NOT_CONNECTED":
    case "REJECTED_AVAILABLE":
      return (
        <form action={sendConnectionRequest}>
          <input
            type="hidden"
            name="receiverProfileId"
            value={targetProfileId}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
          >
            Se connecter
          </button>
        </form>
      );

    case "PENDING_OUTGOING":
      return (
        <form action={withdrawConnection}>
          <input
            type="hidden"
            name="connectionId"
            value={state.connectionId}
          />
          <button
            type="submit"
            className="px-4 py-2 border border-input rounded-md font-medium hover:bg-muted"
          >
            Demande envoyée (Annuler)
          </button>
        </form>
      );

    case "PENDING_INCOMING":
      return (
        <form action={acceptConnection}>
          <input
            type="hidden"
            name="connectionId"
            value={state.connectionId}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
          >
            Accepter la demande
          </button>
        </form>
      );

    case "ACCEPTED":
      return (
        <form action={removeConnection}>
          <input
            type="hidden"
            name="connectionId"
            value={state.connectionId}
          />
          <button
            type="submit"
            className="px-4 py-2 border border-destructive text-destructive rounded-md font-medium hover:bg-destructive/10"
          >
            Connecté (Supprimer)
          </button>
        </form>
      );

    case "REJECTED_COOLDOWN":
      return (
        <button
          disabled
          className="px-4 py-2 bg-muted text-muted-foreground rounded-md cursor-not-allowed text-sm"
        >
          Disponible le {state.cooldownEndsAt.toLocaleDateString()}
        </button>
      );
  }
}