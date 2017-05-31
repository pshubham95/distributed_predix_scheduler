/*var jobs = [

    {
        job_name:'ticktock',
        job_func:function(args,callback){
            console.log('*** THE TIME IS ' + new Date().toDateString() + ' ***')
            callback(null, true);
        },
        queue: 'time',
        cron_string:'0,10,20,30,40,50 * * * * *'
    },
    {
        job_name:'ticktock_diff',
        job_func:function(args,callback){
            console.log('*** THE TIME FROM JOB ticktock_diff is ' + new Date().toDateString() + ' ***')
            callback(null, true);
        },
        queue: 'time_new',
        cron_string:'0,10,20,30,40,50 * * * * *'
    }
];*/
var jobs = [];

//var queues = ['time','time_new'];
var queues = [];
module.exports.jobs = jobs;
module.exports.queues = queues;

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