import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { execSync } from "child_process";

interface Service {
  name: string;
  status: string;
  url?: string;
  lastDeploy?: string;
}

export default function ListServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      // Sprawdź czy bdy jest zainstalowane
      const result = execSync("bdy list --json", { encoding: "utf8" });
      const parsedServices = JSON.parse(result);
      setServices(parsedServices);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message:
          "Failed to fetch services. Make sure BDY CLI is installed and configured.",
      });
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  async function deployService(serviceName: string) {
    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Deploying...",
        message: `Deploying ${serviceName}`,
      });

      execSync(`bdy deploy ${serviceName}`, { encoding: "utf8" });

      showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `${serviceName} deployed successfully`,
      });

      fetchServices(); // Odśwież listę
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Deployment Failed",
        message: `Failed to deploy ${serviceName}`,
      });
    }
  }

  return (
    <List isLoading={loading} onRefresh={fetchServices}>
      {services.map((service) => (
        <List.Item
          key={service.name}
          title={service.name}
          subtitle={service.status}
          accessories={[{ text: service.lastDeploy || "Never deployed" }]}
          actions={
            <ActionPanel>
              <Action
                title="Deploy"
                onAction={() => deployService(service.name)}
              />
              <Action
                title="View Logs"
                onAction={() => {
                  // Otwórz komendę logs z parametrem
                }}
              />
              {service.url && (
                <Action.OpenInBrowser
                  title="Open in Browser"
                  url={service.url}
                />
              )}
              <Action
                title="Refresh"
                onAction={fetchServices}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
