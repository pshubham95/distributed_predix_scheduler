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

var queues = ['time','time_new'];
module.exports.jobs = jobs;
module.exports.queues = queues;