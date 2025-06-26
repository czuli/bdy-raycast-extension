/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `list-tunnels` command */
  export type ListTunnels = ExtensionPreferences & {}
  /** Preferences accessible in the `create-tunnel` command */
  export type CreateTunnel = ExtensionPreferences & {}
  /** Preferences accessible in the `agent-status` command */
  export type AgentStatus = ExtensionPreferences & {}
  /** Preferences accessible in the `config` command */
  export type Config = ExtensionPreferences & {}
  /** Preferences accessible in the `quick-http` command */
  export type QuickHttp = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `list-tunnels` command */
  export type ListTunnels = {}
  /** Arguments passed to the `create-tunnel` command */
  export type CreateTunnel = {}
  /** Arguments passed to the `agent-status` command */
  export type AgentStatus = {}
  /** Arguments passed to the `config` command */
  export type Config = {}
  /** Arguments passed to the `quick-http` command */
  export type QuickHttp = {}
}

