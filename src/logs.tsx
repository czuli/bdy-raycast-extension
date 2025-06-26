import {
  ActionPanel,
  Action,
  List,
  Detail,
  showToast,
  Toast,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { execSync } from "child_process";

export default function ViewLogs() {
  const [services, setServices] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const result = execSync("bdy list --json", { encoding: "utf8" });
      const parsedServices = JSON.parse(result);
      setServices(parsedServices.map((s: any) => s.name));
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to fetch services",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchLogs(serviceName: string) {
    try {
      setSelectedService(serviceName);
      const result = execSync(`bdy logs ${serviceName} --tail 100`, {
        encoding: "utf8",
      });
      setLogs(result);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: `Failed to fetch logs for ${serviceName}`,
      });
    }
  }

  if (selectedService) {
    return (
      <Detail
        markdown={`# Logs for ${selectedService}\n\n\`\`\`\n${logs}\n\`\`\``}
        actions={
          <ActionPanel>
            <Action
              title="Back to Services"
              onAction={() => setSelectedService(null)}
            />
            <Action
              title="Refresh Logs"
              onAction={() => fetchLogs(selectedService)}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <List isLoading={loading}>
      {services.map((service) => (
        <List.Item
          key={service}
          title={service}
          actions={
            <ActionPanel>
              <Action title="View Logs" onAction={() => fetchLogs(service)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
