# Introduction

This project implements a simplified Business Support System (BSS) / Operations Support System (OSS) demo.  It includes a customer relationship management system, product and offer catalogues, ticketing, inventory management and an end‑to‑end provisioning wizard for orders.  The goal is to provide a self‑contained front‑end for exploring how offers map to orders and how complex provisioning workflows can be modelled entirely in the browser using JSON data and `localStorage`.

# Getting Started
TODO: Guide users through getting your code up and running on their own system. In this section you can talk about:
1.	Installation process
2.	Software dependencies
3.	Latest releases
4.	API references

# Build and Test
TODO: Describe and show how to build your code and run the tests. 

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