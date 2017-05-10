// /////////////////////////////
// Load the required Packages //
// ////////////////////////////

var NR = require('node-resque');
var schedule = require('node-schedule');
var express = require('express');
var app = express();


// /////////////////////////////
// Load Config                //
// ////////////////////////////

var config = require('./config');
var redis_serv_name = config.redis_service_name;



/////////////////////////////////
//Load Jobs                    //
////////////////////////////////
var jobs = require('./jobs');
var queues = jobs.queues;
var jobs_file = jobs.jobs;

// ////////////////////////////
// Establish redis db conn   //
// ///////////////////////////
var connectionDetails = {};


if(! process.env.hasOwnProperty('VCAP_SERVICES'))
{
    connectionDetails = {
        pkg: 'ioredis',
        host: '127.0.0.1',
        password: null,
        port: 6379,
    };
}

else
{
    var services = process.env.VCAP_SERVICES;
    services = JSON.parse(services);
    var keys = Object.keys(services);
    if(keys.length == 0){
        console.log('redis service not bound to this app');
        exit(1);
    }
    else
    {
        var index = 0;
        for(var i = 0; i < keys.length; i++)
        {
            if(keys[i].indexOf('redis')!== -1)
            {
                index = i;
                break;
            }
        }

        for(var i = 0; i < services[keys[index]].length; i++)
        {
            if(services[keys[index]][i].name == redis_serv_name)
            {
                connectionDetails =  {
                    pkg: 'ioredis',
                    host: services[keys[index]][i].credentials.host,
                    password: services[keys[index]][i].credentials.password,
                    port:services[keys[index]][i].credentials.port,
                    options: {password: services[keys[index]][i].credentials.password}
                };
                break;
            }
        }

    }
}

// ////////////////////////////
// DEFINE YOUR WORKER TASKS //
// ////////////////////////////

/*var jobs = {
    ticktock: function (time, callback) {
        console.log('*** THE TIME IS ' + time + ' ***')
        callback(null, true);
    }
}*/
var jobs = {};
for(let i = 0; i < jobs_file.length; i++)
{
    jobs[jobs_file[i].job_name] = jobs_file[i].job_func;
}

// //////////////////
// START A WORKER //
// //////////////////

if(config.options.multiWorker)
{
    var worker = new NR.multiWorker({
        connection: connectionDetails,
        queues: queues,
        minTaskProcessors:   1,
        maxTaskProcessors:   100,
        checkTimeout:        1000,
        maxEventLoopDelay:   10,  
        toDisconnectProcessors: true,
    }, jobs);

    worker.start();
}
else
{
    var Worker = NR.worker;
    var worker = new Worker({connection: connectionDetails, queues: queues}, jobs)
    worker.connect(function () {
        worker.workerCleanup() // optional: cleanup any previous improperly shutdown workers on this host
        worker.start()
    })
}

// /////////////////////
// START A SCHEDULER //
// /////////////////////

var Scheduler = NR.scheduler
var scheduler = new Scheduler({connection: connectionDetails})
scheduler.connect(function () {
    scheduler.start()
})

// /////////////////////////////////////
// REGESTER FOR EVENTS AND PRINT LOGS //
// ////////////////////////////////////

if(config.options.logs)
{

    worker.on('start', function () { console.log('worker started') })
    worker.on('end', function () { console.log('worker ended') })
    worker.on('cleaning_worker', function (worker, pid) { console.log('cleaning old worker ' + worker) })
    worker.on('poll', function (queue) { console.log('worker polling ' + queue) })
    worker.on('job', function (queue, job) { console.log('working job ' + queue + ' ' + JSON.stringify(job)) })
    worker.on('reEnqueue', function (queue, job, plugin) { console.log('reEnqueue job (' + plugin + ') ' + queue + ' ' + JSON.stringify(job)) })
    worker.on('success', function (queue, job, result) { console.log('job success ' + queue + ' ' + JSON.stringify(job) + ' >> ' + result) })
    worker.on('failure', function (queue, job, failure) { console.log('job failure ' + queue + ' ' + JSON.stringify(job) + ' >> ' + failure) })
    worker.on('error', function (queue, job, error) { console.log('error ' + queue + ' ' + JSON.stringify(job) + ' >> ' + error) })
    worker.on('pause', function () { console.log('worker paused') })

    scheduler.on('start', function () { console.log('scheduler started') })
    scheduler.on('end', function () { console.log('scheduler ended') })
    scheduler.on('poll', function () { console.log('scheduler polling') })
    scheduler.on('master', function (state) { console.log('scheduler became master') })
    scheduler.on('error', function (error) { console.log('scheduler error >> ' + error) })
    scheduler.on('working_timestamp', function (timestamp) { console.log('scheduler working timestamp ' + timestamp) })
    scheduler.on('transferred_job', function (timestamp, job) { console.log('scheduler enquing job ' + timestamp + ' >> ' + JSON.stringify(job)) });
}

function schedule_jobs(cntr)
{
    schedule.scheduleJob(jobs_file[cntr].cron_string, function () { // do this job every 10 seconds, cron style
        // we want to ensure that only one instance of this job is scheduled in our enviornment at once,
        // no matter how many schedulers we have running
        if (scheduler.master) {
            if(config.options.logs)
            {
                console.log('>>> enquing a job')

            }

            console.log(jobs_file[cntr].queue,cntr);
            queue.enqueue(jobs_file[cntr].queue, jobs_file[cntr].job_name, new Date().toString())
        }
    })
}
// ///////////////
// DEFINE JOBS //
// ///////////////

var Queue = NR.queue
var queue = new Queue({connection: connectionDetails}, jobs)
queue.on('error', function (error) { console.log(error) })
queue.connect(function () {
    for(var  i = 0; i < jobs_file.length;i++)
    {
        console.log('queue loop',i);
        schedule_jobs(i);
        
    }
})

// ////////////////////
// SHUTDOWN HELPERS //
// ////////////////////

var shutdown = function () {
    scheduler.end(function () {
        worker.end(function () {
            console.log('exiting')
            process.exit()
        })
    })
}

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

var port = normalizePort(process.env.PORT || process.env.VCAP_APP_PORT || '2805');

app.listen(port, function () {
    console.log('Starting on '+port)
})
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)