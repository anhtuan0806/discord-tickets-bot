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
