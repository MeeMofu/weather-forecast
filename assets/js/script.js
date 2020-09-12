var cityList=[];

function showCities(){
    $("#cityList").html("");
    $("#history").show();
    for (var i=0;i<cityList.length;i++){
        var nameDisplay = cityList[i].name.split(",")[0]+","+ cityList[i].name.split(",")[1]
        var cityEl = $("<li>").addClass("list-group-item").text(nameDisplay).attr("data-city-id",i);
        $("#cityList").append(cityEl);
    }
}

function loadMemory(){
    var memory = JSON.parse(localStorage.getItem("cityList"));
    if (memory) {
        cityList = memory;
        // console.log(cityList);
        showCities();
    }
}

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

function getWeatherForecast(lat, lon){
    fetch('https://api.openweathermap.org/data/2.5/onecall?appid=4267c83e8a58c92d87def6417ce19501&lat='+lat+'&lon='+lon)
    .then(function(respone){
        return respone.json();
    })
    .then(function(response){
        console.log(response);
    })
    .catch(function(error){
        alert("Something went wrong. Error: " + error)
    });
}

function displayWeather(){

}

 $('#searchBar').on("submit", function(event){
    event.preventDefault();
    // Exit if empty or invalid
    if (latSearch == null || lonSearch ==null){
        alert("Please enter a valid city");
        return;
    }

    //  save as object
    city = {
        name:$(this).find("input").val(),
        latitude:latSearch,
        longtitude:lonSearch
    }

    // Clear fields
    $(this).find("input").val("");
    latSearch=null;
    lonSearch=null;

    // Check if the field existed in the current list
    var index = -1;
    for (var i=0; i<cityList.length;i++){
        if (cityList[i].name === city.name){
          index = i;
          break;
        }    
    }
    
    // If not, add to memory, also for case when there's nothing in array
    if ((index===-1) || (cityList.length===0)){
        cityList.push(city);
        showCities();
        localStorage.setItem("cityList", JSON.stringify(cityList));
    }

    // Call API
    getWeatherForecast(city.latitude,city.longtitude);
    displayWeather();

 });

 $('#cityList').on('click','li',function(){
    // console.log($(this).attr("data-city-id"))
    var index = $(this).attr("data-city-id");
    getWeatherForecast(cityList[index].latitude,cityList[index].longtitude);

 });

 loadMemory();