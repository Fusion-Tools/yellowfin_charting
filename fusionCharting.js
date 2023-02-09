removeExcessData = function(data, columnFormat, {dateColumns} = { dateColumns: [] }) {
    // Removes data like unformatted and raw data
    // Generally should not be called externally, just be used by this library internally
    // by the getFormattedData() and getUnformattedData() functions
    newData = {}
    for (const [metricKey, metricValues] of Object.entries(data)) {
        newData[metricKey] = [];

        if (columnFormat === "formatted_data") {
            metricValues.map(dataPoint => { newData[metricKey].push(dataPoint.formatted_data) });
        } else if (dateColumns.indexOf(metricKey) > -1) {
            // If Date column then convert to JS date
            metricValues.map(dataPoint => {
                newData[metricKey].push(new Date(new Date(dataPoint.raw_data).toLocaleString('en-US', { timeZone: "Europe/London" })))
            });
        } else {
            // If Metric Key in unformatted column list then use raw_data
            metricValues.map(dataPoint => { newData[metricKey].push(dataPoint.raw_data) });
        } 
    }
    return(newData);
}

getFormattedData = function(data, {dateColumns} = { dateColumns: [] }) {
    // Takes the dataset YF provides and returns the formatted version of the data
    // (Date columns are kept in the formatted version, not converted to Date objects)
    // This and getUnformattedData() should be the first data processing functions called
    
    newData = removeExcessData(data, "formatted_data", { dateColumns: dateColumns });
    return newData;
}

getUnformattedData = function(data, {dateColumns} = { dateColumns: [] }) {
    // Takes the dataset YF provides and returns the formatted version of the data
    // (Date columns are convered to JS Date objects)
    // This and getFormattedData() should be the first data processing functions called
    
    newData = removeExcessData(data, "raw_data", { dateColumns: dateColumns });
    return newData;
}

getQuarterlyData = function(data, unformattedMonthList, {numberOfMonthsInQuarter} = { numberOfMonthsInQuarter: 3 }) {
    // Takes the output of the getFormattedData() or getUnformattedData() and returns
    // the quarterly data only. Quarterly months are based off the MAX month
    //
    // unformattedMonthList: should be the month column returns by getUnformattedData()
    
    var maxDate = new Date(Math.max.apply(null, unformattedMonthList));
    
    var maxMonth = maxDate.getMonth()
    var quarterlyMonthIndexs = unformattedMonthList.map((e, i) => {
        return((e.getMonth() % numberOfMonthsInQuarter) == (maxMonth % numberOfMonthsInQuarter))
    })
    
    newData = {}
    for (const [columnName, column] of Object.entries(data)) {
        newData[columnName] = column.filter((row, rowIndex) => { return(quarterlyMonthIndexs[rowIndex]) })
    }
    
    return(newData)
}

seperateDataIntoGroups = function(data, {groupByColumns, groupedColumnName, groupOrder} = { groupByColumns: [], groupedColumnName: "grouped_column", groupOrder: [] }) {
    // Seperates the data into data groups so that they are easier to turn into individual lines/traces
    //
    // groupByColumns: Columns that will be used as the "key" for creating the groups
    //      ie. if you use month here each group will be a different month
    // groupedColumnName: when multiple columns are provided this column will be the concatenation of them (seperated by ", ")
    // groupOrder: A list of which traces should come first in the data group order
    //      ie. if groupByColumns=["channel_cut"] you could use groupOrder=["B&M of B&M"] to show B&M data first
    var newData = data;
    // Add a concatenated column based on the seperationColumns
    newData[groupedColumnName] = newData[Object.keys(data)[0]].map(
        (dataPoint, dataPointIndex) => {
            // Concatenate each seperation column into one master primary key for seperation
            var seperationColumnValue = '';
            groupByColumns.map((seperationColumn) => {
                seperationColumnValue += ', ' + data[seperationColumn][dataPointIndex];
            });
            if (seperationColumnValue.length > 2) {
                seperationColumnValue = seperationColumnValue.substring(2);
            }
            return(seperationColumnValue);
        }
    );

    // Get distinct groups from the seperation column
    var distinctSeperationGroups = [... new Set(newData[groupedColumnName])].filter(group => group != ', ');
    // Order groups if custom sort order was included
    var customOrderItems = groupOrder.filter(item => distinctSeperationGroups.includes(item));
    distinctSeperationGroups = customOrderItems.concat(distinctSeperationGroups.filter(item => !customOrderItems.includes(item)));
    var finalData = [];
    distinctSeperationGroups.map(
        (seperationGroup, seperationGroupIndex) => {
            STEP_group_indexes = [];
            newData[groupedColumnName].map((dataPoint, dataPointIndex) => {
                if (dataPoint == seperationGroup) {
                    STEP_group_indexes.push(dataPointIndex);
                }
            });
            seperatedData = {};
            for (const [columnName, columnValues] of Object.entries(newData)) {
                var columnValuesInGroup = STEP_group_indexes.map(index => columnValues[index]);
                seperatedData[columnName] = columnValuesInGroup;
            }
            finalData.push({});
            finalData[seperationGroupIndex] = seperatedData;
        }
    );
    
    return finalData;
}

filterByColumn = function(data, columnName, filteringFunction) {
    // Filters all columns of the data row-wise
    //
    // columnName: this is the column that the filtering will be based off of
    // filteringFunction: A function that takes each entry in the columnName column and returns true when 
    //      the column should be kept
    
    rowsToBeKept = data[columnName].map((rowValue, rowIndex) => {
        return(filteringFunction(rowValue, rowIndex)) 
    })
    
    newData = {}
    for (const [columnName, column] of Object.entries(data)) {
        newData[columnName] = column.filter((row, rowIndex) => { return(rowsToBeKept[rowIndex]) })
    }
    
    return(newData)
}