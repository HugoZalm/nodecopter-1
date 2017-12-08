PILOT_ACCELERATION = 0.04;

(function(window, document, $, undefined) {
        'use strict';

        var keyCodeMap    = {"0":"96","1":"97","2":"98","3":"99","4":"100","5":"101","6":"102","7":"103","8":"104","9":"105","backspace":"8","tab":"9","return":"13","shift":"16","ctrl":"17","alt":"18","pausebreak":"19","capslock":"20","escape":"27"," ":"32","pageup":"33","pagedown":"34","end":"35","home":"36","left":"37","up":"38","right":"39","down":"40","+":"107","printscreen":"44","insert":"45","delete":"46",";":"186","=":"187","a":"65","b":"66","c":"67","d":"68","e":"69","f":"70","g":"71","h":"72","i":"73","j":"74","k":"75","l":"76","m":"77","n":"78","o":"79","p":"80","q":"81","r":"82","s":"83","t":"84","u":"85","v":"86","w":"87","x":"88","y":"89","z":"90","*":"106","-":"189",".":"190","/":"191","f1":"112","f2":"113","f3":"114","f4":"115","f5":"116","f6":"117","f7":"118","f8":"119","f9":"120","f10":"121","f11":"122","f12":"123","numlock":"144","scrolllock":"145",",":"188","`":"192","[":"219","\\":"220","]":"221","'":"222"};
          ;

        var forward  = 'w'
          , backward = 's'
          , left     = 'a'
          , right    = 'd'
          , flip     = 'f'
          , channel  = 'c'
          ;
        if      (options && options.keyboard === 'qwerty') { }
        else if (options && options.keyboard === 'azerty') {
          forward  = 'z';
          backward = 's';
          left     = 'q';
          right    = 'd';
        }

        // Static keymap used within this module
        var Keymap = {
          38 : {
            ev : 'move',
            action : 'up'
          },
          40 : {
            ev : 'move',
            action : 'down'
          },
          37 : {
            ev : 'move',
            action : 'counterClockwise'
          },
          39 : {
            ev : 'move',
            action : 'clockwise'
          },
          32 : {
            ev : 'drone',
            action : 'stop'
          },
          84 : {
            ev : 'drone',
            action : 'takeoff'
          },
          76 : {
            ev : 'drone',
            action : 'land'
          },
          69 : {
            ev : 'drone',
            action : 'disableEmergency'
          },
          70 : {
            ev : 'animate',
            action : 'flip'
          }
        };
        Keymap[keyCodeMap[forward]]  = {
          ev : 'move',
          action : 'front'
        };
        Keymap[keyCodeMap[backward]] = {
          ev : 'move',
          action : 'back'
        };
        Keymap[keyCodeMap[left]]     = {
          ev : 'move',
          action : 'left'
        };
        Keymap[keyCodeMap[right]]    = {
          ev : 'move',
          action : 'right'
        };
        Keymap[keyCodeMap[channel]]  = {
          ev : 'channel'
        };

        /*
         * Constructuor
         */
        var PilotExtended = function PilotExtended(cockpit) {
            console.log("Loading PilotExtended plugin.");
            this.cockpit = cockpit;
            this.speed = 0.3;
            this.moving = false;
            this.keys = {};

            // Add the buttons to the control area
            $('#controls').append('<input type="button" id="ftrim" value="Flat trim">');
            $('#controls').append('<input type="button" id="calibratemagneto" value="Calibrate magneto">');

            // Start with magneto calibration disabled.
            $('#calibratemagneto').prop('disabled', true);

            // Add a macro Area
            $('.main-container').before('<div class="macro-container"><span id="macros"></span></div>');
 
            // Add the buttons to the macro area
            $('#macros').append('<div class="btn" id="takeoff" value="Start"><span class="glyphicon glyphicon-arrow-up"></span>Start</div>');
            $('#macros').append('<div class="btn" id="land" value="Land">Land</div>');
            $('#macros').append('<div style="width: 25px; display: inline-block"></div>');
            $('#macros').append('<div class="btn" id="clockwise" value="Clockwise">Turn CW</div>');
            $('#macros').append('<div class="btn" id="counterClockwise" value="CounterClockwise">Turn CCW</div>');
            $('#macros').append('<div style="width: 25px; display: inline-block"></div>');
            $('#macros').append('<div class="btn" id="forward" value="Forward">Forward</div>');
            $('#macros').append('<div class="btn" id="backward" value="Backward">Backward</div>');
            $('#macros').append('<div class="btn" id="left" value="Left">Left</div>');
            $('#macros').append('<div class="btn" id="right" value="Right">Right</div>');
            $('#macros').append('<div class="btn" id="up" value="Up">Up</div>');
            $('#macros').append('<div class="btn" id="down" value="Down">Down</div>');
            $('#macros').append('<div style="width: 25px; display: inline-block"></div>');
            $('#macros').append('<div class="btn" id="animateLeds" value="animateLeds">Leds</div>');
            $('#macros').append('<div style="width: 25px; display: inline-block"></div>');
            $('#macros').append('<div class="btn" id="rectangle" value="Rectangle">Vierkant</div>');
            $('#macros').append('<div style="width: 25px; display: inline-block"></div>');
            $('#macros').append('<div class="btn btn-danger" id="stop" value="Stop">Stop</div>');
            
            // Adjust container heights
            $('.macro-container').css('top', $('.main-container').css('top'));
            $('.main-container').css('top', $('.main-container').position().top + $('.macro-container').outerHeight() + 'px');

        // Register the various event handlers
            this.listen();

            // Setup a timer to send motion command
            var self = this;
            setInterval(function(){self.sendCommands()},100);
        };

        /*
         * Register keyboard event listener
         */
        PilotExtended.prototype.listen = function listen() {
                var pilotExtended = this;
                
                var macro = [
                    [pilotExtended.takeoff, 0],
                    [pilotExtended.land, 10000]
                ];
                
                $(document).keydown(function(ev) {
                        pilotExtended.keyDown(ev);
                });

                $(document).keyup(function(ev) {
                        pilotExtended.keyUp(ev);
                });

                $('#calibratemagneto').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.calibrate(0);
                });
                $('#ftrim').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.ftrim();
                });
                $('#takeoff').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.takeoff();
                });
                $('#land').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.land();
                });
                $('#stop').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.stop();
                });
                $('#clockwise').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.clockwise();
                });
                $('#counterClockwise').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.counterClockwise();
                });
                $('#forward').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.forward();
                });
                $('#backward').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.backward();
                });
                $('#left').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.left();
                });
                $('#right').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.right();
                });
                $('#up').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.up();
                });
                $('#down').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.down();
                });
                $('#animateLeds').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.animateLeds("blinkGreenRed", 5, 2);
                });
                $('rectangle').click(function(ev) {
                  ev.preventDefault();
                  pilotExtended.takeoff(0)
                  .then(pilotExtended.clockWise(1000))
                  .then(pilotExtended.Stop(0))
                  .then(pilotExtended.Front(500))
                  .then(pilotExtended.Stop(0))
                  .then(pilotExtended.clockWise(1000))
                  .then(pilotExtended.Stop(0))
                  .then(pilotExtended.Front(500))
                  .then(pilotExtended.Stop(0))
                  .then(pilotExtended.clockWise(1000))
                  .then(pilotExtended.Stop(0))
                  .then(pilotExtended.Front(500))
                  .then(pilotExtended.Stop(0))
                  .then(pilotExtended.clockWise(1000))
                  .then(pilotExtended.Stop(0))
                  .then(pilotExtended.Front(500))
                  .then(pilotExtended.Stop(0))
                  .then(pilotExtended.land(1000));
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
         * Process onkeydown. For motion commands, we just update the
         * speed for the given key and the actual commands will be sent
         * by the sendCommand method, triggered by a timer.
         *
         */
        PilotExtended.prototype.keyDown = function keyDown(ev) {
                console.log("Keydown: " + ev.keyCode);
                if (ev.keyCode == 9) {
                  PILOT_ACCELERATION = (PILOT_ACCELERATION == 0.04) ? 0.64 : 0.04;
                  console.log("PILOT_ACCELERATION: " + PILOT_ACCELERATION);
                  ev.preventDefault();
                  return;
                }
                if (Keymap[ev.keyCode] == null) {
                        return;
                }
                ev.preventDefault();

                var key = ev.keyCode;
                var cmd = Keymap[key];
                //if flip, determine which direction to flip
                var regFlip = /^flip/;
                if (regFlip.test(cmd.action)) {
                  console.log("FLIP!");
                  //check for which direction to flip
                  switch (this.moving) {
                    case 'front':
                      cmd.action = 'flipAhead';
                      break;
                    case 'back':
                      cmd.action = 'flipBehind';
                      break;
                    case 'right':
                      cmd.action = 'flipRight';
                      break;
                    default:
                      cmd.action = 'flipLeft';
                      break;
                  }

                }
                // If a motion command, we just update the speed
                if (cmd.ev == "move") {
                    this.moving = Keymap[ev.keyCode].action;
                    if (typeof(this.keys[key])=='undefined' || this.keys[key]===null) {
                        this.keys[key] = PILOT_ACCELERATION;
                    }
                }
                // Else we send the command immediately
                else {
                    this.cockpit.socket.emit("/pilot/" + cmd.ev, {
                        action : cmd.action
                    });
                }
        };

        /*
         * On keyup we delete active keys from the key array
         * and send a stop command for this direction
         */
        PilotExtended.prototype.keyUp = function keyUp(ev) {
                console.log("Keyup: " + ev.keyCode);
                if (Keymap[ev.keyCode] == null) {
                        return;
                }
                ev.preventDefault();

                // Delete the key from the tracking array
                var key = ev.keyCode;
                delete this.keys[key];

                // Send a command to set the motion in this direction to zero
                if (Object.keys(this.keys).length > 0) {
                  var cmd = Keymap[key];
                  this.cockpit.socket.emit("/pilot/" + cmd.ev, {
                      action : cmd.action,
                      speed : 0
                  });
                } else { // hovering state if no more active commands
                  this.cockpit.socket.emit("/pilot/drone", {
                      action : 'stop'
                  });
                }
        }

        /*
         * Triggered by a timer, check for active keys
         * and send the appropriate motion commands
         */
        PilotExtended.prototype.sendCommands = function() {
                for (var k in this.keys) {
                    var cmd = Keymap[k];
                    // Send the command
                    this.cockpit.socket.emit("/pilot/" + cmd.ev, {
                        action : cmd.action,
                        speed : this.keys[k]
                    });

                    // Update the speed
                    this.keys[k] = this.keys[k] + PILOT_ACCELERATION / (1 - this.keys[k]);
                    this.keys[k] = Math.min(1, this.keys[k]);
                }
        }
        
        /*
         * Drone Commands
         */
         
        PilotExtended.prototype.calibrate = function calibrate(deviceNum) {
            this.cockpit.socket.emit("/pilot/calibrate", {device_num : 0});
            console.log("Calibrate");
        };

        PilotExtended.prototype.ftrim = function ftrim() {
            this.cockpit.socket.emit("/pilot/ftrim");
            console.log("Ftrim");
        };

        PilotExtended.prototype.takeoff = function takeoff(delay) {
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

        PilotExtended.prototype.land = function land(delay) {
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

        PilotExtended.prototype.stop = function stop() {
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

        PilotExtended.prototype.counterClockwise = function counterClockwise() {
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

        PilotExtended.prototype.clockwise = function clockwise() {
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

        PilotExtended.prototype.forward = function forward() {
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

        PilotExtended.prototype.backward = function backward() {
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

        PilotExtended.prototype.left = function left() {
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

        PilotExtended.prototype.right = function right() {
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

        PilotExtended.prototype.up = function up() {
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

        PilotExtended.prototype.down = function down() {
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
        PilotExtended.prototype.animateLeds = function animateLeds(action, frequenty, duration, delay) {
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

        
        window.Cockpit.plugins.push(PilotExtended);

}(window, document, jQuery));
