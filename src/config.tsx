import {
  ActionPanel,
  Action,
  List,
  Form,
  showToast,
  Toast,
  Icon,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { execSync } from "child_process";

interface ConfigItem {
  key: string;
  value: string;
  description: string;
}

export default function Configuration() {
  const [config, setConfig] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      setLoading(true);

      // Pobierz różne elementy konfiguracji
      const configItems: ConfigItem[] = [];

      try {
        const token = execSync("bdy config get token", { encoding: "utf8" });
        configItems.push({
          key: "token",
          value: token.trim() ? "***configured***" : "Not set",
          description: "Authentication token",
        });
      } catch {}

      try {
        const region = execSync("bdy config get region", { encoding: "utf8" });
        configItems.push({
          key: "region",
          value: region.trim() || "Not set",
          description: "Server region",
        });
      } catch {}

      try {
        const timeout = execSync("bdy config get timeout", {
          encoding: "utf8",
        });
        configItems.push({
          key: "timeout",
          value: timeout.trim() || "Not set",
          description: "Connection timeout",
        });
      } catch {}

      setConfig(configItems);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to fetch configuration",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <List isLoading={loading} onRefresh={fetchConfig}>
      <List.EmptyView
        title="No Configuration Found"
        description="Set up your BDY configuration to get started"
        actions={
          <ActionPanel>
            <Action.Push
              title="Set Token"
              target={<SetConfigForm configKey="token" />}
              icon={Icon.Key}
            />
          </ActionPanel>
        }
      />

      {config.map((item) => (
        <List.Item
          key={item.key}
          title={item.key.toUpperCase()}
          subtitle={item.description}
          accessories={[{ text: item.value }]}
          actions={
            <ActionPanel>
              <Action.Push
                title={`Set ${item.key.toUpperCase()}`}
                target={
                  <SetConfigForm
                    configKey={item.key}
                    currentValue={item.value.includes("***") ? "" : item.value}
                  />
                }
                icon={Icon.Pencil}
              />
              <Action
                title="Refresh"
                onAction={fetchConfig}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
                icon={Icon.ArrowClockwise}
              />
            </ActionPanel>
          }
        />
      ))}

      <List.Item
        title="Add New Configuration"
        subtitle="Set token, region, timeout, etc."
        accessories={[{ icon: Icon.Plus }]}
        actions={
          <ActionPanel>
            <Action.Push
              title="Set Token"
              target={<SetConfigForm configKey="token" />}
              icon={Icon.Key}
            />
            <Action.Push
              title="Set Region"
              target={<SetConfigForm configKey="region" />}
              icon={Icon.Globe}
            />
            <Action.Push
              title="Set Timeout"
              target={<SetConfigForm configKey="timeout" />}
              icon={Icon.Clock}
            />
          </ActionPanel>
        }
      />
    </List>
  );
}

function SetConfigForm({
  configKey,
  currentValue = "",
}: {
  configKey: string;
  currentValue?: string;
}) {
  const [value, setValue] = useState(currentValue);

  async function handleSubmit() {
    if (!value.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Value is required",
      });
      return;
    }

    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Updating configuration...",
      });

      execSync(`bdy config set ${configKey} "${value}"`, { encoding: "utf8" });

      showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `${configKey.toUpperCase()} updated successfully`,
      });
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: `Failed to set ${configKey}`,
      });
    }
  }

  const getPlaceholder = (key: string) => {
    switch (key) {
      case "token":
        return "Enter your BDY authentication token";
      case "region":
        return "us, eu, asia, etc.";
      case "timeout":
        return "30s, 1m, etc.";
      default:
        return `Enter ${key} value`;
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={`Set ${configKey.toUpperCase()}`}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="value"
        title={configKey.toUpperCase()}
        value={value}
        onChange={setValue}
        placeholder={getPlaceholder(configKey)}
        info={
          configKey === "token"
            ? "Get your token from the BDY dashboard"
            : undefined
        }
      />
    </Form>
  );
}
