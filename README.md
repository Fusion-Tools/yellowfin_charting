# yellowfin_charting
A public repo of charting functions that can be used across YF and our web apps to make data processing and charting in JavaScript easier.


# Example of how this library can make YF data processing easier:

`
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
   var [unformattedData, formattedData] = processData(options.dataset.data);

   // Do the actual drawing of the chart into $chartDiv.
   doDrawing(unformattedData, formattedData, $chartDrawDiv, height, width, options.errorCallback);
},

processData = function(dataset) {

    // Data is in the dataset in a column based format, where each column has an array of data
    // eg. dataset.column_name[0].raw_data, dataset.column_name[0].formatted_data
    unformattedData = getUnformattedData(dataset, { dateColumns: ['month'] })
    formattedData = getFormattedData(dataset, { dateColumns: ['month'] })

    // Filtering to only quarterly data
    unformattedDataQuarterly = getQuarterlyData(unformattedData, unformattedData['month'])
    formattedDataQuarterly = getQuarterlyData(formattedData, unformattedData['month'])
    
    // Filtering row-wise to only December 
    unformattedDataDecember = filterByColumn(unformattedDataQuarterly, "month", (element, index) => {
        return(element.getMonth() == 11)
    })
    formattedDataDecember = filterByColumn(formattedDataQuarterly, "month", (element, index) => {
        return(element.includes("Dec"))
    })
    
    // Seperating each channel cut into seperate traces
    unformattedDataDecemberGrouped = seperateDataIntoGroups(unformattedDataDecember, {
        groupByColumns: ["channel_cut"],
        groupedColumnName: "grouped_column",
        groupOrder: ["B&M of Omni"]
    })
    formattedDataDecemberGrouped = seperateDataIntoGroups(formattedDataDecember, {
        groupByColumns: ["channel_cut"],
        groupedColumnName: "grouped_column",
        groupOrder: ["B&M of Omni"]
    })
    
    return([
        unformattedDataDecemberGrouped,
        formattedDataDecemberGrouped
    ])

},

doDrawing = function(unformattedData, formattedData, $chartDiv, height, width, errorFunction) {
    
    console.log("Unformatted Data: ", unformattedData)
    console.log("Formatted Data: ", formattedData)
    
   // Use require to load the javascript libraries you need

   // Libraries we ship with and their location:
   // js/chartingLibraries/c3/c3
   // js/chartingLibraries/chartjs/Chart
   // js/chartingLibraries/d3_3.5.17/d3_3.5.17
   require(['js/chartingLibraries/d3/d3'], function(d3) {

       try {

           // Your chart draw code here

       } catch(err){
           errorFunction(err);
       }
   });
}
`
