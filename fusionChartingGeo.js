define(["require", "./fusionChartingImages"], function (require) {
    var fusionChartingImages = require("./fusionChartingImages");

    /*******************************Mapping Functions*******************************/

    /**
     * Creates a choropleth map based on the fusion 9 regions.
     * @param {string} parentContainerId The ID of the div you want to be the parent of the map.
     *      The map will be inserted as the last child of this div
     * @param {int} width Width of the map in px (has been tested for 760)
     * @param {int} height Height of the map in px (has been tested for 760)
     * @param {string} title Map title (can include HTML elements like <span> or <br>)
     * @param {string} color Map color (either a rgb(a) string like "rbg(100, 100, 100)" or
     *      a hexidecimal code like "#FFFFFF")
     * @returns {object} An object containing the maps metadata and utility functions
     *      (Including the addDemoCut() function).
     * 
     * THIS FUNCTION MUST BE USED FROM WITHIN YELLOWFIN
     */
    function createChoroplethMap(parentContainerId, width, height, title, color) {

        // Generate random id
        var containerId = "fusion-map-container-" + Math.floor(Math.random() * 9999999999)

        // Create container (absolute pos)
        parentContainer = document.getElementById(parentContainerId);
        parentContainer.insertAdjacentHTML('beforeend', `
            <div 
                id="` + containerId + `"
                style="
                        width: ` + width + `px;
                        height: ` + height + `px;
                        position: relative;
                        line-height: normal;
                        font-family: Arial, Tahoma, Helvetica, Geneva, sans-serif;
                    "
            >
                <h2 style="position: absolute;
                    margin: 0;
                    font-family: Arial, Tahoma, Helvetica, Geneva, sans-serif;
                    font-size: 24px;
                    z-index: 99">` + title + `
                </h2>
                <svg id="` + containerId + `-svg" width=100% height=100%></svg>
            </div>
        ` );

        var container = document.getElementById(containerId);
        var svgContainer = document.getElementById(containerId + "-svg");

        // Map Metadata Object
        var mapObject = {
            width: width,
            height: height,
            container: container,
            parentContainerId: parentContainerId,
            svgContainer: svgContainer,
            defaultColor: color,
            addDemoCut: function (demoCut, valuePercentage, text = "", color = this.defaultColor, drawText = true, drawLine = true, textSizeMultiplier = 1) {
                /**
                 * Adds a single region to the cloropeth map
                 * @param {string} demoCut The demo cut for the region. Options include:
                 *      "Canada", "Vancouver", "Rest of British Columbia", "Alberta", "Saskatchewan / Manitoba"
                 *      "Rest of Ontario", "Toronto", "Rest of Quebec", "Montreal", "Atlantic", "West"
                 *      "Ontario", "Quebec", "ENG Canada", "British Columbia", "Prairies",West + Ontario"
                 * @param {float} valuePercentage Number from 0 to 100. Controls the opacity of the region.
                 * @param {string} text What should the label for the region say? Defaults to blank 
                 * @param {string} color Map color (either a rgb(a) string like "rbg(100, 100, 100)" or
                 *      a hexidecimal code like "#FFFFFF"). Defaults to the map color.
                 * @param {string} drawText Should the label be drawn?
                 * @param {string} drawLine Should the line to the label be drawn?
                 * @param {float} textSizeMultiplier The size of the text will be multiplied by this amount.
                 * @returns {null} 
                 */

                var demoCutAbsolutePositions = {
                    "Canada": { top: 18, left: 70, regionTop: 15, regionLeft: 50, lineOrientation: "right" },
                    "Vancouver": { top: 68, left: 0, regionTop: 62, regionLeft: 15, lineOrientation: "right" },
                    "Rest of British Columbia": { top: 83, left: 7, regionTop: 64, regionLeft: 20, lineOrientation: "right" },
                    "Alberta": { top: 68, left: 22, regionTop: 65, regionLeft: 25, lineOrientation: "left" },
                    "Saskatchewan / Manitoba": { top: 83, left: 30, regionTop: 67, regionLeft: 38, lineOrientation: "right" },
                    "Rest of Ontario": { top: 68, left: 40, regionTop: 67, regionLeft: 53, lineOrientation: "right" },
                    "Toronto": { top: 83, left: 53, regionTop: 71, regionLeft: 64.5, lineOrientation: "right" },
                    "Rest of Quebec": { top: 68, left: 77, regionTop: 66, regionLeft: 72, lineOrientation: "left" },
                    "Montreal": { top: 83, left: 72, regionTop: 67.5, regionLeft: 69, lineOrientation: "left" },
                    "Atlantic": { top: 56, left: 84, regionTop: 56, regionLeft: 88, lineOrientation: "left" },
                    "West": { top: 68, left: 20, regionTop: 65, regionLeft: 25, lineOrientation: "left" },
                    "Ontario": { top: 83, left: 55, regionTop: 71, regionLeft: 64.5, lineOrientation: "right" },
                    "Quebec": { top: 68, left: 77, regionTop: 66, regionLeft: 72, lineOrientation: "left" },
                    "ENG Canada": { top: 68, left: 40, regionTop: 67, regionLeft: 53, lineOrientation: "right" },
                    "British Columbia": { top: 83, left: 7, regionTop: 64, regionLeft: 18, lineOrientation: "right" },
                    "Prairies": { top: 83, left: 30, regionTop: 67, regionLeft: 37, lineOrientation: "right" },
                    "West + Ontario": { top: 68, left: 40, regionTop: 67, regionLeft: 53, lineOrientation: "right" },
                }

                function addDemoCutLine(svgContainer, textTop, textLeft, regionTop, regionLeft, lineOrientation) {
                    // background: linear-gradient(to bottom right, white, white 48%, gray 48%, gray 52%, green 52%, green);
                    // console.log(lineOrientation)
                    var top = textTop;
                    var left = textLeft;

                    if (regionTop < top) { top = regionTop }
                    if (regionLeft < left) { left = regionLeft }

                    var height = Math.abs(textTop - regionTop);
                    var width = Math.abs(textLeft - regionLeft);

                    svgContainer.insertAdjacentHTML('beforeend', `
                        <line x1="` + textLeft + `%" y1="` + textTop + `%" x2="` + regionLeft + `%" y2="` + textTop + `%" style="stroke:` + color + `;stroke-width:2;opacity:0.3;" />
                `   );
                    svgContainer.insertAdjacentHTML('beforeend', `
                        <line x1="` + regionLeft + `%" y1="` + textTop + `%" x2="` + regionLeft + `%" y2="` + regionTop + `%" style="stroke:` + color + `;stroke-width:2;opacity:0.3;" />
                `   );

                }

                function addDemoCutText(container, title, text, top, left, regionTop, regionLeft, lineOrientation, svgContainer, width = 15, height = 15, drawLine = true, textSizeMultiplier = 1) {
                    container.insertAdjacentHTML('beforeend', `
                        <div
                            style="
                                position: absolute;
                                left: ` + left + `%;
                                top: ` + top + `%;
                                width: ` + width + `%;
                                height: ` + height + `%;
                            "
                        >
                            <h3 style="border-left: 4px solid ` + color + `; padding-left: 5px; background: white; font-size: ` + (18 * textSizeMultiplier) + `px;">
                                ` + title + `<br />
                                <span style="font-size: ` + (14 * textSizeMultiplier) + `px;">` + text + `</span>
                            </h3>
                        </div>
                `   );
                    if (drawLine) { addDemoCutLine(svgContainer, top + (height / 16), left + (width / 4), regionTop, regionLeft, lineOrientation) }
                }

                var demoCutString = demoCut.replace(/ /g, "").replace(/\//g, "");
                var imageUrl = "./customimages/fusionIcons/RegionalDemoCutIcons/" + demoCutString + "Icon.png";

                this.container.insertAdjacentHTML('beforeend', `
                    <img 
                        src="` + imageUrl + `"
                        style="
                            position: absolute;
                            left: 4%;
                            top: -3%;
                            width: 88%;
                            height: 88%;
                            opacity: ` + (valuePercentage / 100) + `;
                            ` + fusionChartingImages.getCssStyleForColor(color) + `"
                    />
                ` );


                if (drawText) {
                    addDemoCutText(container,
                        demoCut,
                        text,
                        demoCutAbsolutePositions[demoCut].top,
                        demoCutAbsolutePositions[demoCut].left,
                        demoCutAbsolutePositions[demoCut].regionTop,
                        demoCutAbsolutePositions[demoCut].regionLeft,
                        demoCutAbsolutePositions[demoCut].lineOrientation,
                        this.svgContainer,
                        15,
                        15,
                        drawLine,
                        textSizeMultiplier,
                    )
                }
            }
        }

        // Return the MetaData object
        return (mapObject)
    }
    /****************************End Mapping Functions****************************/


    return ({
        createChoroplethMap
    });
});
