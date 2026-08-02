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
