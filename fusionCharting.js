define(function() {
    
    /*******************************Utility Functions*******************************/

    /**
     * Recursively creates a deep clone of given object. Preserves data types like Date
     * @param {object} objectToBeCloned object to be deep cloned
     * @returns {object} A clone of the passed object
     */
    function deepCopy(objectToBeCloned) {
        let resultObj, value, key;

        if (typeof objectToBeCloned !== "object" || objectToBeCloned === null) {
            return objectToBeCloned;
        }

        if (typeof objectToBeCloned === "object") {
            if (objectToBeCloned.constructor.name !== "Object") {
                resultObj = new objectToBeCloned.constructor(objectToBeCloned);
            } else {
                resultObj = Array.isArray(objectToBeCloned) ? [] : {};
            }
        }

        for (key in objectToBeCloned) {
            value = objectToBeCloned[key];

            // Recursively copy for nested objects & arrays
            resultObj[key] = deepCopy(value);
        }

        return resultObj;
    }
    /****************************End Utility Functions****************************/


    /*****************************Selecting Functions*****************************/

    /**
     * Selects either raw_data or formatted_data for indicated columns.
     * @param {object} data Raw YF data object in the form of {col_name: {raw_data: [, ...], formatted_data: [, ...]}, ...}.
     * @param {Array} columns Names of columns to extract.
     * @param {Boolean} selectRawData Extract raw_data if True else extract formatted_data.
     * @param {Function} keyMapFn Used to generate the new column name. 
     * @returns {object} New Object in the form of {col_name: [, ...], ...}
     */
    function selectDataByVersion(data, columns, selectRawData, keyMapFn) {
        let newData = {};
        columns.forEach((key, _) => {
            newKey = typeof (keyMapFn) === 'function' ? keyMapFn(key) : key;
            
            newData[newKey] = []
            data[key].map((rowItem) => {
                newData[newKey].push(selectRawData ? rowItem.raw_data : rowItem.formatted_data);
            })
        });
        return newData;
    }

    /**
     * Selects formatted_data for indicated columns.
     * @param {object} data Raw YF data object in the form of {col_name: {raw_data: [, ...], formatted_data: [, ...]}, ...}.
     * @param {Array} columns Names of columns to extract.
     * @param {Function} keyMapFn Used to generate the new column name. 
     * @returns {object} New Object in the form of {col_name: [, ...], ...}
     */
    function getFormattedData(data, columns, keyMapFn) {
        return selectDataByVersion(data, columns, false, keyMapFn);
    }

    /**
     * Selects raw_data for indicated columns.
     * @param {object} data Raw YF data object in the form of {col_name: {raw_data: [, ...], formatted_data: [, ...]}, ...}.
     * @param {Array} columns Names of columns to extract.
     * @param {Function} keyMapFn Used to generate the new column name. 
     * @returns {object} New Object in the form of {col_name: [, ...], ...}
     */
    function getUnformattedData(data, columns, keyMapFn) {
        return selectDataByVersion(data, columns, true, keyMapFn);
    }

    /**
     * Selects data for indicated columns and convert data points to Date objects.
     * @param {object} data Raw YF data object in the form of {col_name: {raw_data: [, ...], formatted_data: [, ...]}, ...}.
     * @param {Array} columns Names of columns to extract.
     * @param {Function} keyMapFn Used to generate the new column name. 
     * @returns {object} New Object in the form of {col_name: [Date(), ...], ...}
     */
    function getDateData(data, columns, keyMapFn) {
        let buffer = getUnformattedData(data, columns, keyMapFn);
        for (k in buffer) {
            buffer[k] = buffer[k].map(
                dateStr => new Date(
                    // ? forcing timezone conversion
                    new Date(dateStr).toLocaleString('en-US', { timeZone: "Europe/London" })
                )
            );
        }
        return buffer;
    }


    /**
     * Selects data for indicated columns and convert data points to Date objects.
     * 
     * Note that there is no interface to change the column name in this function.
     * @param {object} data Raw YF data object in the form of {col_name: {raw_data: [, ...], formatted_data: [, ...]}, ...}.
     * @param 
     * @returns {object} 
     */
    function selectDataWithVersionSpecObject(
        data,
        { columnsOfFormatted = [], columnsOfUnformatted = [], columnsOfDate = [], } = {},
    ) {
        let fd = getFormattedData(data, columnsOfFormatted);
        let ud = getUnformattedData(data, columnsOfUnformatted);
        let dd = getDateData(data, columnsOfDate);
        return { ...fd, ...ud, ...dd }
    }
    /***************************End Selecting Functions***************************/


    /*****************************Filtering Functions*****************************/

    /**
     * Selects rows of data using pass-in index.
     * @param {object} data An object of arrays, i.e. {col_name: [, ...], ...}
     * @param {Array} index Row index to select.
     * @returns {object} New object containing only the indicated rows.
     */
    function selectRowByIndex(data, index) {
        let newData = {}
        for (const [columnName, column] of Object.entries(data)) {
            newData[columnName] = column.filter((_, i) => index.includes(i));
        }
        return newData;
    }

    /**
     * Gets the row index by matching values of a column to a list of lookup values.
     * @param {object} data An object of arrays, i.e. {col_name: [, ...], ...}
     * @param {String} column Name of column to check.
     * @param {Array} lookupValues Array of values to match with.
     * @returns {Array} Row index of matching values.
     */
    function matchByValues(data, column, lookupValues) {
        let index = [];
        data[column].forEach((e, i) => {
            if (lookupValues.includes(e)) {
                index.push(i);
            }
        })
        return index;
    }

    /**
     * Selects rows of data by matching values of a column to a list of lookup values.
     * @param {object} data An object of arrays, i.e. {col_name: [, ...], ...}
     * @param {String} column Name of column to check.
     * @param {Array} lookupValues Array of values to match with.
     * @returns {object} New object containing only the indicated rows.
     */
    function selectRowMatchByValues(data, column, lookupValues) {
        return selectRowByIndex(data, matchByValues(data, column, lookupValues));
    }

    /**
     * Gets the row index using a predicating function.
     * @param {object} data An object of arrays, i.e. {col_name: [, ...], ...}
     * @param {String} column Name of column to check.
     * @param {Function} filterFunc Predicates whether a row should be kept.
     * @returns {Array} Row index of rows that meet the predicate.
     */
    function filterByColumn(data, column, filterFunc) {
        let index = [];
        data[column].forEach((e, i) => {
            if (filterFunc(e)) {
                index.push(i);
            }
        })
        return index;
    }

    /**
     * Selects rows of data using a predicating function.
     * @param {object} data An object of arrays, i.e. {col_name: [, ...], ...}
     * @param {String} column Name of column to check.
     * @param {Function} filterFunc Predicates whether a row should be kept.
     * @returns {object} New object containing only the rows that meet the predicate.
     */
    function selectRowFilterByColumn(data, column, filterFunc) {
        return selectRowByIndex(data, filterByColumn(data, column, filterFunc));
    }


    /**
     * TODO
     * @param {any} data
     * @param {any} unformattedMonthList
     * @param {Number} numberOfMonthsInQuarter
     * @returns {any}
     */
    function getQuarterlyData(data, unformattedMonthList, numberOfMonthsInQuarter = 3) {
        const monthRemainder = new Date(Math.max.apply(null, unformattedMonthList)).getMonth() % numberOfMonthsInQuarter;
        let index = [];
        unformattedMonthList.forEach((e, i) => {
            if ((e.getMonth() % numberOfMonthsInQuarter) == monthRemainder) {
                index.push(i);
            }
        });
        return selectRowByIndex(data, index);
    }
    /***************************End Filtering Functions***************************/


    /*****************************Mutating Functions******************************/

    function recodeColumn(data, column, map) {
        // TODO

    }



    /***************************End Mutating Functions****************************/


    /*****************************Reshaping Functions*****************************/
    /**
     * Seperates the data into data groups so that they are easier to turn into individual lines/traces.
     * @param {object} data
     * @param {Array} groupByColumns Used as the keys for creating the groups, default [].
     *      e.g. if you use "month" here each group will be a different month
     * @param {String} groupedColumnName Used as name for the new group key column, default "grouped_column".
     * @param {Array} groupOrder Indicates which traces should come first in the data group order, default [].
     *      e.g. if groupByColumns=["channel_cut"] you could use groupOrder=["B&M of B&M"] to show B&M data first.
     * @returns {Array[object]}
     */
    function seperateDataIntoGroups(data, { groupByColumns = [], groupedColumnName = "grouped_column", groupOrder = [] } = {}) {
        let intermData = deepCopy(data); // Make a deep copy so that don't modify in-place
        let firstCol = intermData[Object.keys(intermData)[0]];
        // Add a concatenated column based on the seperationColumns
        intermData[groupedColumnName] = firstCol.map(
            // Concatenate each seperation column into one master primary key for seperation
            (_, i) => groupByColumns.map((key) => intermData[key][i]).join(', ')
        );

        // Get distinct groups from the seperation column
        let distinctGroups = [... new Set(intermData[groupedColumnName])]
        // Order groups if custom sort order was included
        distinctGroups = [
            ...groupOrder.filter(item => distinctGroups.includes(item)),
            ...distinctGroups.filter(item => !groupOrder.includes(item))
        ]

        // Convert the data into groups
        return distinctGroups.map(
            group => selectRowMatchByValues(intermData, groupedColumnName, [group])
        );
    }
    /***************************End Reshaping Functions***************************/


    /*******************************Hover Popup Functions*******************************/

    /**
     * Adds a hover popup to all anchor tags in the specified div. An iframe will be created as
     *      child of the document body to hold the popup.
     * @param {int} width The popup width
     * @param {int} height The popup height
     * @param {int} borderColor The border color
     * @returns {none} 
     * 
     */

    function createGlossaryPopup(width=600, height=180, borderColor="var(--primary-color)") {
            
        var popupWidth = width;
        var popupHeight = height;
        
        var glossaryId = "fusion-glossary-popup";
        
        function initializeGlossaryPopup() {
            document.body.insertAdjacentHTML( 'beforeend', `
                <iframe 
                    class="fusion-glossary-popup" id="` + glossaryId + `"
                    src="https://en.wikipedia.org/wiki/Main_Page"
                    style="
                        position: absolute;
                        opacity: 0;
                        display: none;
                        width: ` + popupWidth + `px;
                        height: ` + popupHeight + `px;
                        overflow-x: hidden;
                        overflow-y: hidden;
                        border: 1px solid ` + borderColor + `;
                        border-radius: 5px;
                        transition: opacity 0.2s;
                        z-index: 999999;
                    "
                ></iframe>
                ` );
        }
        
        function createGlossaryPopup(width=600, height=180, borderColor="var(--primary-color)") {
            
            var popupWidth = width;
            var popupHeight = height;
            
            var glossaryId = "fusion-glossary-popup";
            
            function initializeGlossaryPopup() {
                document.body.insertAdjacentHTML( 'beforeend', `
                    <iframe 
                        class="fusion-glossary-popup" id="` + glossaryId + `"
                        src="https://en.wikipedia.org/wiki/Main_Page"
                        style="
                            position: absolute;
                            opacity: 0;
                            display: none;
                            width: ` + popupWidth + `px;
                            height: ` + popupHeight + `px;
                            overflow-x: hidden;
                            overflow-y: hidden;
                            border: 1px solid ` + borderColor + `;
                            border-radius: 5px;
                            transition: opacity 0.2s;
                            z-index: 999999;
                        "
                    ></iframe>
                    ` );
            }
            
            var timeoutId = null;
            
            function startLoadingGlossaryPopup(event, anchorTag) {
                var glossaryPopup = document.getElementById(glossaryId);
                var glossaryPopupParentTransform = glossaryPopup.parentElement.getBoundingClientRect();
                
                // Get the cursor's X and Y relative to the page
                var x = event.pageX - glossaryPopupParentTransform.left;
                var y = event.pageY - glossaryPopupParentTransform.top;
                
                // Set the popups iframe to point towards the link's urls
                var href = anchorTag.href
                if(typeof anchorTag.href === "object") {
                    href = anchorTag.href.baseVal
                }
                glossaryPopup.src = href;
            
                // Set popup iframe url again (this seems to fix a bug where the url does not update the first time)
                glossaryPopup.src = href;
            }
            
            function revealGlossaryPopup(event, anchorTag) {
                var glossaryPopup = document.getElementById(glossaryId);
                
                var glossaryPopupParentTransform = glossaryPopup.parentElement.getBoundingClientRect();
                
                // Get the cursor's X and Y relative to the page
                var x = event.pageX - glossaryPopupParentTransform.left;
                var y = event.pageY - glossaryPopupParentTransform.top;
                
                glossaryPopup.style.left = (x + 20) + "px";
                glossaryPopup.style.top = (y + 20) + "px";
                
                // Display the popup and move it into position
                glossaryPopup.style.opacity = "1";
                glossaryPopup.style.display = "";
                
                glossaryPopupLoadingBarContainer.style.opacity = "0";
                glossaryPopupLoadingBarContainer.style.display = "none";
            }
            
            function showGlossaryPopup(event, anchorTag) {
                
                startLoadingGlossaryPopup(event, anchorTag);
                timeoutId = window.setTimeout(function(){
                    revealGlossaryPopup(event, anchorTag);
                }, 1000);
            }
            
            function hideGlossaryPopup(event) {
                document.getElementById(glossaryId).style.opacity = "0";
                document.getElementById(glossaryId).style.display = "none";
                var glossaryPopup = document.getElementById(glossaryId);
                glossaryPopup.src = "";
                window.clearTimeout(timeoutId);
            }
            
            function addHoverEventsToLink(oldAanchorTag) {
                
                var anchorTag = oldAanchorTag.cloneNode(true)
                oldAanchorTag.replaceWith(anchorTag);
                
                // Add an event to make the popup appear when the link is hovered over
                anchorTag.addEventListener("mouseover", (event) => {showGlossaryPopup(event, anchorTag)});
    
                // Add an event to make the popup disappear when the mouse is moved away
                anchorTag.addEventListener("mouseout", hideGlossaryPopup);
                
                anchorTag.setAttribute("glossaryPopup", true)
            }
            
            // If popup doesn't already exist on the page add to the end of the HTML body
            if(!document.getElementById(glossaryId)) {
                initializeGlossaryPopup();
            }
            
            var currentSubTabId = document.getElementsByClassName("activeSubTab")[0].id;
            
            function addHoverEventToAllCharts() {
                var charts = [...document.getElementsByClassName("rptChartContainer")];
                
                charts.map((chart) => {
                    // Get all <a> tags that are descendants of chart
                    var anchorTags = [...chart.getElementsByTagName("a")];
                    
                    anchorTags.map((anchorTag) => {
                        var href = anchorTag.href
                        if(typeof anchorTag.href === "object") {
                            href = anchorTag.href.baseVal
                        }
                        if(href.includes("glossary.fusionanalyticsdatahub.com") && !anchorTag.getAttribute("glossaryPopup")) {
                            addHoverEventsToLink(anchorTag);
                        }
                    });
                });
                
                if(typeof currentSubTabId !== 'undefined' && document.getElementsByClassName("activeSubTab")[0].id === currentSubTabId) {
                    setTimeout(addHoverEventToAllCharts, 3500)
                }
            }
            addHoverEventToAllCharts();
                
        }
    }
    /****************************End Hover Popup Functions****************************/

    return({
        deepCopy,
        selectDataByVersion,
        getFormattedData,
        getUnformattedData,
        getDateData,
        selectDataWithVersionSpecObject,
        selectRowByIndex,
        matchByValues,
        selectRowMatchByValues,
        filterByColumn,
        selectRowFilterByColumn,
        getQuarterlyData,
        recodeColumn,
        seperateDataIntoGroups,
        createGlossaryPopup
    });
});
