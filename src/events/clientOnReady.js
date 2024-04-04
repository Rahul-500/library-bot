exports.clientOnReady = async (connection, client) => {
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });
}