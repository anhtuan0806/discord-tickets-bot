# Design Specification: Ticket Creation Confirmation Workflow

## Overview
Adds a confirmation step before opening a ticket when a user interacts with a panel in Discord. Upon clicking "Create Ticket", the bot sends an ephemeral message with "Yes" (Có) and "No" (Không) buttons to confirm intent before spawning a ticket channel or showing modal questions.

## Data Flow & Architecture
1. **Trigger**: User clicks `create` button on a ticket panel.
2. **Confirmation Prompt**: `src/buttons/create.js` checks if confirmation is enabled. If enabled, responds with an ephemeral message containing:
   - Embed: "Are you sure you want to open a ticket in category X?"
   - ActionRow with 2 buttons:
     - `confirm_create:<categoryId>` (Green/Success button - "Có")
     - `cancel_create` (Red/Danger button - "Không")
3. **Execution**:
   - `src/buttons/confirm_create.js`: Calls `client.tickets.create({ categoryId, interaction })` to proceed with ticket modal or channel creation.
   - `src/buttons/cancel_create.js`: Updates the ephemeral message with "Ticket creation cancelled." and removes buttons.

## Data Schema Changes
Adds `requireConfirmation Boolean @default(true)` to `Category` model in:
- `db/postgresql/schema.prisma`
- `db/mysql/schema.prisma`
- `db/sqlite/schema.prisma`

## Localization (i18n)
Adds confirmation labels and buttons to `src/i18n/vi.yml` and `src/i18n/en-GB.yml`:
- `ticket.confirm_prompt.title`
- `ticket.confirm_prompt.description`
- `ticket.confirm_prompt.cancelled`
- `buttons.confirm_yes`
- `buttons.confirm_no`
