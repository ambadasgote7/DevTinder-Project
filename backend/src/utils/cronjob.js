const cron = require("node-cron");

cron.schedule("0 8 * * *", () => {
    console.log("Hello World, "  + new Date());
});