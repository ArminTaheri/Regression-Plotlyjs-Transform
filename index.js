var R = require('ramda');
var regression = require('regression');
var Plotly = require('plotly.js');
var Lib = require('plotly.js/src/lib');

function regressionTransform() {
    var attributes = {
        traceIndex: {
            valType: 'number',
            dflt: 0
        },
        regressor: {
            valType: 'string',
            dflt: 'x'
        },
        regressand: {
            valType: 'string',
            dflt: 'y'
        }
    };

    const transform = {
        moduleType: 'transform',
        name: 'regression',
        attributes: attributes,
        supplyDefaults: function (transformIn) {
            var transformOut = {};
            function coerce(attr, dflt) {
                return Lib.coerce(transformIn, transformOut, attributes, attr, dflt);
            }

            coerce('traceIndex');
            coerce('regressor');
            coerce('regressand');

            return transformOut;
        },
        transform: function (data, state) {
            var attrs = state.transform
            var xdata = data[attrs.traceIndex][attrs.regressor];
            var ydata = data[attrs.traceIndex][attrs.regressand];
            var zippedData = R.zip(
                data[attrs.traceIndex][attrs.regressor],
                data[attrs.traceIndex][attrs.regressand]
            );

            var reg = regression('linear', zippedData);

            var regLine = {
                xvals: xdata,
                yvals: xdata.map(x => reg.equation[0]*x + reg.equation[1])
            }
            var fit = {
                type: 'scatter',
                mode: 'line',
                x: regLine.xvals,
                y: regLine.yvals
            };

            return R.append(fit, data);
        }
    };

    Plotly.register(transform);
}

regressionTransform();

function generateData() {
    var NUM_POINTS = 60;

    var randomSlope = Math.random()*10.0 - 5;
    var xdata = R.range(-NUM_POINTS/2.0, NUM_POINTS/2.0).map(x => x/NUM_POINTS);
    var ydata = xdata.map(x => randomSlope*x + Math.random()*4 - 2);

    return {
        xdata: xdata,
        ydata: ydata
    }
}

function init() {
    var gen = generateData();

    var data = [{
        type: 'scatter',
        mode: 'markers',
        x: gen.xdata,
        y: gen.ydata,
        transforms: [{
            type: 'regression',
            traceIndex: 0,
            regressor: 'x',
            regressand: 'y'
        }]
    }];

    var gd = document.querySelector('#graph');
    Plotly.newPlot(gd, data, {});
}

window.randomizePlot = init;
// Restyle throws exception
// window.randomizePlot = function() {
//     var gen = generateData();
//     var gd = document.querySelector('#graph');
//     Plotly.restyle(gd, {x: gen.xdata, y: gen.ydata}, 0);
// }


init();
