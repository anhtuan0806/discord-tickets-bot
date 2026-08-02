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
