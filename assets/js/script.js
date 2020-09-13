var index=0;
var cityList=[];

function showCities(){
    $("#cityList").html("");
    $("#history").show();
    for (var i=0;i<cityList.length;i++){
        var nameDisplay = cityList[i].name.split(",")[0]+","+ cityList[i].name.split(",")[1]
        var cityEl = $("<li>").addClass("list-group-item btn-light").text(nameDisplay).attr("data-city-id",i);
        $("#cityList").append(cityEl);
    }
}

function loadMemory(){
    var memory = JSON.parse(localStorage.getItem("cityList"));
    if (memory) {
        cityList = memory;
        showCities();
    }
}

latSearch=null;
lonSearch=null;
function getcitydetails(fqcn) {
	if (fqcn) {
	    jQuery.getJSON("https://secure.geobytes.com/GetCityDetails?key=7c756203dbb38590a66e01a5a3e1ad96&callback=?&fqcn="+fqcn,
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

 function uvLevel(level){
    $("#currentUV").removeClass();
    if (level<3) $("#currentUV").addClass("bg-success text-white rounded");
    else if (level<7) $("#currentUV").addClass("bg-warning text-dark rounded");
    else $("#currentUV").addClass("bg-danger text-white rounded");
 }

 $("#f_elem_city").autocomplete("option", "delay", 100);

function iconName(weather){
    // Find name of the icon by result
    switch (weather){
        case "Thunderstorm": return "thunderstorm";
        case "Drizzle": return "sprinkle";
        case "Rain": return "rain";
        case "Snow": return "snow";
        case "Clear": return "sunny";
        case "Clouds": return "cloudy";
        default: return "fog";
    }
}
function isDay(icon){
    // Check if it's day or night but API's icon 
    if (icon==='n') return "night-alt";
    else return "day";
}

function displayFuture(list,day){
    $('#nextDays').html("");

    for (var i=1;i<6;i++){
        // Generate data for 1 day
        var icon = "wi pr-5 wi-day-"+iconName(list[i].weather[0].main);
        var time = day.add(i,'d').format("L");
        var humid = list[i].humidity;
        var tempMax =list[i].temp.max;
        var tempMin =list[i].temp.min;

        // Created layout for 1 day, then string it (Alt+Z helps)
        var divEL = $('<div>').html("<div class='row no-gutters justify-content-around'><div class='col-12 pl-3 pl-md-3'><p style='font-weight: bold;' class='pt-2'>" + time +"</p></div><div class='col-3 col-lg-12'><div class='ml-2 ml-xl-4 ml-sm-5 mb-2 ml-lg-1 ml-xl-3'><i class='"+ icon +"' style='font-size: 75px; color: darkgray;' id='currentIcon'> </i></div></div><div class='col-5 col-lg-12 pl-2 mb-2'><p class='my-2'>Max: " + tempMax + "&deg;F</p><p class='mb-2'>Min: "+ tempMin + "&deg;F</p><p>Humidity: " + humid + "%</p></div></div>")    
        divEL.addClass("col-12 col-lg-2 my-2 rounded nextDay border border-primary").attr("style","background-color: lightcyan;");
        // append element to container
        $('#nextDays').append(divEL)
    }

}

function displayWeather(forecast){
    var currentTime = moment().utc().add(forecast.timezone_offset,'seconds');
    var nameDisplay = cityList[index].name.split(",")[0]+","+ cityList[index].name.split(",")[1]
    
    // Update to current weather
    $("#city").text(nameDisplay);
    $("#date").text(currentTime.format("ddd, MMM Do YYYY"));
    $("#currentHumidity").text(forecast.current.humidity+"%");
    $("#currentWind").text(Math.round(forecast.current.wind_speed * 10) / 10+"mph");
    $("#currentUV").text(forecast.current.uvi);
    
    // Color UVI
    uvLevel(forecast.current.uvi);

    // Change icon
    var icon = "wi pr-5 wi-"+isDay(forecast.current.weather[0].icon[2])+"-"+iconName(forecast.current.weather[0].main);
    // Special case
    if (icon==="wi pr-5 wi-night-alt-sunny") icon="wi pr-5 wi-night-clear";
    if (icon==="wi pr-5 wi-night-alt-fog") icon="wi pr-5 wi-night-fog";

    $("#currentIcon").removeClass().addClass(icon);
    $("#currentDeg").html(Math.floor(forecast.current.temp)+"&deg;");

    // Format the description to have first uppercase
    var descrip = forecast.current.weather[0].description;
    $('#description').text(descrip[0].toUpperCase()+descrip.substring(1));

    displayFuture(forecast.daily,currentTime);

    // Show weather pannel
    $("#weatherPannel").show();

    // hide search bar (if collaped)
    $("#searchPannel").removeClass("show");
 }

function getWeatherForecast(lat, lon){
    

    // Get weather API
    fetch('https://api.openweathermap.org/data/2.5/onecall?appid=4267c83e8a58c92d87def6417ce19501&exclude=minutely,hourly&units=imperial&lat='+lat+'&lon='+lon)
    .then(function(respone){
        return respone.json();
    })
    .then(function(response){
        displayWeather(response);
        
    })
    .catch(function(error){
        alert("Something went wrong. Error: " + error)
    });
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
    index = -1;
    for (var i=0; i<cityList.length;i++){
        if (cityList[i].name === city.name){
          index = i;
          break;
        }    
    }
    // If not, add to memory, also for case when there's nothing in array
    if ((index===-1) || (cityList.length===0)){
        index=cityList.length;
        cityList.push(city);
        showCities();
        localStorage.setItem("cityList", JSON.stringify(cityList));
        console.log(index);
    }

    // Call API
    getWeatherForecast(cityList[index].latitude,cityList[index].longtitude);

 });

 $('#cityList').on('click','li',function(){
    // console.log($(this).attr("data-city-id"))
    index = $(this).attr("data-city-id");
    getWeatherForecast(cityList[index].latitude,cityList[index].longtitude);

 });

 loadMemory();