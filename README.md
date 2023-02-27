# yellowfin_charting
A public repo of charting functions that can be used across YF and our web apps to make data processing and charting in JavaScript easier.


# Example of how this library can make YF data processing easier:

        //generateChart is a required function which will be called to generate your Javascript chart
        generateChart = function(options) {

           // This will trigger a breakpoint in your browser debugger so you can debug your javascript
            // This is the div you draw your chart into
            var $chartDrawDiv = $(options.divSelector);

            // To stop scrollbars in any portlets regardless of your javascript, use this css class
            $chartDrawDiv.addClass('jsChartNoOverflow');

            // This gets the height and width from the dataset. Use these when creating your chart so that
            // it will fit the dashboard, canvas and storyboard correctly
            var height = options.dataset.chart_information.height;
            var width = options.dataset.chart_information.width;

            require(['https://cdn.jsdelivr.net/gh/Fusion-Tools/yellowfin_charting@latest/fusionCharting.js'], function(fusionCharting) {

                // Convert the raw data JSON to the format required for the chart if required.
                var [unformattedData, formattedData] = processData(options.dataset.data);

                doDrawing(unformattedData, formattedData, $chartDrawDiv, height, width, options.errorCallback);

            });
        },

        processData = function(dataset, getOppositeFormat = false) {
            // Data is in the dataset in a column based format, where each column has an array of data
            // eg. dataset.column_name[0].raw_data, dataset.column_name[0].formatted_data
            var unformattedData = getUnformattedData(dataset, Object.keys(dataset));
            var formattedData = getFormattedData(dataset, Object.keys(dataset));

            console.log(formattedData);

            // Seperating each channel cut into seperate traces
            var unformattedDataGrouped = seperateDataIntoGroups(unformattedData, {
                groupByColumns: inputs.groupByColumns,
                groupedColumnName: inputs.groupedColumnName,
                groupOrder: inputs.groupOrder
            });
            var formattedDataGrouped = seperateDataIntoGroups(formattedData, {
                groupByColumns: inputs.groupByColumns,
                groupedColumnName: inputs.groupedColumnName,
                groupOrder: inputs.groupOrder
            });


            unformattedData = unformattedDataGrouped;
            formattedData = formattedDataGrouped;

            return([unformattedData, formattedData]);

        },
        
        doDrawing = function(unformattedData, formattedData, $chartDiv, height, width, errorFunction) {
        
            // Draw stuff here!
        
        }
