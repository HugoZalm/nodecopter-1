PILOT_ACCELERATION = 0.04;

(function(window, document, $, undefined) {
        'use strict';

         /*
         * Constructuor
         */
        var screenPilot = function screenPilot(cockpit) {
            console.log("Loading screenPilot plugin.");
            this.cockpit = cockpit;
            this.speed = 0.3;
            this.moving = false;

            // Add the buttons to the control area
            $('#controls').append('<input type="button" id="ftrim" value="Flat trim">');
            $('#controls').append('<input type="button" id="calibratemagneto" value="Calibrate magneto">');

            // Start with magneto calibration disabled.
            $('#calibratemagneto').prop('disabled', true);
            
            $("#cockpit").append('<div class="buttonContainer" id="base"></div>');
            $('#base').append('<div class="btn" id="takeoff" value="Start"><span class="glyphicon glyphicon-arrow-up"></span>Start</div>');
            $('#base').append('<div class="btn" id="land" value="Land">Land</div>');
            $('#base').append('<div class="btn btn-danger" id="stop" value="Stop">Stop</div>');
            
            $("#cockpit").append('<div class="buttonContainer" id="basic"></div>');
            $('#basic').append('<div class="btn" id="forward" value="Forward">Forward</div>');
            $('#basic').append('<div class="btn" id="backward" value="Backward">Backward</div>');
            $('#basic').append('<div class="btn" id="left" value="Left">Left</div>');
            $('#basic').append('<div class="btn" id="right" value="Right">Right</div>');
            $('#basic').append('<div class="btn" id="up" value="Up">Up</div>');
            $('#basic').append('<div class="btn" id="down" value="Down">Down</div>');
            
            $("#cockpit").append('<div class="buttonContainer" id="more"></div>');
            $('#more').append('<div class="btn" id="clockwise" value="Clockwise">Turn CW</div>');
            $('#more').append('<div class="btn" id="counterClockwise" value="CounterClockwise">Turn CCW</div>');

            $("#cockpit").append('<div class="buttonContainer" id="animation"></div>');

            $("#cockpit").append('<div class="buttonContainer" id="leds"></div>');
            $('#leds').append('<div class="btn" id="animateLeds" value="animateLeds">Leds</div>');

            $("#cockpit").append('<div class="buttonContainer" id="macros"></div>');
            $('#macros').append('<div class="btn" id="rectangle" value="Rectangle">Vierkant</div>');

/* 
 
            // Add the buttons to the macro area
            
 */
            // Register the various event handlers
            this.listen();

            // Setup a timer to send motion command
            var self = this;
            setInterval(function(){self.sendCommands()},100);
        };

        /*
         * Register keyboard event listener
         */
        screenPilot.prototype.listen = function listen() {
            var screenPilot = this;
            
            var macro = [
                [screenPilot.takeoff, 0],
                [screenPilot.land, 10000]
            ];
            
            $('#calibratemagneto').click(function(ev) {
              ev.preventDefault();
              screenPilot.calibrate(0);
            });
            $('#ftrim').click(function(ev) {
              ev.preventDefault();
              screenPilot.ftrim();
            });
            $('#takeoff').click(function(ev) {
              ev.preventDefault();
              screenPilot.takeoff();
            });
            $('#land').click(function(ev) {
              ev.preventDefault();
              screenPilot.land();
            });
            $('#stop').click(function(ev) {
              ev.preventDefault();
              screenPilot.stop();
            });
            $('#clockwise').click(function(ev) {
              ev.preventDefault();
              screenPilot.clockwise();
            });
            $('#counterClockwise').click(function(ev) {
              ev.preventDefault();
              screenPilot.counterClockwise();
            });
            $('#forward').click(function(ev) {
              ev.preventDefault();
              screenPilot.forward();
            });
            $('#backward').click(function(ev) {
              ev.preventDefault();
              screenPilot.backward();
            });
            $('#left').click(function(ev) {
              ev.preventDefault();
              screenPilot.left();
            });
            $('#right').click(function(ev) {
              ev.preventDefault();
              screenPilot.right();
            });
            $('#up').click(function(ev) {
              ev.preventDefault();
              screenPilot.up();
            });
            $('#down').click(function(ev) {
              ev.preventDefault();
              screenPilot.down();
            });
            $('#animateLeds').click(function(ev) {
              ev.preventDefault();
              screenPilot.animateLeds("blinkGreenRed", 5, 2);
            });
            $('rectangle').click(function(ev) {
              ev.preventDefault();
              screenPilot.takeoff(0)
              .then(screenPilot.clockWise(1000))
              .then(screenPilot.Stop(0))
              .then(screenPilot.Front(500))
              .then(screenPilot.Stop(0))
              .then(screenPilot.clockWise(1000))
              .then(screenPilot.Stop(0))
              .then(screenPilot.Front(500))
              .then(screenPilot.Stop(0))
              .then(screenPilot.clockWise(1000))
              .then(screenPilot.Stop(0))
              .then(screenPilot.Front(500))
              .then(screenPilot.Stop(0))
              .then(screenPilot.clockWise(1000))
              .then(screenPilot.Stop(0))
              .then(screenPilot.Front(500))
              .then(screenPilot.Stop(0))
              .then(screenPilot.land(1000));
            });
            this.cockpit.socket.on('hovering', function() {
              $('#calibratemagneto').prop('disabled', false);
              $('#ftrim').prop('disabled', true);
            });
            this.cockpit.socket.on('landed', function() {
              $('#calibratemagneto').prop('disabled', true);
              $('#ftrim').prop('disabled', false);
            });
        };
        

        /*
         * Drone Commands
         */
         
        screenPilot.prototype.calibrate = function calibrate(deviceNum) {
            this.cockpit.socket.emit("/pilot/calibrate", {device_num : 0});
            console.log("Calibrate");
        };

        screenPilot.prototype.ftrim = function ftrim() {
            this.cockpit.socket.emit("/pilot/ftrim");
            console.log("Ftrim");
        };

        screenPilot.prototype.takeoff = function takeoff(delay) {
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                        this.cockpit.socket.emit("/pilot/drone", {action: "takeoff"});
                        console.log("Takeoff");
                    }, delay);
                });
                console.log("Takeoff, delay: " + delay);
                return promise;
            }
            else {
                this.cockpit.socket.emit("/pilot/drone", {action: "takeoff"});
                console.log("Takeoff");
            }
        };

        screenPilot.prototype.land = function land(delay) {
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                        this.cockpit.socket.emit("/pilot/drone", {action: "land"});
                        console.log("Land");
                    }, delay);
                });
                console.log("Land, delay: " + delay);
                return promise;
            }
            else {
                this.cockpit.socket.emit("/pilot/drone", {action: "land"});
                console.log("Land");
            }
        };

        screenPilot.prototype.stop = function stop() {
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                        this.cockpit.socket.emit("/pilot/drone", {action : "stop"});
                        console.log("Stop");
                    }, delay);
                });
                console.log("Stop, delay: " + delay);
                return promise;
            }
            else {
            this.cockpit.socket.emit("/pilot/drone", {action : "stop"});
            console.log("Stop");
            }
        };

        screenPilot.prototype.counterClockwise = function counterClockwise() {
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                        this.cockpit.socket.emit("/pilot/move", {action: "counterClockwise", speed: currentSpeed});
                        console.log("CCW, speed: " + currentSpeed);
                    }, delay);
                });
                console.log("CCW, delay: " + delay);
                return promise;
            }
            else {
                this.cockpit.socket.emit("/pilot/move", {action: "counterClockwise", speed: currentSpeed});
                console.log("CCW, speed: " + currentSpeed);
            }
            var currentSpeed = this.speed;
        };

        screenPilot.prototype.clockwise = function clockwise() {
            var currentSpeed = this.speed;
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                        this.cockpit.socket.emit("/pilot/move", {action: "clockwise", speed: currentSpeed});
                        console.log("CW, speed: " + currentSpeed);
                    }, delay);
                });
                console.log("CW, delay: " + delay);
                return promise;
            }
            else {
                this.cockpit.socket.emit("/pilot/move", {action: "clockwise", speed: currentSpeed});
                console.log("CW, speed: " + currentSpeed);
            }
        };

        screenPilot.prototype.forward = function forward() {
            var currentSpeed = this.speed * 0.3;
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                        this.cockpit.socket.emit("/pilot/move", {action: "front", speed: currentSpeed});
                        console.log("Front, speed: " + currentSpeed);
                    }, delay);
                });
                console.log("Front, delay: " + delay);
                return promise;
            }
            else {
                this.cockpit.socket.emit("/pilot/move", {action: "front", speed: currentSpeed});
                console.log("Front, speed: " + currentSpeed);
            }
        };

        screenPilot.prototype.backward = function backward() {
            var currentSpeed = this.speed * 0.3;
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                        this.cockpit.socket.emit("/pilot/move", {action: "back", speed: currentSpeed});
                        console.log("Back, speed: " + currentSpeed);
                    }, delay);
                });
                console.log("Back, delay: " + delay);
                return promise;
            }
            else {
                this.cockpit.socket.emit("/pilot/move", {action: "back", speed: currentSpeed});
                console.log("Back, speed: " + currentSpeed);
            }
        };

        screenPilot.prototype.left = function left() {
            var currentSpeed = this.speed * 0.3;
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                this.cockpit.socket.emit("/pilot/move", {action: "left", speed: currentSpeed});
                console.log("Left, speed: " + currentSpeed);
                    }, delay);
                });
                console.log("Left, delay: " + delay);
                return promise;
            }
            else {
                this.cockpit.socket.emit("/pilot/move", {action: "left", speed: currentSpeed});
                console.log("Left, speed: " + currentSpeed);
            }
        };

        screenPilot.prototype.right = function right() {
            var currentSpeed = this.speed * 0.3;
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                this.cockpit.socket.emit("/pilot/move", {action: "right", speed: currentSpeed});
                console.log("Right, speed: " + currentSpeed);
                    }, delay);
                });
                console.log("Right, delay: " + delay);
                return promise;
            }
            else {
                this.cockpit.socket.emit("/pilot/move", {action: "right", speed: currentSpeed});
                console.log("Right, speed: " + currentSpeed);
            }
        };

        screenPilot.prototype.up = function up() {
            var currentSpeed = this.speed;
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                this.cockpit.socket.emit("/pilot/move", {action: "up", speed: currentSpeed});
                console.log("Up, speed: " + currentSpeed);
                    }, delay);
                });
                console.log("Up, delay: " + delay);
                return promise;
            }
            else {
                this.cockpit.socket.emit("/pilot/move", {action: "up", speed: currentSpeed});
                console.log("Up, speed: " + currentSpeed);
            }
        };

        screenPilot.prototype.down = function down() {
            var currentSpeed = this.speed;
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                        this.cockpit.socket.emit("/pilot/move", {action: "down", speed: currentSpeed});
                        console.log("Down, speed: " + currentSpeed);
                    }, delay);
                });
                console.log("Down, delay: " + delay);
                return promise;
            }
            else {
                this.cockpit.socket.emit("/pilot/move", {action: "down", speed: currentSpeed});
                console.log("Down, speed: " + currentSpeed);
            }
        };

        /*
         * Performs a pre-programmed led sequence at given hz frequency and duration (in sec!). 
         * animation can be one of the following:
         * 'blinkGreenRed', 'blinkGreen', 'blinkRed', 'blinkOrange', 'snakeGreenRed',
         * 'fire', 'standard', 'red', 'green', 'redSnake', 'blank', 'rightMissile',
         * 'leftMissile', 'doubleMissile', 'frontLeftGreenOthersRed',
         * 'frontRightGreenOthersRed', 'rearRightGreenOthersRed',
         * 'rearLeftGreenOthersRed', 'leftGreenRightRed', 'leftRedRightGreen',
         * 'blinkStandard'
         */
        screenPilot.prototype.animateLeds = function animateLeds(action, frequenty, duration, delay) {
            var currentAction = action || "blinkStandard";
            var currentFrequenty = frequenty || 5;
            var currentDuration = duration || 2;
            if (delay || delay == 0) {
                var promise = new Promise(function(resolve, reject){
                    setTimeout(function() {
                        this.cockpit.socket.emit("/pilot/animateLeds", {action: currentAction, hz: currentFrequenty, duration: currentDuration});
                        console.log("AnimateLeds: " + currentAction + "(" + currentFrequenty + "," + currentDuration + ")");
                    }, delay);
                });
                console.log("AnimateLeds: " + currentAction + "(" + currentFrequenty + "," + currentDuration + "), delay: " + delay);
                console.log("Down, delay: " + delay);
                return promise;
            }
            else {
                this.cockpit.socket.emit("/pilot/animateLeds", {action: currentAction, hz: currentFrequenty, duration: currentDuration});
                console.log("AnimateLeds: " + currentAction + "(" + currentFrequenty + "," + currentDuration + ")");
            }
        };

        
        window.Cockpit.plugins.push(screenPilot);

}(window, document, jQuery));
