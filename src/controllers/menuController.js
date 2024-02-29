exports.menu = (message,commandsController) => {

    if (message.author.bot) return;

    if (message.content.startsWith('/')) {
        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        
        switch (command) {
            case 'start':
                commandsController.start(message)
                break;
        }
    }
}