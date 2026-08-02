# Ticket Confirmation Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a confirmation step with "Có" (Yes) and "Không" (No) buttons when a user clicks a "Tạo ticket" button on a panel in Discord.

**Architecture:** Modify `src/buttons/create.js` to send an ephemeral confirmation message with action row buttons (`confirm_create:<categoryId>` and `cancel_create`). Add corresponding button interaction handlers in `src/buttons/confirm_create.js` and `src/buttons/cancel_create.js`. Add translations to `src/i18n/vi.yml` and `src/i18n/en-GB.yml`.

**Tech Stack:** Node.js, `discord.js` v14, YAML i18n.

## Global Constraints

- Use `discord.js` v14 components (`ActionRowBuilder`, `ButtonBuilder`, `ButtonStyle`, `ExtendedEmbedBuilder`, `MessageFlags`).
- Maintain existing i18n structure in `src/i18n/vi.yml` and `src/i18n/en-GB.yml`.
- Ensure interaction replies use `flags: MessageFlags.Ephemeral` for privacy.

---

### Task 1: Add i18n Translations for Ticket Confirmation

**Files:**
- Modify: `src/i18n/vi.yml`
- Modify: `src/i18n/en-GB.yml`

**Interfaces:**
- Consumes: `getMessage` i18n helper
- Produces: `buttons.confirm_yes`, `buttons.confirm_no`, `ticket.confirm_prompt.title`, `ticket.confirm_prompt.description`, `ticket.confirm_prompt.cancelled`

- [ ] **Step 1: Update `src/i18n/vi.yml` with confirmation strings**

Add under `buttons:`:
```yaml
  confirm_yes:
    emoji: ✅
    text: Có
  confirm_no:
    emoji: ✖️
    text: Không
```

Add under `ticket:`:
```yaml
  confirm_prompt:
    title: ❓ Xác nhận mở Ticket
    description: Bạn có chắc chắn muốn tạo ticket hỗ trợ trong danh mục **{category}** không?
    cancelled: ❌ Đã hủy thao tác mở ticket.
```

- [ ] **Step 2: Update `src/i18n/en-GB.yml` with confirmation strings**

Add under `buttons:`:
```yaml
  confirm_yes:
    emoji: ✅
    text: Yes
  confirm_no:
    emoji: ✖️
    text: No
```

Add under `ticket:`:
```yaml
  confirm_prompt:
    title: ❓ Confirm Ticket Creation
    description: Are you sure you want to create a support ticket in **{category}**?
    cancelled: ❌ Ticket creation cancelled.
```

- [ ] **Step 3: Commit i18n changes**

```bash
git add src/i18n/vi.yml src/i18n/en-GB.yml
git commit -m "i18n: add ticket confirmation prompt and button strings"
```

---

### Task 2: Modify `src/buttons/create.js` to Send Ephemeral Confirmation Message

**Files:**
- Modify: `src/buttons/create.js`

**Interfaces:**
- Consumes: `interaction`, `id.target`, `client.tickets.getCategory`, `getMessage`
- Produces: Ephemeral interaction response with `confirm_create:<categoryId>` and `cancel_create` buttons.

- [ ] **Step 1: Update `src/buttons/create.js`**

```javascript
const { Button } = require('@eartharoid/dbf');
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
} = require('discord.js');
const ExtendedEmbedBuilder = require('../lib/embed');

module.exports = class CreateButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'create',
		});
	}

	/**
	 * @param {*} id
	 * @param {import("discord.js").ButtonInteraction} interaction
	 */
	async run(id, interaction) {
		const categoryId = Number(id.target);
		const category = await this.client.tickets.getCategory(categoryId);
		const guildLocale = category?.guild?.locale || 'en-GB';
		const getMessage = this.client.i18n.getLocale(guildLocale);

		const categoryName = category ? category.name : 'Category';

		const embeds = [
			new ExtendedEmbedBuilder({
				iconURL: interaction.guild?.iconURL(),
				text: category?.guild?.footer || '',
			})
				.setColor(category?.guild?.primaryColour || '#009999')
				.setTitle(getMessage('ticket.confirm_prompt.title'))
				.setDescription(getMessage('ticket.confirm_prompt.description', { category: categoryName })),
		];

		const components = [
			new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId(JSON.stringify({
						action: 'confirm_create',
						target: categoryId,
						topic: id.topic,
					}))
					.setStyle(ButtonStyle.Success)
					.setEmoji(getMessage('buttons.confirm_yes.emoji'))
					.setLabel(getMessage('buttons.confirm_yes.text')),
				new ButtonBuilder()
					.setCustomId(JSON.stringify({ action: 'cancel_create' }))
					.setStyle(ButtonStyle.Danger)
					.setEmoji(getMessage('buttons.confirm_no.emoji'))
					.setLabel(getMessage('buttons.confirm_no.text')),
			),
		];

		await interaction.reply({
			components,
			embeds,
			flags: MessageFlags.Ephemeral,
		});
	}
};
```

- [ ] **Step 2: Commit `src/buttons/create.js`**

```bash
git add src/buttons/create.js
git commit -m "feat: show confirmation prompt on create ticket button click"
```

---

### Task 3: Create Button Handlers `confirm_create.js` and `cancel_create.js`

**Files:**
- Create: `src/buttons/confirm_create.js`
- Create: `src/buttons/cancel_create.js`

**Interfaces:**
- Consumes: `id.target`, `id.topic`, `client.tickets.create`
- Produces: Confirmed ticket creation execution and cancellation interaction update.

- [ ] **Step 1: Create `src/buttons/confirm_create.js`**

```javascript
const { Button } = require('@eartharoid/dbf');

module.exports = class ConfirmCreateButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'confirm_create',
		});
	}

	/**
	 * @param {*} id
	 * @param {import("discord.js").ButtonInteraction} interaction
	 */
	async run(id, interaction) {
		await this.client.tickets.create({
			categoryId: id.target,
			interaction,
			topic: id.topic,
		});
	}
};
```

- [ ] **Step 2: Create `src/buttons/cancel_create.js`**

```javascript
const { Button } = require('@eartharoid/dbf');
const ExtendedEmbedBuilder = require('../lib/embed');

module.exports = class CancelCreateButton extends Button {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'cancel_create',
		});
	}

	/**
	 * @param {*} id
	 * @param {import("discord.js").ButtonInteraction} interaction
	 */
	async run(id, interaction) {
		const getMessage = this.client.i18n.getLocale(interaction.guild?.locale || 'en-GB');

		await interaction.update({
			components: [],
			embeds: [
				new ExtendedEmbedBuilder()
					.setColor('Red')
					.setTitle(getMessage('ticket.confirm_prompt.title'))
					.setDescription(getMessage('ticket.confirm_prompt.cancelled')),
			],
		});
	}
};
```

- [ ] **Step 3: Commit new button handlers**

```bash
git add src/buttons/confirm_create.js src/buttons/cancel_create.js
git commit -m "feat: add confirm_create and cancel_create button handlers"
```

---

### Task 4: Push Changes to GitHub for Render Deployment

**Files:**
- Remote: `origin/main`

- [ ] **Step 1: Push commits to GitHub**

```bash
git push origin main
```
