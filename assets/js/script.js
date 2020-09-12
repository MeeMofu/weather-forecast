latSearch=null;
lonSearch=null;
function getcitydetails(fqcn) {
 
	// if (typeof fqcn == "undefined") fqcn = jQuery("#f_elem_city").val();
 
	cityfqcn = fqcn;
 
	if (cityfqcn) {
 
	    jQuery.getJSON("https://secure.geobytes.com/GetCityDetails?key=7c756203dbb38590a66e01a5a3e1ad96&callback=?&fqcn="+cityfqcn,
                     function (data) {

	            latSearch=data.geobyteslatitude;
	            lonSearch=data.geobyteslongitude;  
	            }
	    );
	}
}
$("#f_elem_city").autocomplete({
    source: function (request, response) {
        jQuery.getJSON("https://secure.geobytes.com/AutoCompleteCity?key=7c756203dbb38590a66e01a5a3e1ad96&callback=?&q="+request.term,
            function (data) {
                response(data);
            }
        );
    },
    minLength: 3,
    select: function (event, ui) {
        var selectedObj = ui.item;
        $("#f_elem_city").val(selectedObj.value);
        getcitydetails(selectedObj.value);
        return false;
    },
    open: function () {
        $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
    },
    close: function () {
        $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
    }
 });
 $("#f_elem_city").autocomplete("option", "delay", 100);

 $('#searchBar').on("submit", function(event){
    event.preventDefault();
    //  save as object
    city = {
        name:$(this).find("input").val(),
        latitude:latSearch,
        longtitude:lonSearch
    }
    console.log(city.name);
    console.log(city.latitude);

    //

    
    // Clear fields
    $(this).find("input").val("");
    latSearch=null;
    lonSearch=null;
 });