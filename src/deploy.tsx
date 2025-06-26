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

export default function Deploy() {
  const [serviceName, setServiceName] = useState("");
  const [environment, setEnvironment] = useState("production");

  async function handleDeploy() {
    if (!serviceName.trim()) {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Service name is required",
      });
      return;
    }

    try {
      showToast({
        style: Toast.Style.Animated,
        title: "Deploying...",
        message: `Deploying ${serviceName} to ${environment}`,
      });

      const command = `bdy deploy ${serviceName} --env ${environment}`;
      execSync(command, { encoding: "utf8" });

      showToast({
        style: Toast.Style.Success,
        title: "Success",
        message: `${serviceName} deployed successfully to ${environment}`,
      });

      popToRoot();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Deployment Failed",
        message: "Check the logs for more details",
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Deploy" onSubmit={handleDeploy} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="serviceName"
        title="Service Name"
        value={serviceName}
        onChange={setServiceName}
        placeholder="Enter service name"
      />
      <Form.Dropdown
        id="environment"
        title="Environment"
        value={environment}
        onChange={setEnvironment}
      >
        <Form.Dropdown.Item value="development" title="Development" />
        <Form.Dropdown.Item value="staging" title="Staging" />
        <Form.Dropdown.Item value="production" title="Production" />
      </Form.Dropdown>
    </Form>
  );
}
