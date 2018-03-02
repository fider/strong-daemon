import {StrongDaemon} from '../lib/strong-daemon';
const {inspect: i} = require('util');
import {createTask, iTask, NotTypedStrongDaemon, TestableStrongDaemon} from './helpers';





describe('Unit test strong-daemon:', function() {
    let strong_daemon: TestableStrongDaemon;
    let task: iTask;


    beforeEach(function() {
        task = createTask();
        strong_daemon = <any>new StrongDaemon(task.interval_time, task.caller, task.task_owner.taskForStrongDaemon, task.input_args);
    });

    afterEach(function() {
        strong_daemon.stop();
    })
    

    /* For those who not TypeScript-ing */
    it('StrongDaemon.constructor() invalid arguments', function() {
        const MAX_INT: number = Math.pow(2,31) - 1;

        expect(()=>{ new NotTypedStrongDaemon(1, {},   ()=>{}, []) }).not.toThrow();
        expect(()=>{ new NotTypedStrongDaemon(1, [],   ()=>{}, []) }).not.toThrow();
        expect(()=>{ new NotTypedStrongDaemon(1, {},   ()=>{}    ) }).not.toThrow();
        expect(()=>{ new NotTypedStrongDaemon(1, null, ()=>{}, []) }).not.toThrow();

        // Arg 0
        expect(()=>{ new NotTypedStrongDaemon(undefined, {}, ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(0,         {}, ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(-1,        {}, ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(MAX_INT+1, {}, ()=>{}, []) }).toThrowError(TypeError);

        // Arg 1
        expect(()=>{ new NotTypedStrongDaemon(1, undefined, ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, 1,         ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, '1',       ()=>{}, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, true,      ()=>{}, []) }).toThrowError(TypeError);

        // Arg 2
        expect(()=>{ new NotTypedStrongDaemon(1, {}, undefined, []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, {}, null,      []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, {}, {},        []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, {}, 1,         []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, {}, '1',       []) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, {}, true,      []) }).toThrowError(TypeError);

        // Arg 3
        expect(()=>{ new NotTypedStrongDaemon(1, {}, ()=>{}, null ) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, {}, ()=>{}, {}   ) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, {}, ()=>{}, 1    ) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, {}, ()=>{}, '1'  ) }).toThrowError(TypeError);
        expect(()=>{ new NotTypedStrongDaemon(1, {}, ()=>{}, true ) }).toThrowError(TypeError);
    });



    /* Just to spot any changes */
    it('StrongDaemon.constructor() protected members initialization', function() {
        expect(strong_daemon._interval_time).toBe(task.interval_time);
        expect(strong_daemon._task).toBe(task.task_owner.taskForStrongDaemon);
        expect(strong_daemon._args).toBe(task.input_args);
        expect(strong_daemon._caller).toBe(task.caller);
        expect(strong_daemon._interval_id).toBe(null);
    });



    it('StrongDaemon.constructor() should not call task nor start timer', function() {
        task.call_count = 0;
        spyOn(global, 'setInterval');
        spyOn(global, 'setTimeout');
        const setInterval_spy = <jasmine.Spy> global.setInterval;
        const setTimeout_spy = <jasmine.Spy> global.setTimeout;

        strong_daemon = <any> new StrongDaemon(task.interval_time, task.caller, task.task_owner.taskForStrongDaemon, task.input_args);
        
        expect(task.call_count).toBe(0);
        expect(setInterval_spy).toHaveBeenCalledTimes(0);
        expect(setTimeout_spy).toHaveBeenCalledTimes(0);
    });



    describe('StrongDaemon.start  (is setInterval called with proper task)', function() {
        let setInterval_spy: jasmine.Spy;

        beforeEach(function() {
            spyOn(global, 'setInterval').and.callThrough();
            setInterval_spy = <jasmine.Spy>global.setInterval;
        });


        it('StrongDaemon.start(undefined=false)', function() {
            expect(setInterval_spy).toHaveBeenCalledTimes(0);
            strong_daemon.start();
            expect(setInterval_spy).toHaveBeenCalledTimes(1);
            expect(setInterval_spy.calls.mostRecent().args[1]).toBe( task.interval_time );
            // expect(setInterval_spy.calls.mostRecent().args[0].name).toBe('bound taskForStrongDaemon');
        });
    
        it('StrongDaemon.start(false)', function() {
            expect(setInterval_spy).toHaveBeenCalledTimes(0);
            strong_daemon.start(false);
            expect(setInterval_spy).toHaveBeenCalledTimes(1);
            expect(setInterval_spy.calls.mostRecent().args[1]).toBe( task.interval_time );
            // expect(setInterval_spy.calls.mostRecent().args[0].name).toBe('bound taskForStrongDaemon');
        });
    
        it('StrongDaemon.start(true)', function() {
            expect(setInterval_spy).toHaveBeenCalledTimes(0);
            strong_daemon.start(true);
            
            expect(setInterval_spy).toHaveBeenCalledTimes(1);
            expect(setInterval_spy.calls.mostRecent().args[1]).toBe( task.interval_time );
            // expect(setInterval_spy.calls.mostRecent().args[0].name).toBe('bound taskForStrongDaemon');
        });
    });



    describe('(!) TEST CASE MAY BE UNSTABLE AND DEPENDS ON NODE.JS VERSION (verifying private NodeJS.Timer members to check if timer is NOT unref`ed ', function() {
        it('StrongDaemon.start(default=false)', function() {
            strong_daemon.start();
            expect(typeof(strong_daemon._interval_id._idlePrev)).toBe('object');
            expect(strong_daemon._interval_id._idlePrev).not.toBe(null);
            expect(typeof(strong_daemon._interval_id._idleNext)).toBe('object');
            expect(strong_daemon._interval_id._idleNext).not.toBe(null);
        });

        it('StrongDaemon.start(false)', function() {
            strong_daemon.start(false);
            expect(typeof(strong_daemon._interval_id._idlePrev)).toBe('object');
            expect(strong_daemon._interval_id._idlePrev).not.toBe(null);
            expect(typeof(strong_daemon._interval_id._idleNext)).toBe('object');
            expect(strong_daemon._interval_id._idleNext).not.toBe(null);
        });

        it('StrongDaemon.start(true)', function() {
            strong_daemon.start(true);
            expect(typeof(strong_daemon._interval_id._idlePrev)).toBe('object');
            expect(strong_daemon._interval_id._idlePrev).not.toBe(null);
            expect(typeof(strong_daemon._interval_id._idleNext)).toBe('object');
            expect(strong_daemon._interval_id._idleNext).not.toBe(null);
        });
    });



    describe('StrongDaemon.start  (is task called immediately)', function() {
        it('StrongDaemon.start(false)', function() {
            strong_daemon.start(false);
    
            expect(task.call_count).toBe(0);
            expect(task.recent_caller).toBe(null);
            expect(task.recent_args).toBe(null);
        });
        
        it('StrongDaemon.start(undefined=false)', function() {
            strong_daemon.start(false);
    
            expect(task.call_count).toBe(0);
            expect(task.recent_caller).toBe(null);
            expect(task.recent_args).toBe(null);
        });
    
        it('StrongDaemon.start(true)', function() {
            expect(task.call_count).toBe(0);
            strong_daemon.start(true);
    
            expect(task.call_count).toBe(1);
            expect(task.recent_caller).toBe(task.caller);
            expect(task.recent_args).toEqual(task.input_args);
        });
    });
    


    it('multiple call StrongDaemon.start()', function() {
        strong_daemon.start();
        expect(()=>{ strong_daemon.start(); }).toThrowError(Error);
    });



    it('multiple call StrongDaemon.stop() not throws', function() {
        strong_daemon.start();
        expect(()=>{ strong_daemon.stop(); }).not.toThrow();
        
        strong_daemon.start();
        expect(()=>{ strong_daemon.stop(); }).not.toThrow();
        expect(()=>{ strong_daemon.stop(); }).not.toThrow();        
    });
    


    it('StrongDaemon.isRunning()', function() {
        expect(strong_daemon.isRunning()).toBe(false);

        strong_daemon.start();
        expect(strong_daemon.isRunning()).toBe(true);
        
        strong_daemon.stop();
        expect(strong_daemon.isRunning()).toBe(false);        
        
        strong_daemon.start();
        expect(strong_daemon.isRunning()).toBe(true);        
        
        strong_daemon.stop();
        expect(strong_daemon.isRunning()).toBe(false);
        
        strong_daemon.start();
        expect(strong_daemon.isRunning()).toBe(true);

        strong_daemon.stop();
        strong_daemon.stop();
        expect(strong_daemon.isRunning()).toBe(false);        
    });



    it('StrongDaemon.get interval()', function() {
        expect(strong_daemon.interval).toBe(task.interval_time);
    });

    it('StrongDaemon.get task()', function() {
        expect(strong_daemon.task).toBe(task.task_owner.taskForStrongDaemon);
    });

    it('StrongDaemon.get args()', function() {
        expect(strong_daemon.args).toBe(task.input_args);
    });

    it('StrongDaemon.get caller()', function() {
        expect(strong_daemon.caller).toBe(task.caller);
    });
});



