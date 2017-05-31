var redis_service_name = 'your_redis_service_instance_name'; //SPECIFY THE REDIS SERVICE INSTANCE NAME CREATED ON PREDIX

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


//////////////////////////////
//LOCAL REDIS CONFIGURATIONS//
/////////////////////////////
//This will be ignored when pushed to predix

var conn_details = {
    password: null,
    port: 6379,
    host:'127.0.0.1'
}
module.exports.redis_service_name = redis_service_name;
module.exports.options = options;
module.exports.conn_details = conn_details;