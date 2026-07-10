# Tab 6: Automation

## 1. Purpose and Role
The Automation tab is the "Logic Engine" of the platform. While the Sequences tab is just for sending messages, the Automation tab is for creating complex "If This, Then That" rules that run in the background. Its role is to remove tedious manual labor from the sales process by having the system react to events automatically.

## 2. Proposed Alternative Naming Conventions
- **Workflow Builder** (Describes the UI perfectly)
- **Logic Engine** (Highlights the technical power behind it)
- **Smart Rules** (Friendly and easy to understand)

## 3. Key Components and Features

### The Visual Node Canvas (React Flow)
- **What it is:** A massive drag-and-drop canvas where users physically draw their logic.
- **Components:** 
  - **Trigger Nodes** (e.g., "When a Lead is Created")
  - **Action Nodes** (e.g., "Send a Slack Message")
  - **Edges** (The connecting wires between nodes)
- **Use Case:** A manager wants to ensure no lead is forgotten. They drag a "Lead Added" trigger, wire it to a "Wait 2 Days" node, and wire that to an "Add Task: Follow Up" action.

### Node Configuration Sidebar
- **What it is:** A panel that slides out when you click on a node.
- **Components:** Input fields to set exactly what that node does (e.g., typing the actual Slack message that will be sent).
- **Use Case:** Used to customize the generic nodes dropped onto the canvas into highly specific business rules.

### Activation Toggle
- **What it is:** A master switch for the workflow.
- **Components:** A simple on/off toggle.
- **Use Case:** Allows users to build and test their logic in a safe "Draft" mode, and then flip the switch to make it live when they are ready.

## 4. Navigation & Links to Other Pages
- **Impacts Everything:** The Automation tab is unique because it doesn't just link to other pages; it *controls* them. A workflow built here might automatically move a card in the **Pipeline**, add a row in the **Tasks** tab, or send a message via the **Communications** tab.