describe('strong-daemon runtime test:', function() {
    let task: iTask;
    let strong_daemon: StrongDaemon;


    beforeEach(function() {
        jasmine.clock().install();

        task = createTask();
        strong_daemon = new StrongDaemon(task.interval_time, task.caller, task.task_owner.taskForStrongDaemon, task.input_args);
    });


    afterEach(function() {
        strong_daemon.stop();
        jasmine.clock().uninstall();
    });


    it('StrongDaemon.start() => stop => start', function() {
        expect(task.call_count).toBe(0);

        strong_daemon.start();
        expect(task.call_count).toBe(0);

        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(0);

        // before first timeout

        jasmine.clock().tick(1);
        expect(task.call_count).toBe(1);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);
        
        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(1);

        // before second timeout

        jasmine.clock().tick(1);
        expect(task.call_count).toBe(2);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);

        
        strong_daemon.stop();

        jasmine.clock().tick(task.interval_time);
        expect(task.call_count).toBe(2);

        jasmine.clock().tick(task.interval_time);
        expect(task.call_count).toBe(2);


        strong_daemon.start();
        expect(task.call_count).toBe(2);

        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(2);
        
        jasmine.clock().tick(1);
        expect(task.call_count).toBe(3);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);
    });


    it('StrongDaemon.start(true) => stop => start ', function() {
        expect(task.call_count).toBe(0);

        strong_daemon.start(true);
        expect(task.call_count).toBe(1);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);

        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(1);

        // before first timeout

        jasmine.clock().tick(1);
        expect(task.call_count).toBe(2);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);
        
        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(2);

        // before second timeout

        jasmine.clock().tick(1);
        expect(task.call_count).toBe(3);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);

        
        strong_daemon.stop();

        jasmine.clock().tick(2 * task.interval_time);
        expect(task.call_count).toBe(3);

        jasmine.clock().tick(task.interval_time);
        expect(task.call_count).toBe(3);


        strong_daemon.start();
        expect(task.call_count).toBe(3);

        jasmine.clock().tick( task.interval_time - 1 );
        expect(task.call_count).toBe(3);
        
        jasmine.clock().tick(1);
        expect(task.call_count).toBe(4);
        expect(task.recent_caller).toBe(task.caller);
        expect(task.recent_args).toEqual(task.input_args);
    });
});





