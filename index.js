// /////////////////////////////
// Load the required Packages //
// ////////////////////////////

const NR = require('node-resque');
const schedule = require('node-schedule');
const express = require('express');
const app = express();


// /////////////////////////////
// Load Config                //
// ////////////////////////////

const config = require('./config');



/////////////////////////////////
//Load Jobs                    //
////////////////////////////////
const queues = require('./jobs').queues;
const jobs_file = require('./jobs').jobs;

// ////////////////////////////
// Establish redis db conn   //
// ///////////////////////////

const connectionDetails = {
    pkg: 'ioredis',
    host: config.conn_details.host,
    password: config.conn_details.password,
    port: config.conn_details.port,
};


// ////////////////////////////
// DEFINE YOUR WORKER TASKS //
// ////////////////////////////

/*var jobs = {
    ticktock: function (time, callback) {
        console.log('*** THE TIME IS ' + time + ' ***')
        callback(null, true);
    }
}*/
const jobs = {};
jobs_file.forEach(e => {
    jobs[e.job_name] = e.job_func;
})


// //////////////////
// START A WORKER //
// //////////////////
let worker;
if(config.options.multiWorker)
{
    worker = new NR.multiWorker({
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
    worker = new NR.worker({connection: connectionDetails, queues: queues}, jobs)
    worker.connect(function () {
        worker.workerCleanup() // optional: cleanup any previous improperly shutdown workers on this host
        worker.start()
    })
}

// /////////////////////
// START A SCHEDULER //
// /////////////////////

const scheduler = new NR.scheduler({connection: connectionDetails})
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
    schedule.scheduleJob(jobs_file[cntr].cron_string, () => {
        // we want to ensure that only one instance of this job is scheduled in our enviornment at once,
        // no matter how many schedulers we have running
        if (scheduler.master) {
            if(config.options.logs)
            {
                console.log('>>> enquing a job')

            }

            queue.enqueue(jobs_file[cntr].queue, jobs_file[cntr].job_name, new Date().toString())
        }
    })
}
// ///////////////
// DEFINE JOBS //
// ///////////////

const queue = new NR.queue({connection: connectionDetails}, jobs)
queue.on('error', function (error) { console.log(error) })
queue.connect(() => {
    jobs_file.map((_, i) => schedule_jobs(i))
    /* for(var  i = 0; i < jobs_file.length;i++)
    {
        console.log('queue loop',i);
        schedule_jobs(i);
        
    } */
})

// ////////////////////
// SHUTDOWN HELPERS //
// ////////////////////

const shutdown = function () {
    scheduler.end(function () {
        worker.end(function () {
            console.log('exiting')
            process.exit()
        })
    })
}

function normalizePort(val) {
    const port = parseInt(val, 10);

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

const port = normalizePort(process.env.PORT || process.env.VCAP_APP_PORT || '2805');

app.listen(port, function () {
    console.log('Starting on '+port)
})
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)