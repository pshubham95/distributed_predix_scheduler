var redis_service_name = 'your_redis_service_instance_name'; //SPECIFY THE REDIS SERVICE INSTANCE NAME CREATED ON PREDIX

/////////////////////////////////////////////////////////////////////////////////////////////////
// Cron is a time-based job scheduler                                                          //
// SOME CRON STRING EXAMPLES:                                                                  // 
//                                                                                             //
// *    *    *    *    *    *                                                                  // 
// ┬    ┬    ┬    ┬    ┬    ┬                                                                  // 
// │    │    │    │    │    |                                                                  // 
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)                              // 
// │    │    │    │    └───── month (1 - 12)                                                   // 
// │    │    │    └────────── day of month (1 - 31)                                            // 
// │    │    └─────────────── hour (0 - 23)                                                    // 
// │    └──────────────────── minute (0 - 59)                                                  // 
// └───────────────────────── second (0 - 59, OPTIONAL)                                        // 
//                                                                                             // 
// 1. 42 * * * * - Execute a cron job when the minute is 42 (e.g. 19:42, 20:42, etc.).         // 
// 2. Execute a cron job every 5 Minutes = */5 * * * *                                         // 
/////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////
//OPTIONS             //
///////////////////////
var options = {
    multiWorker:false, 
    logs:true
}
/*
multiWorker:
This will process more than one job at a time as long as there is idle CPU within the event loop. For example, if you have a slow job that sends                         email via SMTP (with low rendering overhead), we can process many jobs at a time, but if you have a math-heavy operation, it will stick to 1. The multiWorker handles this by spawning more and more node-resque workers and managing the pool. Specify as true to enable multiworker, false will spawn one worker per app instance.
*/

/*
logs: 
Print detailed logs. Specify true to enable, false to disable.
*/

module.exports.redis_service_name = redis_service_name;
module.exports.cron_string = cron_string;
module.exports.options = options;