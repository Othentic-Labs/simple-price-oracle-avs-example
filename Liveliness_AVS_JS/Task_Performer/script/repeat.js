const axios = require("axios");

const MINUTES = 5;

async function main() {
    await execute();
    setInterval(async () => {
        await execute();
    }, 60000 * MINUTES);
}

async function execute() {
    console.log("Executing task");
    try {
        const response = await axios.post("http://localhost:4003/task/execute");
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}

main();