module.exports = {
    getcurrentdate: (asd) => {
        // current timestamp in milliseconds
        let ts = Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" });

        let date_obj = new Date(ts);
        let date = date_obj.getDate();
        let month = date_obj.getMonth() + 1;
        let year = date_obj.getFullYear();

        // return date in YYYY-MM-DD format
        return (year + "-" + month + "-" + date);
    }
}