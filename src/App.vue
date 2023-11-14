
<template>
 
  <main>
    <div>
      <div id="LocationsDiv">
	<div id="LocationSearch" class="d-flex">
	  <button class="btn btn-primary" @click="this.deleteLocation">Delete</button>&nbsp;&nbsp;
	  <input ref="LocationInput" type="text" class="form-control" placeholder="Location" @keyup.enter="this.addLocation">&nbsp;&nbsp;
	  <button class="btn btn-primary" @click="this.addLocation">Add</button>&nbsp;&nbsp;
	  <button class="btn btn-primary text-nowrap" @click="this.MoveToPosition(this.center)">Current Location</button>
	</div><br>
	<div id="LocationsTableDiv">
	  <vxe-table border expty-text="No More Data" :data="table_locations" class="vxe" ref="LocationTable" :align="'center'">
	    <template #empty>
	      <div>
		<img src="" />
		<p>No More Data</p>
	      </div>
	    </template>
	    <vxe-column type="checkbox" width="60"></vxe-column>
	    <vxe-column field="name" title="Name" min-width="10px"></vxe-column>
	    <vxe-column field="address" title="Address"></vxe-column>
	  </vxe-table>
	  <vxe-pager
      
	    v-model:current-page="current_page"
      
	    :page-size="page_size"
      
	    :total="locations.length"
      
	    :layouts="['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump']"

	    @page-change="setPage"
      
	    class="vxe"
      
	    ></vxe-pager>
	  
	</div>
      </div>
      <div id="GoogleMapDiv">
	<div id="LastestTime"></div><br>
	<GoogleMap id="GoogleMap" ref="GoogleMap" :api-key="ApiKey" :center="center" :zoom="15">
	  <Marker v-for="(location, index) in locations" :options="{title:location.name,position:location.position}" :key="index"/>  
	</GoogleMap>
      </div>
    </div>
  </main>
</template>

<style>

@media(min-width:1200px){

    #LocationsDiv{

	width: 550px;
	    
	float: left;
    
    }

    #GoogleMapDiv{	

	width: 600px;

	height: 600px;

	float: right;
    }
    
    #GoogleMap{

	width: 100%;

	height: 100%;
    
    }
    
}

@media(max-width:1200px){

    #GoogleMapDiv{

	width: 600px;

	height: 600px;
    
    }

    #GoogleMap{

	width: 100%;

	height: 100%;
    
    }
    
}

</style>

<script>
import axios from "axios";
import { onMounted, onUnmounted, defineComponent } from "vue";
import { GoogleMap, Marker } from "vue3-google-map";

