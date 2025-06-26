import {
  ActionPanel,
  Action,
  List,
  showToast,
  Toast,
  Icon,
  Color,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { execSync } from "child_process";

interface Tunnel {
  id: string;
  name: string;
  type: "HTTP" | "TCP" | "TLS";
  localAddress: string;
  publicUrl?: string;
  status: "active" | "stopped" | "error";
}

export default function ListTunnels() {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTunnels();
  }, []);

  async function fetchTunnels() {
    try {
      setLoading(true);
      // Sprawdź czy agent jest uruchomiony
      const agentStatus = execSync("bdy agent status", { encoding: "utf8" });

      if (
        agentStatus.includes("not running") ||
        agentStatus.includes("stopped")
      ) {
        setTunnels([]);
        showToast({
          style: Toast.Style.Failure,
          title: "Agent Not Running",
          message: "BDY agent is not running. Start it to see tunnels.",
        });
        return;
      }

      // Pobierz listę tuneli
      const result = execSync("bdy agent tunnel list", { encoding: "utf8" });
      const parsedTunnels = parseTunnelList(result);
      setTunnels(parsedTunnels);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message:
          "Failed to fetch tunnels. Make sure BDY CLI is installed and configured.",
      });
      setTunnels([]);
    } finally {
      setLoading(false);
    }
  }

  function parseTunnelList(output: string): Tunnel[] {
    // Parsing logic dla output bdy agent tunnel list
    // To będzie zależne od rzeczywistego formatu outputu
    const lines = output.split("\n").filter((line) => line.trim());
    return lines.map((line, index) => ({
      id: `tunnel-${index}`,
      name: `Tunnel ${index + 1}`,
      type: "HTTP" as const,
      localAddress: "localhost:3000",
      publicUrl: "https://example.buddy.works",
      status: "active" as const,
    }));
  }

  async function stopTunnel(tunnelId: string) {
    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Stopping tunnel...",
      });

      execSync(`bdy agent tunnel rm ${tunnelId}`, { encoding: "utf8" });

      showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: "Tunnel stopped successfully",
      });

      fetchTunnels();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to stop tunnel",
      });
    }
  }

  async function getTunnelStatus(tunnelId: string) {
    try {
      const result = execSync(`bdy agent tunnel status ${tunnelId}`, {
        encoding: "utf8",
      });
      showToast({
        style: Toast.Style.Success,
        title: "Tunnel Status",
        message: result,
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to get tunnel status",
      });
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return { source: Icon.Circle, tintColor: Color.Green };
      case "stopped":
        return { source: Icon.Circle, tintColor: Color.Red };
      case "error":
        return { source: Icon.Circle, tintColor: Color.Orange };
      default:
        return { source: Icon.Circle, tintColor: Color.SecondaryText };
    }
  };

  return (
    <List isLoading={loading} onRefresh={fetchTunnels}>
      {tunnels.length === 0 ? (
        <List.EmptyView
          title="No Active Tunnels"
          description="Create a new tunnel to get started"
        />
      ) : (
        tunnels.map((tunnel) => (
          <List.Item
            key={tunnel.id}
            title={tunnel.name}
            subtitle={`${tunnel.type} - ${tunnel.localAddress}`}
            accessories={[
              { text: tunnel.publicUrl || "No URL" },
              { icon: getStatusIcon(tunnel.status) },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Stop Tunnel"
                  onAction={() => stopTunnel(tunnel.id)}
                  icon={Icon.Stop}
                  style={Action.Style.Destructive}
                />
                <Action
                  title="Get Status"
                  onAction={() => getTunnelStatus(tunnel.id)}
                  icon={Icon.Info}
                />
                {tunnel.publicUrl && (
                  <Action.OpenInBrowser
                    title="Open Public URL"
                    url={tunnel.publicUrl}
                    icon={Icon.Globe}
                  />
                )}
                <Action.CopyToClipboard
                  title="Copy Public URL"
                  content={tunnel.publicUrl || "No URL available"}
                  icon={Icon.Clipboard}
                />
                <Action
                  title="Refresh"
                  onAction={fetchTunnels}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                  icon={Icon.ArrowClockwise}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
