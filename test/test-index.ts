// '../../strong-daemon'  =>  leave it like this to test module interface
import {StrongDaemon, getInstance, getClass} from '../../strong-daemon';

/*+--------------------------------------------------------------------------+
  | ! Spy on StrongDaemon's task will not be good solution in this case        |
  |   because StrongDaemon may call task directly or bind it and then call,    |
  |   so stick to `monkey` iTask interface to preserve tests clear and easy  |
  +--------------------------------------------------------------------------+*/

describe('strong-daemon', function() {   


    it('Change in interface spotted - update package version.', function() {
        expect(typeof StrongDaemon).toBe('function');
        expect(typeof getInstance).toBe('function');
        expect(typeof getClass).toBe('function');

        expect(StrongDaemon).toBe(getClass());

        let strong_daemon = getInstance(1, {}, ()=>{});
        expect(strong_daemon instanceof StrongDaemon).toBe(true);
    });

    

    describe('Change in interface spotted - update package version.', function() {
        const EXPECTED_PROTO: any = [
            'constructor',
            'start',
            'stop',
            'isRunning',
            'interval',
            'task',
            'caller',
            'args',
            '_validateArgs'
        ];
        const ACTUAL_PROTO: any = <any>Object.getOwnPropertyNames( StrongDaemon.prototype );
        

        // Self-test for test code
        EXPECTED_PROTO.push('__missing');
        ACTUAL_PROTO.push('__unknown');



        it(`

            (!) For details check test code and compare ACTUAL_PROTO with EXPECTED_PROTO)

            `, function() {

            let strong_daemon: StrongDaemon = getInstance(1, {}, ()=>{});    
            const missing = EXPECTED_PROTO.filter( (property:string) => ( ! ACTUAL_PROTO.includes(property)) );

            expect(missing).toEqual(['__missing']);
        });



        it(`

            (!) For details check test code and compare ACTUAL_PROTO with EXPECTED_PROTO)

            `, function() {
            let strong_daemon: StrongDaemon = getInstance(1, {}, ()=>{});
            const unknown = ACTUAL_PROTO.filter( (property:string) => ( ! EXPECTED_PROTO.includes(property)) );

            expect(unknown).toEqual(['__unknown']);
        });
        
    });

});