export default defineComponent({

    components: { GoogleMap, Marker },
      
    setup() {

	const ApiKey = "AIzaSyAVgk9DnjlZnYryar5mO4b0pUTyG_qLyR4"; // Google Map API Key
	  
	const center = { lat: 43.01693875357613, lng:  -81.28333920967742 }; // Default Map Center Position

	const locations_id = new Set();  // Set to record Place ID that already searched

	return { ApiKey, center, locations_id};

    },

    data(){

	return{

	    locations: [], // All the locations searched

	    current_page: 1, // The current page number of the table

	    page_size: 10, // Rows a page have

	    table_locations: [], // Locations to be displayed in current page

	    lastest_location_id: null, // The ID of the lastest searched location

	    TimeZone: "", // Timezone of the latest location

	    rawOffset: 0, // Differences between the time of latest place and UTC in seconds

	};
	
    },

    methods:{

	MoveToPosition(location){ // Move the map to the position

	    this.$refs.GoogleMap.map.panTo(location); 
	    
	},

	getCurPosition(){ // Use browser's function to get the coordinates of user

	    if (navigator.geolocation){

		navigator.geolocation.getCurrentPosition(this.setCurPosition,this.getCurPositionByAPI);

		return;
		  
	    }

	    this.getCurPositionByAPI();

	},
	  
	getCurPositionByAPI(){ // Use web api to get the coordinates of user (Only when browser's function is not working)

	    axios.get("/GetLocation/").then(response => { // For CORS purpose

		this.center = { lat: response.data["lat"], lng: response.data["lon"] };

		this.MoveToPosition(this.center);

	    });
	      
	},
	  
	setCurPosition(position){ // Function to set user's location if the browser's function is available

	    this.center = { lat: position.coords.latitude, lng: position.coords.longitude };

	    this.MoveToPosition(this.center);

	},

	addLocation(){ // Search the location by current position

	    axios.get("/Gapi/place/textsearch/json",{

		params:{

		    key: this.ApiKey,

		    radius: 10,

		    location: this.center.lat + "," + this.center.lng,

		    query: this.$refs.LocationInput.value,
		      
		}

	    }).then(response => {

		if(response.data.results.length < 1){ // If result length < 1, stop the process
		    return;
		}
		  
		let result = response.data.results[0];

		if(this.locations_id.has(result["place_id"])){ // If the place has been searched, stop the process
		    return;
		}

		let pos = {lat: result["geometry"]["location"]["lat"], lng: result["geometry"]["location"]["lng"]};

		this.locations.unshift({name: result["name"], address: result["formatted_address"], position: pos, id: result["place_id"]});

		this.locations_id.add(result["place_id"]); // Add the new place id to the set

		this.setPage(); // Update the table

		this.$refs.LocationInput.value = ""; // Set the input content to be empty

		this.MoveToPosition(pos); // Move the map to the searched place

	    });

	},

	deleteLocation(){

	    let remove = this.$refs.LocationTable.getCheckboxRecords(true); // List of all checked locations

	    let i = 0; // Index to iterate all locations

	    let j = 0; // Index to iterate checked locations

	    while(i < this.locations.length){
		
		if(j >= remove.length){
		      break;
		}

		if(this.locations[i].id == remove[j].id){ // If the current location id is in the checked location id

		    this.locations.splice(i,1); // Remove current location

		    this.locations_id.delete(remove[j].id); // Delete the id from the set

		    j++;
		    
		}
		else{

		    i++;
		  
		}
	      
	    }

	    this.setPage(); // Update the table
	    
	},

	setPage(){ // Update the table

	    let total = this.locations.length; // Total number of locations

	    let totalPage = total / this.page_size + ( total % this.page_size == 0 ? 0 : 1); // Total number of pages

	    if(this.current_page > totalPage){ // If the current page is larger than the number of total pages, set it to be the last page

		this.current_page = totalPage;
	      
	    };

	    let start = (this.current_page - 1) * this.page_size; // The start index of locations should be displayed

	    let end = Math.min(total,this.current_page*this.page_size); // The last index of locations should be displayed

	    this.table_locations = this.locations.slice(start,end); // Set the list of displayed locations to be the slice of locations

	    this.$refs.LocationTable.loadData(this.table_locations); // Load the data of displayed locations

	},

	getDate(){ // Get the timezone and time of the latest searched location

	    let time = document.getElementById("LastestTime"); // Element of div that display the time

	    if(this.locations.length > 0){ // Only do when the locations is not empty

		if(this.lastest_location_id != this.locations[0]["id"]){ // If the lastest location is changed

		    this.lastest_location_id = this.locations[0]["id"];

		    let url = "/Gapi/timezone/json?key=" + this.ApiKey + "&location=" + this.locations[0]["position"]["lat"] + "%2C" + this.locations[0]["position"]["lng"] + "&timestamp=" + new Date().getTime() / 1000;

		    axios.get(url).then(response => {

			this.rawOffset = response.data.rawOffset;

			this.TimeZone = response.data.timeZoneName;
			  
		    }); // Get the timezone and offset using google map api
		      
		}

		let nowDate = new Date().getTime(); // Get current time of current location

		let date = new Date(nowDate + this.rawOffset * 1000 + new Date().getTimezoneOffset() * 60 * 1000); // Get the target time

		let year = date.getFullYear();

		let month = date.getMonth()+1;

		let days = date.getDate();

		let hour = date.getHours();

		let minute = date.getMinutes();
		  
		let second = date.getSeconds();
		  
		if(month<10){
		    month="0"+month;
		}

		if(days<10){
		    days="0"+days;
		}

		if(hour<10){
		    hour="0"+hour;
		}

		if(minute<10){
		    minute="0"+minute;
		}

		if(second<10){
		    second="0"+second;
		}

		time.innerHTML = this.locations[0]["name"] + ": " + this.TimeZone + " " + year + "-" + month + "-" +days + " " + hour + ":" + minute + ":" + second;

	    }
	    else{

		this.lastest_location_id = null;

		time.innerHTML = "";

	    }
	      
	},

    },

    beforeMount(){ // Functions to be run at start
	
	this.getCurPosition(); // Get current location

	setInterval(() => { // Get the date every 0.5 second
	    this.getDate();
	}, 1000/2);

    },

});

</script>
