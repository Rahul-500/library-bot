require('dotenv').config()
const { setOverdueBookInterval } = require('./src/controllers/commands/setOverdueBookInterval');
const { connect } = require("./src/database");
const { clientOnLogin } = require("./src/events/clientOnLogin");
const { clientOnMemberAdd } = require('./src/events/clientOnMemberAdd');
const { clientOnMessageHandler } = require("./src/events/clientOnMessageHandler");
const { clientOnReady } = require("./src/events/clientOnReady");

const connectToDb = async () => {
  try {
    const connection = await connect();
    console.error("Connection successful to MySQL database");
    return connection;
  } catch (error) {
    console.error("Error connecting to MySQL database:", error);
    return null;
  }
}

const startBot = async () => {
  const connection = await connectToDb();
  if (!connection) {
    process.exit(-1);
  }
  const client = await clientOnLogin();

  clientOnMemberAdd(client)

  await clientOnReady(connection, client)

  setOverdueBookInterval(connection, client, null)

  clientOnMessageHandler(connection, client)
}

startBot();