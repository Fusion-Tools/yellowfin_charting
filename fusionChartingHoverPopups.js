define(function() {
    
    /*******************************Hover Popup Functions*******************************/

    /**
     * Adds a hover popup to all links in the specified div. An iframe will be created as
     *      child of this div.
     * @param {string} divId The ancestor div of all the target links. This divs "position" will be set to "relative"
     * @returns {none} 
     * 
     */

    function addHoverPopupToLinks(divId, options = {width: 600, height: 160}) {
    
        var popupWidth = options.width;
        var popupHeight = options.height;
        
        // Add glossary hover popups
        var glossaryId = "fusion-glossary-popup";
        var chart = document.getElementById(divId);
        
        if(!document.getElementById(glossaryId)) {
            document.body.insertAdjacentHTML( 'beforeend', `
                <iframe 
                    class="fusion-glossary-popup" id="` + glossaryId + `"
                    src="https://en.wikipedia.org/wiki/Main_Page"
                    style="
                        position: absolute;
                        opacity: 0;
                        width: ` + popupWidth + `px;
                        height: ` + popupHeight + `px;
                        overflow-x: hidden;
                        overflow-y: hidden;
                        border: 1px solid var(--primary-color);
                        border-radius: 5px;
                        transition: opacity 0.2s;
                        z-index: 999999;
                    "
                ></iframe>
                ` );
        }
        var anchorTags = [...chart.getElementsByTagName("a")];
        
        anchorTags.map((anchorTag) => {
            
            anchorTag.addEventListener("mouseover", (event) => {
                
                var glossaryPopup = document.getElementById(glossaryId);
                var glossaryPopupParentTransform = glossaryPopup.parentElement.getBoundingClientRect();
                
                glossaryPopup.src = anchorTag.href.baseVal;
                
                var x = event.pageX - glossaryPopupParentTransform.left + 5;
                var y = event.pageY - glossaryPopupParentTransform.top + 5;

                glossaryPopup.style.opacity = "1";
                glossaryPopup.style.left = x + "px";
                glossaryPopup.style.top = y + "px";
                
                glossaryPopup.src = anchorTag.href.baseVal;
            });
            anchorTag.addEventListener("mouseout", (event) => {
                document.getElementById(glossaryId).style.opacity = "0";
                var glossaryPopup = document.getElementById(glossaryId);
                glossaryPopup.src = "https://en.wikipedia.org/wiki/Database";
            });
            
        })
    }
    /****************************End Hover Popup Functions****************************/


    return({
        addHoverPopupToLinks
    });
});