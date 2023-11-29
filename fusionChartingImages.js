define(function () {

    const createPlotlyAxisImages = function (
        plotData,
        distanceFromAxis = 0.15,
        imageSize = 0.8
    ) {
        /*
        For each trace in the plot add images onto the axis based on xAxisImageURLs and yAxisImageURLs

        plotData: plotly data object
            Some of traces in the plotData object should have the following properties:
                xAxisImageURLs: array of image URLs to be placed on the x axis (similar format to the x values, but URLs instead)
                yAxisImageURLs: array of image URLs to be placed on the y axis (similar format to the x values, but URLs instead)
        distanceFromAxis: distance from axis in fraction of axis length
        imageSize: size of image in fraction from [0 - 1]

        returns: array of image objects which cna be passed into plotly's layout.images
        */

        images = [];

        for (var traceIndex = 0; traceIndex < plotData.length; traceIndex++) {

            var trace = plotData[traceIndex];

            var yaxis = "y1";
            var xaxis = "x1";

            axesWithImages = []
            if (typeof trace.xAxisImageURLs !== 'undefined') {
                axesWithImages += "x"
                xaxis = xaxis;
            }
            if (typeof trace.yAxisImageURLs !== 'undefined') {
                axesWithImages += "y"
                yaxis = trace.yaxis;
            }
            if (typeof xaxis === "undefined") {
                xaxis = "x1"
            }
            if (typeof yaxis === "undefined") {
                yaxis = "y1"
            }

            for (var axesIndex = 0; axesIndex < axesWithImages.length; axesIndex++) {

                axis = axesWithImages[axesIndex];
                axisImageURLs = axis + "AxisImageURLs"

                if (trace[axis].length != trace[axisImageURLs].length) {
                    throw new Error("X axis length is " + trace[axis].length + ", but " + trace[axisImageURLs].length + " image URLs were provided.")
                }

                for (var dataPointIndex = 0; dataPointIndex < trace[axis].length; dataPointIndex++) {

                    images.push({
                        "source": trace[axisImageURLs][dataPointIndex],
                        "xref": axis === "x" ? xaxis : "paper",
                        "yref": axis === "y" ? yaxis : "paper",
                        "x": axis === "x" ? trace[axis][dataPointIndex] : -distanceFromAxis,
                        "y": axis === "y" ? trace[axis][dataPointIndex] : -distanceFromAxis,
                        "sizex": imageSize,
                        "sizey": imageSize,
                        //"xanchor": axis === "x" ? "center" : "right",
                        //"yanchor": axis === "y" ? "middle" : "top",
                        "xanchor": "center",
                        "yanchor": "middle",
                    });

                }

            }


        }
        return images;

    }

    return ({
        createPlotlyAxisImages,
    });

});