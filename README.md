## 🌟 Stellar Mini Escrow — Soroban Smart Contract

A minimal, auditable escrow primitive built for the Stellar Cross-Border Remittance DApp (testnet prototype) — purposefully simple, safe, and ready to integrate with a frontend using Soroban.

# 📚 Table of Contents

Project Title

Project Description

Project Vision

Key Features

Future Scope

Contract Screenshot

# 🔖 Project Title

Stellar Mini Escrow — Soroban Smart Contract

# 📝 Project Description

This repository contains a compact Soroban smart contract that implements an on-chain escrow registry for a Stellar remittance prototype. The contract stores canonical escrow records — each with an id, sender, receiver, amount, and completed flag — and exposes simple operations to create, read, release, and refund escrows.
The contract intentionally separates state from fund custody: it records authoritative escrow status on-chain, while movement of XLM/tokens can be handled by an integrating frontend or off-chain service for the prototype stage.

# 🎯 Project Vision

To provide an easy-to-understand, secure building block that developers can use to add trust-minimized escrow functionality to Stellar apps. The contract prioritizes:

Simplicity — minimal surface area, readable code, easy tests.

Safety — typed errors, stable storage patterns, and clear invariants.

Composability — intended to be integrated with frontends or backends and later upgraded to fully on-chain token handling.

# ⭐ Key Features

On-chain escrow records
Stores id, sender, receiver, amount, and completed in Soroban persistent storage.

Minimal CRUD-style API

create(id, sender, receiver, amount) — create a new escrow record.

get(id) — fetch escrow details (returns Option<Escrow>).

release(id, caller) — mark escrow completed (caller must be the sender).

refund(id, caller) — mark escrow refunded/completed (caller must be the sender).

Typed contract errors
Uses #[contracterror] for clear, machine-readable failure modes (e.g., NotFound, AlreadyExists, NotSender).

Deterministic storage keys
Escrows keyed by a stable tuple such as (symbol_short!("ESCROW"), id) for straightforward lookup and indexing.

Soroban v23.x compatibility
Written against soroban-sdk 23.x best practices (persistent storage API, #[contracttype], #[contracterror], etc.).

# 🔮 Future Scope

On-chain auth enforcement — replace the caller-param pattern with Address::require_auth (or equivalent) so the contract enforces signer authenticity itself.

Token locking & release — integrate with Soroban TokenClient to accept deposits and release tokens fully on-chain, removing off-chain custody.

Timeouts & dispute resolution — implement time-based auto-refunds, multi-party arbitration, or oracle-based dispute handling.

Events & indexing — emit structured events (create/release/refund) and provide an off-chain indexer for fast frontend queries.

Access controls & roles — introduce admin/arbiter roles to support institutional flows.

Testing & security — add comprehensive unit tests, property tests, and pursue a security audit before any mainnet deployment.

# 🖼️ Contract Screenshot

![alt text](image.png)