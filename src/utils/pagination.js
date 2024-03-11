const { pagination, ButtonTypes, ButtonStyles } = require('@devraelfreeze/discordjs-pagination');

exports.pagination = async (message, embeds) => {
    await pagination({
        embeds: embeds,
        author: message.author,
        ephemeral: true,
        time: 80000,
        message: message,
        disableButtons: false,
        fastSkip: false,
        pageTravel: false,
        buttons: [
            {
                type: ButtonTypes.previous,
                label: 'Previous Page',
                style: ButtonStyles.Primary
            },
            {
                type: ButtonTypes.next,
                label: 'Next Page',
                style: ButtonStyles.Success
            }
        ]
    });
}