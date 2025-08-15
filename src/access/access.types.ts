import { BigNumberish, Overrides, Signer } from "ethers";

export interface Role {
  roleId: Number;
  selectors: string[];
};

export interface Role {
  id: bigint;   // uint64 roleId
  label: string;
}

export const ROLES = {
  ADMIN:     { roleId: 0n,                       label: 'Admin'    },
  UPGRADER:  { roleId: 1n,                       label: 'Upgrader' },
  PAUSER:    { roleId: 2n,                       label: 'Pauser'   },
  OPERATOR:  { roleId: 3n,                       label: 'Operator' },
  PUBLIC:    { roleId: (2n ** 64n) - 1n,         label: 'Public'   },
} as const;

// 'ADMIN' | 'MODERATOR' | ...
export type RoleKey = keyof typeof ROLES;
// { roleId: bigint; label: string; }
export type RoleValue = (typeof ROLES)[RoleKey];


export interface GrantRoleParams{
    signer: Signer;
    roleId: bigint;
    account: string,
    executionDelay: number,
    overrides?: Overrides;
}

//function setTargetFunctionRole(address target, bytes4[] selectors, uint64 roleId)
export interface SetTargetFunctionRoleParams{
    signer: Signer;
    target: string;
    selectors: string[],
    roleId: bigint,
    overrides?: Overrides;
}

export interface SelectorRole {
    selector: string;
    roleId: bigint
}

export type FunctionRoleObj = Record<string, { roleId: bigint }>;

export interface FunctionRole {
  selector: string,
  name: string;
  role: string | undefined
  roleId: bigint,
  stateMutability: string
}