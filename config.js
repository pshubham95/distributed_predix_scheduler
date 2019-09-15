
////////////////////////
//OPTIONS             //
///////////////////////
const options = {
    multiWorker: false, 
    logs: false
}
/*
multiWorker:
This will process more than one job at a time as long as there is idle CPU within the event loop. For example, if you have a slow job that sends                         email via SMTP (with low rendering overhead), we can process many jobs at a time, but if you have a math-heavy operation, it will stick to 1. The multiWorker handles this by spawning more and more node-resque workers and managing the pool. Specify as true to enable multiworker, false will spawn one worker per app instance.
*/

/*
logs: 
Print detailed logs. Specify true to enable, false to disable.
*/


//////////////////////////////
// REDIS CONFIGURATIONS     //
/////////////////////////////

const conn_details = {
    password: null,
    port: 6379,
    host:'127.0.0.1'
}
module.exports.options = options;
module.exports.conn_details = conn_details;