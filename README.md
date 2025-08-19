# Introduction

This project implements a simplified Business Support System (BSS) / Operations Support System (OSS) demo.  It includes a customer relationship management system, product and offer catalogues, ticketing, inventory management and an end‑to‑end provisioning wizard for orders.  The goal is to provide a self‑contained front‑end for exploring how offers map to orders and how complex provisioning workflows can be modelled entirely in the browser using JSON data and `localStorage`.

# Getting Started

This project is a purely front‑end demo built with Vite and React.  To run it locally you need a recent version of Node.js (we used **Node 24.1.0**).  We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage your Node versions.

## Installation

1. **Clone the repository** and change into the project directory:

   ```bash
   git clone https://github.com/jasmina-husic/bss_oss.git
   cd bss_oss
   ```

2. **Install Node 24.1.0** using nvm (if not already installed):

   ```bash
   nvm install 24.1.0
   nvm use 24.1.0
   ```

3. **Install dependencies** via npm:

   ```bash
   npm install
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

   Vite will start the application at `http://localhost:5173/` by default.  You can then explore the CRM, catalogue, ticketing and provisioning workflows in your browser.

# Build and Test

There is no back‑end in this demo; all data is stored in JSON files under `public/data` and persisted to `localStorage` at runtime.  To reset the application state you can clear your browser’s localStorage.  To build the project for production run `npm run build`.  Automated tests are not included in this demo.

# Contribute
TODO: Explain how other users and developers can contribute to make your code better. 

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:
- [ASP.NET Core](https://github.com/aspnet/Home)
- [Visual Studio Code](https://github.com/Microsoft/vscode)
- [Chakra Core](https://github.com/Microsoft/ChakraCore)

## Order Provisioning Workflow

The provisioning wizard guides users through configuring and deploying orders derived from catalogue offers.  Each offer contains an **activation sequence**—an ordered list of high‑level workflow steps such as “Allocate hardware,” “Configure devices,” “Install on site” or “Ship & install,” and “Commission network.”  When a new order is created from an offer, the wizard now builds its steps dynamically from this sequence:

- **Order Review & Confirmation** – always the first step.  Users can review equipment, customer details and project timeline.
- **Inventory Allocation** – shown only if the offer’s activation sequence includes **Allocate hardware**.  This step lets users assign devices from stock and capture allocation notes.
- **Device Setup & Configuration** – shown only if **Configure devices** is present.  Separate tabs are displayed for firewalls, switches and access points; each device’s template fields can be edited.  The wizard will skip this step entirely for discount‑only offers that do not require device configuration.
- **Testing & Validation** and **Final Validation Checklist** – always included.  These pages allow users to run automated tests, reset or retry failed tests, and complete checklists for hardware, configuration, licensing and documentation.
- **Deployment Planning & Scheduling** – included when the activation sequence contains **Install on site** or **Ship & install**.  Users can schedule installation, view the installation team and ensure the deployment kit is ready.  This step is omitted for purely cloud‑based or licence‑only offers.
- **Go‑Live & Customer Handover** – always the final step.  Users can review deployment summary information, validate that the network is up and handover documentation and training details to the customer.

Once an order has been instantiated from an offer its workflow is **immutable**—the wizard derives its steps from the activation sequence at the moment of creation and stores them in the order record.  If you edit an offer’s workflow afterwards, existing orders are unaffected.

Each product in the catalogue can optionally reference a **device template** via a `deviceTemplateId`.  When an order is generated the fulfilment service uses this identifier to look up a template in `device_templates.json` and builds a per‑device configuration form.  Templates group fields into sections and assign a **type** (e.g. `firewall`, `switch`, `accessPoint`), which determines which sub‑page under **Device Setup & Configuration** the form appears on.  If a product lacks a template or the template is missing, the wizard falls back to a simple free‑text **Custom Configuration** field.

To link a product to a template, edit the product in the **Catalog → Products** page and select a device template.  A preview panel shows the fields included in the template.  When you create an order from an offer containing that product, the wizard will automatically show a configuration form for each device instance of that type.

### Fake Data and Cancellation

To speed up testing, the wizard header includes two utility actions:

- **Fill Fake Data**: Populates all empty fields across the wizard with sample values, allocates all required equipment, runs all tests, checks every validation item and marks the deployment timeline as completed.  You can still review and adjust the data before finishing.
- **Cancel Order**: Marks the current order’s status as `cancelled` and returns to the orders list.  Cancelled orders remain in the system for history but can no longer progress through the wizard.

### Adding New Workflow Steps

If you introduce additional steps to an activation sequence (for example, a “Ship & install” step), you can map them to existing wizard pages or create new ones.  The dynamic step calculation in `Wizard.jsx` looks for specific keywords in the order’s `activationSequence` array:

```
Allocate hardware     → Inventory Allocation
Configure devices     → Device Setup & Configuration (tabs for each device type)
Install on site / Ship & install → Deployment Planning & Scheduling
Commission network    → Go‑Live & Customer Handover
```

Any activation step that doesn’t match these keywords is currently ignored.  Mandatory steps (review, testing, validation and go‑live) are always present.