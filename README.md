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

        // Convert the raw data JSON to the format required for the chart if required.
        processData(
            options.dataset.data,
            (unformattedData, formattedData) => {
                doDrawing(unformattedData, formattedData, $chartDrawDiv, height, width, options.errorCallback)
                
            }
        );
        
        },

        processData = function(dataset, doDrawingCallback) {
            
            require(['https://cdn.jsdelivr.net/gh/Fusion-Tools/yellowfin_charting@main/fusionCharting.js'], function(fusionCharting) {

            // Data is in the dataset in a column based format, where each column has an array of data
                // eg. dataset.column_name[0].raw_data, dataset.column_name[0].formatted_data
                var unformattedData = getUnformattedData(dataset, { dateColumns: ['month'] })
                var formattedData = getFormattedData(dataset, { dateColumns: ['month'] })
                
                // Filtering to only quarterly data
                var unformattedDataQuarterly = getQuarterlyData(unformattedData, unformattedData['month'])
                var formattedDataQuarterly = getQuarterlyData(formattedData, unformattedData['month'])
                
                // Filtering row-wise to only December 
                var unformattedDataDecember = filterByColumn(unformattedDataQuarterly, "month", (element, index) => {
                    return(element.getMonth() == 11)
                })
                var formattedDataDecember = filterByColumn(formattedDataQuarterly, "month", (element, index) => {
                    return(element.includes("Dec"))
                })
                
                // Seperating each channel cut into seperate traces
                var unformattedDataDecemberGrouped = seperateDataIntoGroups(unformattedDataDecember, {
                    groupByColumns: ["channel_cut"],
                    groupedColumnName: "grouped_column",
                    groupOrder: ["B&M of Omni"]
                })
                var formattedDataDecemberGrouped = seperateDataIntoGroups(formattedDataDecember, {
                    groupByColumns: ["channel_cut"],
                    groupedColumnName: "grouped_column",
                    groupOrder: ["B&M of Omni"]
                })
                
                
                unformattedData = unformattedDataDecemberGrouped;
                formattedData = formattedDataDecemberGrouped;
                
                doDrawingCallback(unformattedData, formattedData)
            
        });

        },

        doDrawing = function(unformattedData, formattedData, $chartDiv, height, width, errorFunction) {
            
            console.log("Unformatted Data: ", unformattedData)
            console.log("Formatted Data: ", formattedData)
            
        // Use require to load the javascript libraries you need

        // Libraries we ship with and their location:
        // js/chartingLibraries/c3/c3
        // js/chartingLibraries/chartjs/Chart
        // js/chartingLibraries/d3_3.5.17/d3_3.5.17

        try {

            // Your chart draw code here

        } catch(err){
            errorFunction(err);
        }
        }
