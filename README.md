Project Title

Cross-Border Remittance DApp

Project Description

This repository contains a minimal Soroban smart contract that implements an on-chain escrow registry for the Stellar Cross-Border Remittance DApp (testnet prototype).
The contract stores simple escrow records (id, sender, receiver, amount, completed flag) and exposes functions to create, read, release, and refund escrows. It is intentionally lightweight: the contract manages canonical escrow state while actual fund movement may be handled off-chain or by a token client in a future iteration.

Project Vision

Enable a clear, auditable, and minimal trust-minimised escrow primitive on Stellar (Soroban) that developers can use as the building block for low-friction remittances and payment flows. The contract aims to be:

Simple — easy to read, reason about, and test.

Safe — typed errors and storage patterns that match Soroban v23.x best practices.

Composable — designed so frontends or backend services can integrate easily and later upgrade to on-chain token locking/release.

Key Features

On-chain escrow records: stores id, sender, receiver, amount, and completed flag.

CRUD-style API (minimal):

create(id, sender, receiver, amount) — create a new escrow record.

get(id) — read an escrow record (returns Option<Escrow>).

release(id, caller) — mark escrow completed (caller must be sender).

refund(id, caller) — mark escrow refunded/completed (caller must be sender).

Typed contract errors: uses #[contracterror] for clear failure modes (e.g., NotFound, AlreadyExists, NotSender).

Stable storage keys: escrow entries keyed by (symbol_short!("ESCROW"), id) for deterministic lookup.

Soroban v23.x compatibility: written to use the public storage and API patterns in soroban-sdk 23.x (e.g., env.storage().persistent(), symbol_short!, #[contracttype], #[contracterror]).

Future Scope

Enforce signer auth inside contract: replace the caller-param approach with Address::require_auth (or equivalent) so the contract itself enforces the signer rather than trusting a passed caller argument.

On-chain token locking & transfers: integrate the Soroban token interface (TokenClient) so the contract can accept token deposits and release tokens directly — making escrows fully trustless.

Timeouts & dispute resolution: add time-based auto-refunds or dispute resolution multi-party flows (oracles/multisig).

Events & indexing: emit structured events on create/release/refund and provide an off-chain indexer for fast frontend search and history.

Access controls & roles: allow configurable roles (admin, arbiter) to support regulated payout flows or institutional usage.

Security audits & fuzzing: include formal tests, property testing and third-party audit before any mainnet usage.

