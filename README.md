# Distributed Scheduler on Predix
Distributed across multiple app instances in Predix.

## Getting Started

### Get the source code
Make a directory for your project.  Clone or download and extract  in that directory.
```
```

```
> cd distributed_predix_scheduler
```



### Install the dependencies
##### Install node dependencies
```
npm install
```

##### To run locally install redis
MAC:
````
brew install redis
````
Windows (redis does not officially support windows, however, the Microsoft Open Tech group develops and maintains this Windows port targeting Win64). Installation instructions can be found at:
```
https://github.com/MSOpenTech/redis
```

### Prepare configurations

#### 1. REDIS DB Configurations
##### 1.1 Running locally
1. Open config.js in a text editor
2. Edit the db configurations in the conn_details object in config.js file.


#### 2. Jobs configuration
1. Open the jobs.js file and define the jobs inside the jobs array
2. Also declare the queues which will be used in the queues array.
3. The variable jobs is an array of object with each object describing a distinct job. Each object has the following properties.
    * **job_name** : A unique name to be used as an identifier for that job
    * **job_func** : Function which will contain the logic which will run when the job is executed.
    * **queue**: Queue name **has to be declared in the queues array** to which the job would be pushed.
    * **cron_string**: cron string which would specify the interval at which the job will be executed. Cron string takes the below format
    ```
        *    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
```
    Some examples:
        * ```'42 * * * *' ```: Execute the job when the minute is 42
        * ```'*/5 * * * *'```: Execute a job every five minutes.
4. Examples of jobs and queue array have been provided in the jobs.js file as commented code.


#### 3. Pushing to Predix (Ignore for other platforms which are not cloudfoundry)

* Create a redis service instance on Predix.
    * Login to predix
    ````
    > cf login -a https://api.system.aws-usw02-pr.ice.predix.io.
    ````
    * List down services offered by Predix in marketplace
    ````
    > cf m
    
    ````
    
    * Look for (redis-13 might be redis-12 in some cases)
    
    ````
    redis-13 shared-vm  Redis service to provide a key-value store
    ````

    * Create a redis service instance
    The command takes the following form:
    ````
    cf create-service SERVICE PLAN SERVICE_INSTANCE
    ````
    For our use case
    ````
    cf create-service redis-13 shared-vm <service-name>
    ````
    
    * Open **manifest.yml** file in text editor
        * Replace <app_name> with app name of your choice.
        ````
            - name: <app_name>
        ````
        
        * Replace with the service name of redis instance created in the previous step.
        ````
           services:
  - <your_service_name>
        ````
        
        * Open config.js in the text editor and specify the connection details.
        ````
            const conn_details = {...}
        ````
        
        * Push the application to predix
        
        ```
        > cf push
        ```
        
#### 4. Options
* There are two options available in the config.js file
    * logs (true/false): Enable or disable printing detailed logs of the events
    * multiWorker (true/false): 
    ```This will process more than one job at a time as long as there is idle CPU within the event loop. For example, if you have a slow job that sends email via SMTP (with low rendering overhead), we can process many jobs at a time, but if you have a math-heavy operation, it will stick to one. The multiWorker handles this by spawning more and more node-resque workers and managing the pool. Specify as true to enable multiworker, false will spawn one worker per app instance.```
  

### Libraries Used

* Built on top of:
    * node-schedule ( https://www.npmjs.com/package/node-schedule )
    * node-resque ( https://npmjs.org/package/node-resque )