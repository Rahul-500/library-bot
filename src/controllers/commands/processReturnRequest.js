const { notifyUserAboutReturnRequest } = require("../../service/notifier");
const constants = require("../../constants/constant")
const { updateReturnRequestStatusQuery } = require("../../service/queries/updateReturnRequestStatusQuery");

exports.processReturnRequest = async (client, message, connection, returnRequests, userEventsMap) => {
    try {
        const returnRequestsMap = new Map();
        let count = 1;
        returnRequests.forEach((request, index) => {
            returnRequestsMap.set(count++, request);
        });
        const authorId = message.author.id;

        await message.reply(constants.CHANGE_RETURN_REQUEST_STATUS_MESSAGE);

        const collector = message.channel.createMessageCollector();

        userEventsMap.get(authorId).messageCreate = false;

        const regexPatternForApprove = /^\/approve\s\d{1,}$/;
        const regexPatternForDecline = /^\/decline\s\d{1,}$/;

        collector.on("collect", async (response) => {
            if (response.content.toLowerCase() === "exit") {
                message.reply(constants.EXIT_VIEW_RETURN_MESSAGE);
                collector.stop();
                return;
            }
            if (
                !regexPatternForApprove.test(response.content) &&
                !regexPatternForDecline.test(response.content)
            ) {

                message.reply(constants.INVALID_CHANGE_OF_APPROVAL_FOR_RETURN_DETAILS_MESSAGE);
                collector.stop();
                return;
            }

            const parsedVirtualId = parseInt(response.content.split(" ")[1]);
            const updateStatusTo =
                response.content.split(" ")[0] === "/approve" ? "approved" : "declined";
            const returnRequest = returnRequestsMap.get(parsedVirtualId);

            if (!returnRequestsMap.has(parsedVirtualId)) {
                message.reply(constants.INVALID_RETURN_REQUEST_ID_MESSAGE);
            } else {
                message.reply(constants.CHANGE_OF_RETURN_STATUS_RECEIVED);
                const updatedResult = await updateReturnRequestStatusQuery(
                    connection,
                    returnRequest,
                    updateStatusTo
                );
                if (!updatedResult) {
                    message.reply(constants.ERROR_CHANGING_RETURN_REQUEST_STATUS_MESSAGE);
                } else {
                    message.reply(
                        constants.SUCCESSFULL_UPDATE_RETURN_REQUEST_STATUS_MESSAGE,
                    );
                    await notifyUserAboutReturnRequest(
                        client,
                        returnRequest,
                        updateStatusTo
                    );
                }
            }

            collector.stop();
        });

        collector.on("end", () => {
            userEventsMap.get(authorId).messageCreate = true;
        });
    } catch (error) {
        message.reply(
            constants.UNEXPECTED_CHANGING_BOOK_RETURN_STATUS_ERROR_MESSAGE,
        );
        collector.stop();
    }
}