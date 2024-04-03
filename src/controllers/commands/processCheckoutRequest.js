const { updateCheckoutRequestStatus } = require("../../service/databaseService");
const { notifyUserAboutCheckoutRequest } = require("../../service/notifier");
const constants = require("../../constants/constant")

exports.processCheckoutRequest = async (client, message, connection, checkoutRequests, userEventsMap) => {
    try {
        const checkoutRequestsMap = new Map();
        let count = 1;
        checkoutRequests.forEach((request, index) => {
            checkoutRequestsMap.set(count++, request);
        });
        const authorId = message.author.id;

        await message.reply(constants.CHANGE_CHECKOUT_REQUEST_STATUS_MESSAGE);

        const collector = message.channel.createMessageCollector();

        userEventsMap.get(authorId).messageCreate = false;

        const regexPatternForApprove = /^\/approve\s\d{1,}$/;
        const regexPatternForDecline = /^\/decline\s\d{1,}$/;

        collector.on("collect", async (response) => {
            if (response.content.toLowerCase() === "exit") {
                message.reply(constants.EXIT_VIEW_CHECKOUT_MESSAGE);
                collector.stop();
                return;
            }
            if (
                !regexPatternForApprove.test(response.content) &&
                !regexPatternForDecline.test(response.content)
            ) {

                message.reply(constants.INVALID_CHANGE_OF_APPROVAL_FOR_CHECKOUT_DETAILS_MESSAGE);
                collector.stop();
                return;
            }

            const parsedVirtualId = parseInt(response.content.split(" ")[1]);
            const updateStatusTo =
                response.content.split(" ")[0] === "/approve" ? "approved" : "declined";
            const checkoutRequest = checkoutRequestsMap.get(parsedVirtualId);

            if (!checkoutRequestsMap.has(parsedVirtualId)) {
                message.reply(constants.INVALID_CHECKOUT_REQUEST_ID_MESSAGE);
            } else {
                message.reply(constants.CHANGE_OF_CHECKOUT_STATUS_RECEIVED);
                const updatedResult = await updateCheckoutRequestStatus(
                    connection,
                    checkoutRequest,
                    updateStatusTo
                );
                if (!updatedResult) {
                    message.reply(constants.ERROR_CHANGING_CHECKOUT_REQUEST_STATUS_MESSAGE);
                } else {
                    message.reply(
                        constants.SUCCESSFULL_UPDATE_CHECKOUT_REQUEST_STATUS_MESSAGE,
                    );
                    await notifyUserAboutCheckoutRequest(
                        client,
                        checkoutRequest,
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
            constants.UNEXPECTED_CHANGING_BOOK_CHECKOUT_STATUS_ERROR_MESSAGE,
        );
        collector.stop();
    }
}