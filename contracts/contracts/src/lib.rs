#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, symbol_short, Address, Env, Symbol,
};

/// Typed contract errors
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum EscrowError {
    NotFound = 1,
    AlreadyExists = 2,
    AlreadyCompleted = 3,
    NotSender = 4,
}

/// Escrow struct stored in contract storage
#[contracttype]
#[derive(Clone)]
pub struct Escrow {
    pub id: Symbol,
    pub sender: Address,
    pub receiver: Address,
    pub amount: i128,
    pub completed: bool,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Create a new escrow record.
    /// Returns Err(AlreadyExists) if id already present.
    pub fn create(
        env: Env,
        id: Symbol,
        sender: Address,
        receiver: Address,
        amount: i128,
    ) -> Result<(), EscrowError> {
        let storage = env.storage().persistent();
        let key = (symbol_short!("ESCROW"), id.clone());

        if storage.has(&key) {
            return Err(EscrowError::AlreadyExists);
        }

        let esc = Escrow {
            id: id.clone(),
            sender,
            receiver,
            amount,
            completed: false,
        };

        storage.set(&key, &esc);
        Ok(())
    }

    /// Read an escrow by id
    pub fn get(env: Env, id: Symbol) -> Option<Escrow> {
        let storage = env.storage().persistent();
        let key = (symbol_short!("ESCROW"), id);
        storage.get(&key)
    }

    /// Release the escrow (marks completed). Caller must be the sender.
    pub fn release(env: Env, id: Symbol, caller: Address) -> Result<(), EscrowError> {
        let storage = env.storage().persistent();
        let key = (symbol_short!("ESCROW"), id);

        let mut esc: Escrow = storage.get(&key).ok_or(EscrowError::NotFound)?;

        if esc.completed {
            return Err(EscrowError::AlreadyCompleted);
        }

        if esc.sender != caller {
            return Err(EscrowError::NotSender);
        }

        esc.completed = true;
        storage.set(&key, &esc);
        Ok(())
    }

    /// Refund (mark completed/refunded). Caller must be the sender.
    pub fn refund(env: Env, id: Symbol, caller: Address) -> Result<(), EscrowError> {
        let storage = env.storage().persistent();
        let key = (symbol_short!("ESCROW"), id);

        let mut esc: Escrow = storage.get(&key).ok_or(EscrowError::NotFound)?;

        if esc.completed {
            return Err(EscrowError::AlreadyCompleted);
        }

        if esc.sender != caller {
            return Err(EscrowError::NotSender);
        }

        esc.completed = true;
        storage.set(&key, &esc);
        Ok(())
    }
}
