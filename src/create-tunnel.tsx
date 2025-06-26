// src/create-tunnel.tsx
import {
  ActionPanel,
  Action,
  Form,
  showToast,
  Toast,
  popToRoot,
} from "@raycast/api";
import { useState } from "react";
import { execSync } from "child_process";

export default function CreateTunnel() {
  const [tunnelType, setTunnelType] = useState("http");
  const [localAddress, setLocalAddress] = useState("localhost:3000");
  const [tunnelName, setTunnelName] = useState("");
  const [subdomain, setSubdomain] = useState("");

  async function handleCreateTunnel() {
    if (!localAddress.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Local address is required",
      });
      return;
    }

    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Creating tunnel...",
        message: `Creating ${tunnelType.toUpperCase()} tunnel`,
      });

      let command = "";

      switch (tunnelType) {
        case "http":
          command = `bdy agent tunnel http ${localAddress}`;
          if (subdomain) {
            command += ` --subdomain ${subdomain}`;
          }
          break;
        case "tcp":
          command = `bdy agent tunnel tcp ${localAddress}`;
          break;
        case "tls":
          command = `bdy agent tunnel tls ${localAddress}`;
          break;
      }

      if (tunnelName) {
        // Jeśli jest nazwa, dodaj do konfiguracji
        execSync(
          `bdy config add --name ${tunnelName} --type ${tunnelType} --local ${localAddress}`,
          { encoding: "utf8" },
        );
        command = `bdy agent tunnel start ${tunnelName}`;
      }

      const result = execSync(command, { encoding: "utf8" });

      showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `${tunnelType.toUpperCase()} tunnel created successfully`,
      });

      popToRoot();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Creation Failed",
        message: "Failed to create tunnel. Check your configuration.",
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Tunnel"
            onSubmit={handleCreateTunnel}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="tunnelType"
        title="Tunnel Type"
        value={tunnelType}
        onChange={setTunnelType}
      >
        <Form.Dropdown.Item value="http" title="HTTP/HTTPS" />
        <Form.Dropdown.Item value="tcp" title="TCP" />
        <Form.Dropdown.Item value="tls" title="TLS" />
      </Form.Dropdown>

      <Form.TextField
        id="localAddress"
        title="Local Address"
        value={localAddress}
        onChange={setLocalAddress}
        placeholder="localhost:3000"
        info="The local address to tunnel (host:port)"
      />

      <Form.TextField
        id="tunnelName"
        title="Tunnel Name (Optional)"
        value={tunnelName}
        onChange={setTunnelName}
        placeholder="my-app"
        info="Save tunnel configuration with this name"
      />

      {tunnelType === "http" && (
        <Form.TextField
          id="subdomain"
          title="Subdomain (Optional)"
          value={subdomain}
          onChange={setSubdomain}
          placeholder="myapp"
          info="Request a specific subdomain"
        />
      )}
    </Form>
  );
}
