// lib/connections.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  computeCooldownEndsAt,
  isCooldownActive,
  resolveSendRequestOutcome,
} from "./connections";

describe("connections logic (pure)", () => {
  const rejectedAt = new Date("2026-01-01T00:00:00.000Z");

  it("calculates cooldown end correctly (7 days)", () => {
    const endsAt = computeCooldownEndsAt(rejectedAt);
    expect(endsAt.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });

  it("blocks requests just before 7 days", () => {
    const checkTime = new Date("2026-01-07T23:59:59.999Z");
    expect(isCooldownActive(rejectedAt, checkTime)).toBe(true);
  });

  it("allows requests exactly at 7 days", () => {
    const checkTime = new Date("2026-01-08T00:00:00.000Z");
    expect(isCooldownActive(rejectedAt, checkTime)).toBe(false);
  });

  it("allows requests well after 7 days", () => {
    const checkTime = new Date("2026-02-01T00:00:00.000Z");
    expect(isCooldownActive(rejectedAt, checkTime)).toBe(false);
  });

  it("resolves outcome to CREATE when no connection exists", () => {
    const outcome = resolveSendRequestOutcome(null, "user-1");
    expect(outcome.type).toBe("CREATE");
  });
});

describe("connections security AST/source guards", () => {
  const root = join(__dirname, "..");
  const read = (p: string) => readFileSync(join(root, p), "utf8");
  const actionsSource = read("lib/connections-actions.ts");

  it("never reads requesterId/profileId from submitted forms", () => {
    expect(/formData\.get\(\s*["'](requesterId|profileId|userId)["']\s*\)/.test(actionsSource)).toBe(false);
  });

  it("derives current profile via ensureUser()", () => {
    expect(/async function getCurrentProfileId/.test(actionsSource)).toBe(true);
    const matches = actionsSource.match(/await getCurrentProfileId\(\)/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(5);
  });

  it("rejects self-connect explicitly", () => {
    expect(/requesterProfileId === receiverProfileId/.test(actionsSource)).toBe(true);
  });

  it("checks target visibility before creating a request", () => {
    expect(/target\.visibility !== ProfileVisibility\.PUBLIC/.test(actionsSource)).toBe(true);
  });

  it("only allows receiver to accept a PENDING request", () => {
    expect(
      /connection\.receiverId !== currentProfileId \|\|\s*connection\.status !== ConnectionStatus\.PENDING/.test(actionsSource)
    ).toBe(true);
  });

  it("only allows requester to withdraw a PENDING request", () => {
    expect(
      /connection\.requesterId !== currentProfileId \|\|\s*connection\.status !== ConnectionStatus\.PENDING/.test(actionsSource)
    ).toBe(true);
  });

  it("only allows participants to remove an ACCEPTED connection", () => {
    expect(/connection\.status !== ConnectionStatus\.ACCEPTED/.test(actionsSource)).toBe(true);
    expect(/isParticipant/.test(actionsSource)).toBe(true);
  });

  it("implements cross-request auto-accept", () => {
    expect(/existing\.requesterId === requesterProfileId/.test(actionsSource)).toBe(true);
    expect(/status: ConnectionStatus\.ACCEPTED/.test(actionsSource)).toBe(true);
  });

  it("runs cooldown check before allowing new request after REJECTED", () => {
    expect(/isCooldownActive\(existing\.updatedAt\)/.test(actionsSource)).toBe(true);
  });
});