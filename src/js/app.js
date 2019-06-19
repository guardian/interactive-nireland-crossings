import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as topojson from 'topojson'
import * as d3geo from 'd3-geo'
import * as d3Tile from 'd3-tile'
import map from '../assets/ireland-roads.json'
import tracks from '../assets/tracks.json?asjd'
import styleLayers from './style-layer.js'
import * as mapboxgl from 'mapbox-gl'

let d3 = Object.assign({}, d3B, d3Select, d3geo, d3Tile);

let isMobile = window.matchMedia('(max-width: 860px)').matches;

let mapboxStyle = "mapbox://styles/guardian/cj849befy0k092qmnn3p6onkx?asdgcpiasgdciagsdpcgasp";
mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg';

//let client = new MapboxClient('pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg');


let mapBoxMap = new mapboxgl.Map({
    container: 'mapbox-container', // container id
   	style: mapboxStyle, // stylesheet location
    center: [-7.2, 54.55], // starting position [lng, lat]
    zoom: 7.2,
    preserveDrawingBuffer: true,
    interactive: false
});

let container = mapBoxMap.getCanvasContainer()



let bbox = document.getElementById('mapbox-container').getBoundingClientRect();
let center = mapBoxMap.getCenter();
let zoom = mapBoxMap.getZoom();
// 512 is hardcoded tile size, might need to be 256 or changed to suit your mapBoxMap config
let scale = (512) * 0.5 / Math.PI * Math.pow(2, zoom);

let projection = d3.geoMercator()
.center([center.lng, center.lat])
.translate([bbox.width/2, bbox.height/2])
.scale(scale);

let path = d3.geoPath()
.projection(projection)


let width = 620//isMobile ? atomEl.getBoundingClientRect().width : 300;
let height = 430;


mapBoxMap.on('load', function () {

    mapBoxMap.addLayer(styleLayers[0])

    styleLayers.forEach(function(feature){

        let layerID = feature['id'];
        if (!mapBoxMap.getLayer(layerID))
        {
            mapBoxMap.addLayer(feature)
        }
    })





    let svg = d3.select(mapBoxMap.getCanvasContainer()).append('svg')
	.attr('width', width)
	.attr('height', height)
	.attr('class', 'geo-map')

	let roads = svg.append('g')
	.attr('class', "roads")
	.selectAll('path')
	.data(topojson.feature(map, map.objects.roads).features)
	.enter()
	.append('path')
	.attr('d', path)
	.attr('class', 'road')

	let tracking = svg.append('g')
	.attr('class', 'tracks')
	.selectAll('path')
	.data(topojson.feature(tracks, tracks.objects.tracks).features)
	.enter()
	.append('path')
	.attr('d', path)
	.attr('class', (d,i) => 'track' + ' t-' + i)



	function translateAlong(path) {
	  var l = path.getTotalLength();
	  return function(d, i, a) {
	    return function(t) {
	      var p = path.getPointAtLength(t * l);
	      return "translate(" + p.x + "," + p.y + ")";
	    };
	  };
	}


	function translateAlong2(path) {
	  var l = path.getTotalLength();
	  
	  return function(d, i, a) {
	    return function(t) {
	      var p = path.getPointAtLength((1-t) * l);
	      return "translate(" + p.x + "," + p.y + ")";
	    };
	  };
	}

	let paths = tracking.nodes()


	for(let i = 0; i < paths.length; i++)
	{
		let truck = svg.append("circle").attr("r",3)

		transition(truck, paths[i])
	}


	function transition(truck, path) {
	  truck.transition()
	      .duration(1000)
	      .attrTween("transform", translateAlong(path))
	      .on('end', d => transition2(truck, path))
	}


	function transition2(truck, path) {
	  truck.transition()
	      .duration(1000)
	      .attrTween("transform", translateAlong2(path))
	      .on('end', d => transition(truck, path))
	}

})



