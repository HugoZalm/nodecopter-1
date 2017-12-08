var channel = 0;

function pilotExtended(name, deps) {
    deps.io.sockets.on('connection', function (socket) {
        socket.on('/pilot/move', function (cmd) {
            var _name;
            console.log("move", cmd);
            return typeof deps.client[_name = cmd.action] === "function" ? deps.client[_name](cmd.speed) : void 0;
        });
        socket.on('/pilot/drone', function (cmd) {
           var _name;
           console.log("drone", cmd);
           return typeof deps.client[_name = cmd.action] === "function" ? deps.client[_name]() : void 0;
        });
        socket.on('/pilot/calibrate', function (cmd) {
           console.log("calibrate", cmd);
           return deps.client.calibrate(cmd.device_num);
        });
        socket.on('/pilot/ftrim', function () {
           console.log("flat trim");
           return deps.client.ftrim();
        });
        socket.on('/pilot/animate', function (cmd) {
           console.log("animate", cmd);
           return deps.client.animate(cmd.action, 500);
        });
        socket.on('/pilot/animateLeds', function (cmd) {
           var hz = cmd.hz || 5;
           var duration = cmd.duration || 2;
           console.log("animateLeds", cmd);
           return deps.client.animateLeds(cmd.action, hz, duration);
        });
        socket.on('/pilot/channel', function (cmd) {
           channel = (channel == 0) ? 1 : 0;
           console.log("switching to channel %d", channel);
           return deps.client.config('video:video_channel', channel);
        });
    });
};

module.exports = pilotExtended;
