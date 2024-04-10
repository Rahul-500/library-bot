exports.formatDate = (date) => {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return formattedDate !== "Invalid Date" ? formattedDate : "";
}
