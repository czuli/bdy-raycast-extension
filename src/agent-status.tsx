import { Detail, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { execSync } from "child_process";

interface AgentInfo {
  status: string;
  version: string;
  isInstalled: boolean;
}

export default function AgentStatus() {
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentStatus();
  }, []);

  async function fetchAgentStatus() {
    try {
      setLoading(true);

      // Sprawdź status agenta
      const statusResult = execSync("bdy agent status", { encoding: "utf8" });

      // Sprawdź wersję
      const versionResult = execSync("bdy agent version", { encoding: "utf8" });

      setAgentInfo({
        status: statusResult.trim(),
        version: versionResult.trim(),
        isInstalled: !statusResult.toLowerCase().includes("not installed"),
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to fetch agent status",
      });
      setAgentInfo({
        status: "Error fetching status",
        version: "Unknown",
        isInstalled: false,
      });
    } finally {
      setLoading(false);
    }
  }

  async function startAgent() {
    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Starting agent...",
      });

      execSync("bdy agent start", { encoding: "utf8" });

      showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: "Agent started successfully",
      });

      fetchAgentStatus();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to start agent",
      });
    }
  }

  async function stopAgent() {
    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Stopping agent...",
      });

      execSync("bdy agent stop", { encoding: "utf8" });

      showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: "Agent stopped successfully",
      });

      fetchAgentStatus();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to stop agent",
      });
    }
  }

  async function restartAgent() {
    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Restarting agent...",
      });

      execSync("bdy agent restart", { encoding: "utf8" });

      showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: "Agent restarted successfully",
      });

      fetchAgentStatus();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to restart agent",
      });
    }
  }

  async function updateAgent() {
    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Updating agent...",
      });

      execSync("bdy agent update", { encoding: "utf8" });

      showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: "Agent updated successfully",
      });

      fetchAgentStatus();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to update agent",
      });
    }
  }

  const isRunning =
    agentInfo?.status.toLowerCase().includes("running") || false;

  const markdown = agentInfo
    ? `
# BDY Agent Status

**Status:** ${agentInfo.status}  
**Version:** ${agentInfo.version}  
**Installed:** ${agentInfo.isInstalled ? "✅ Yes" : "❌ No"}

${isRunning ? "🟢 **Agent is running**" : "🔴 **Agent is not running**"}

## Quick Actions
Use the actions below to manage the BDY agent service.
  `
    : "Loading agent status...";

  return (
    <Detail
      isLoading={loading}
      markdown={markdown}
      actions={
        <ActionPanel>
          {!isRunning ? (
            <Action title="Start Agent" onAction={startAgent} />
          ) : (
            <Action title="Stop Agent" onAction={stopAgent} />
          )}
          <Action title="Restart Agent" onAction={restartAgent} />
          <Action title="Update Agent" onAction={updateAgent} />
          <Action
            title="Refresh"
            onAction={fetchAgentStatus}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
        </ActionPanel>
      }
    />
  );
}
