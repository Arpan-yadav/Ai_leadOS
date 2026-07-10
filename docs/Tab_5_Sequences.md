# Tab 5: Sequences

## 1. Purpose and Role
The Sequences tab is where users design and execute their automated outreach campaigns. Instead of sending emails one by one, a user can create a "Sequence" (e.g., Email 1 on Day 1, a LinkedIn message on Day 3, and a follow-up email on Day 5). Its role is to scale a single sales rep's effort so they can contact hundreds of leads effortlessly.

## 2. Proposed Alternative Naming Conventions
- **Outreach Campaigns** (Highly descriptive for marketing/sales teams)
- **Engagement Flows** (Sounds modern and continuous)
- **Automated Outreach** (Exactly describes what it does)

## 3. Key Components and Features

### Sequence Library
- **What it is:** A gallery view of all available outreach campaigns.
- **Components:** Cards showing the name of the sequence, its status (Active/Draft), and the number of steps it contains.
- **Use Case:** A user browses here to find the "Q3 Cold Email Push" sequence to see if it's ready to be used.

### "Enroll Leads" Modal
- **What it is:** An interactive popup window used to inject people into a sequence.
- **Components:** A list of leads with checkboxes. The user selects who they want to target and clicks "Enroll".
- **Use Case:** A rep just imported 50 new contacts from a tradeshow and uses this modal to drop all 50 of them into the "Tradeshow Follow-Up" sequence simultaneously.

### Active Enrollments View
- **What it is:** A tracking table for currently running sequences.
- **Components:** Shows which leads are currently receiving messages from which sequence, and what step they are on.
- **Use Case:** Provides oversight. If a manager wants to ensure the team is actually prospecting, they check this view to verify that emails are going out.

## 4. Navigation & Links to Other Pages
- **From Leads:** Users often navigate from the **Leads** tab (where they found their targets) into this tab to actually execute the messaging.
- **To Automation:** While Sequences handle the *messaging*, complex logic (like "If they click this link, move them to the Pipeline") is configured in the **Automation** tab.
