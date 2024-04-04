require('dotenv').config()
const { connect } = require("./src/database");
const { clientLogin } = require("./src/events/clientLogin");
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
  const client = await clientLogin();

  clientOnMemberAdd(client)
  
  await clientOnReady(connection, client)

  clientOnMessageHandler(connection, client)
}

startBot();