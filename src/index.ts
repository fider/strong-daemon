import {StrongDaemon} from './strong-daemon';


/* Mock it for testing purposes */
function getInstance(interval_time: number, caller: object|null, task: (...args:any[])=>any, task_arguments?: any[]): StrongDaemon {
    return new StrongDaemon(interval_time, caller, task, task_arguments);
}

/* Mock it for testing purposes */
function getClass(): typeof StrongDaemon {
    return StrongDaemon;
};

export {getInstance};
export {getClass};
export {StrongDaemon};