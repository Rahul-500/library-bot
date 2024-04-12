const { checkOverdueBooks } = require('../../service/notifier');
const constants = require('../../constants/constant');
const { getOverdueBookIntervalQuery } = require("../../service/queries/getOverdueBookIntervalQuery");
const { setOverdueBookIntervalQuery } = require("../../service/queries/setOverdueBookIntervalQuery");

let intervalId;

exports.setOverdueBookInterval = async (connection, client, message) => {
    try {
        let timeInterval;

        if (message) {
            const content = message.content;
            timeInterval = parseInt(content.split(" ")[1]);
            await setOverdueBookIntervalQuery(connection, timeInterval);
            message.reply(constants.SUCCESSFULL_SET_OVERDUE_BOOK_INTERVAL_MESSAGE);
        }

        const result = await getOverdueBookIntervalQuery(connection);
        timeInterval = result[0].setting_value

        if (intervalId) {
            clearInterval(intervalId);
        }

        intervalId = setInterval(() => {
            checkOverdueBooks({ connection, client, timeInterval });
        }, constants.TIME_INTERVAL_FOR_DUE_NOTIFICATION);
    } catch (error) {
        message.reply(constants.ERROR_SET_OVERDUE_BOOK_INTERVAL_MESSAGE);
    }
};
