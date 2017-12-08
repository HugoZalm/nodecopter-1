(function (window, $, undefined) {
    'use strict';

        var dashboard = function dashboard(cockpit) {
        console.log("Loading dashboard plugin.");

        // Instance variables
        this.cockpit = cockpit;
        this.roll = 0;
        this.pitch = 0;
        this.yaw = 0;
        this.altitude = 0;
        this.speed = 0;
        this.angle = 0;
        this.counter = 0;

        // Add a dashboard Area
        $('.main-container').before('<div class="dashboard-container"><div id="gauges" class="btn-toolbar" role="toolbar"></div></div>');

        // Add the buttons to the macro area
        $('#gauges').append('<div id="rotation" class="btn-group" role="group" aria-label="..."></div>');
        $('#rotation').append('<button id="roll" type="button" class="btn btn-default"></button>');
        $('#rotation').append('<button id="pitch" type="button" class="btn btn-default"></button>');
        $('#rotation').append('<button id="yaw" type="button" class="btn btn-default"></button>');
        $('#gauges').append('<div id="other" class="btn-group" role="group" aria-label="..."></div>');
        $('#other').append('<button id="altitude" type="button" class="btn btn-default"></button>');
        $('#other').append('<button id="speed" type="button" class="btn btn-default"></button>');
        $('#other').append('<button id="angle" type="button" class="btn btn-default"></button>');
        $('#gauges').append('<div id="counters" class="btn-group" role="group" aria-label="..."></div>');
        $('#counters').append('<button id="counter1" type="button" class="btn btn-default"></button>');
        $('#counters').append('<button id="counter2" type="button" class="btn btn-default"></button>');
        
        // Adjust container heights
        $('.dashboard-container').css('top', $('.main-container').css('top'));
            $('.main-container').css('top', $('.main-container').position().top + $('.dashboard-container').outerHeight() + 'px');

        // Bind to navdata events on websockets
        var db = this;
        this.cockpit.socket.on('navdata', function(data) {
            $("#counter1").html(this.counter);
            if (!jQuery.isEmptyObject(data)) {
                requestAnimationFrame(function() {
                    db.render(data);
                });
            }
        });

        // Bind on window events to resize
        $(window).resize(function(event) {
            db.draw();
        });

        this.draw();
    };

    dashboard.prototype.render = function(data) {
        this.counter++;
        this.setValues({
            roll : data.demo.rotation.roll * Math.PI / 180,
            pitch : data.demo.rotation.pitch * Math.PI / 180,
            yaw: data.demo.rotation.yaw * Math.PI / 180,
            altitude : data.demo.altitudeMeters,
            speed : data.demo.velocity.z,
            angle : data.magneto.heading.fusionUnwrapped,
        });

        this.draw();
    }
        
    dashboard.prototype.setValues = function setValues(values) {
        this.roll = degrees(values.roll);
        this.pitch = degrees(values.pitch);
        this.yaw = degraees(values.yaw);
        this.altitude = values.altitude.toFixed(2);
        this.speed = values.speed.toFixed(2);
        this.angle = values.angle.toFixed(0);
    };
    
    var degrees = function(value)
    {
        temp = Math.round(value / Math.PI / 2 * 360) % 360;
        return (temp > 180) ? temp - 360: temp;
    }
    
    dashboard.prototype.draw = function draw() {
        $("#roll").html(this.roll);
        $("#pitch").html(this.pitch);
        $("#yaw").html(this.yaw);
        $("#altitude").html(this.altitude);
        $("#speed").html(this.speed);
        $("#angle").html(this.angle);
        $("#counter1").html(this.counter);
    };


    window.Cockpit.plugins.push(dashboard);

}(window, jQuery));