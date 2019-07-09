var marker_tree = false;
var marker_tree_el = document.createElement('div');
marker_tree_el.className = 'marker tree';


mapboxgl.accessToken = 'pk.eyJ1IjoidGVjaG5vbG9naWVzdGlmdHVuZyIsImEiOiJjanh2azhreTEwMWc5M21sZjd4ODFvOHAwIn0.dW0XyU0DUKDva1rYWlac_Q';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    //style: 'style.json',
    center: [13.4244,52.5047],
    zoom: 10
});

map.on('load', function(e) {
    
    // Add a new source from our GeoJSON data .
    map.addSource("trees", {
        type: "geojson",
        data: "data/dummy_tree.geojson",
        
    });
    
    map.addSource("brunnen", {
        type: "geojson",
        data: "data/brunnen.geojson",
        
    });
    
    map.addSource("trinwasserbrunnen", {
        type: "geojson",
        data: "data/trinkwasserbrunnen.geojson",
        
    });
    
    map.addSource("baeume1", {
        type: "geojson",
        data: "data/anlagenbaeume.geojson",
        
    });
    
    map.addSource("baeume2", {
        type: "geojson",
        data: "data/strassenbaeume.geojson",
        
    });
    
    map.addLayer({
        id: "trees",
        type: "circle",
        source: "trees",
        "paint": {
            'circle-radius': {
                'base': 1.75,
                'stops': [[10, 3], [22, 250]]
                },
            'circle-color': {
                property: 'waterstatus',
                stops: [
                    [0.1, '#7fff7f'],
                    [1, 'rgba(230,4,51,1)']
                ]
            }
        }
        
        
    });
    
    map.addLayer({
        id: "brunnen",
        type: "circle",
        source: "brunnen",
        "paint": {
            'circle-radius': {
                'base': 1.75,
                'stops': [[10, 1], [22, 200]]
                },
            'circle-color': '#0000FF'
        }
        
    });
    
    map.addLayer({
        id: "trinwasserbrunnen",
        type: "circle",
        source: "trinwasserbrunnen",
        "paint": {
            'circle-radius': {
                'base': 1.75,
                'stops': [[10, 1], [22, 200]]
                },
            'circle-color': '#4ca6ff'
        }
        
    });
    
    map.addLayer({
        id: "baeume1",
        type: "circle",
        source: "baeume1",
        "paint": {
            'circle-radius': {
                'base': 1.75,
                'stops': [[10, 1], [22, 200]]
                },
            'circle-color': '#008000'
        }
        
    });
    
    
    map.addLayer({
        id: "baeume2",
        type: "circle",
        source: "baeume2",
        "paint": {
            'circle-radius': {
                'base': 1.75,
                'stops': [[10, 1], [22, 200]]
                },
            'circle-color': '#008000'
        }
        
    });
    
    
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    
    
    map.on('click', "trees", function (e) {
        var d = e.features[0].properties;
        setDetails(d);
    });
    
    map.on('mouseenter', "trees", function (e) {
        map.getCanvas().style.cursor = 'pointer';
        
        var coordinates = e.features[0].geometry.coordinates.slice();
        var waterstatus = e.features[0].properties.waterstatus;
        
        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        
        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates)
        .setHTML(waterstatus)
        .addTo(map);
    });
    
    map.on('mouseleave', "trees", function () {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
    initDone();
});
//})

function initDone(){
    d3.select('#loading .outer')
    .transition()
    .ease(d3.easeCubicIn)
    .duration(500)
    .style('opacity',0)
    .on('end', function(){
        (d3.select(this)).remove();
    });
    
    d3.select('#sidebar')
    .transition()
    .delay(500)
    .ease(d3.easeCubicOut)
    .duration(500)
    .style('display','block')
    .style('opacity',1);
    
    d3.selectAll('#sidemenu li').datum(function(){
        return d3.select(this).attr('data-item');
    }).on('click', function(d){
        if(d3.select(this).classed('active')&&!detailShow){
            d3.selectAll('#sidemenu li').classed('active',false);
            closeSidebar();
        }else{
            detailShow = false;
            d3.selectAll('.sidebar-content').style('visibility','visible');
            if(marker_tree){
                marker_tree.remove();
            }
            
            d3.selectAll('#sidemenu li').classed('active',false);
            d3.select(this).classed('active',true);
            
            d3.selectAll('.sidebar-content').style('display','none');
            d3.select('#'+d).style('display','block');
            openSidebar();
        }
    });
    
}
function setDetails(d){
    if(marker_tree){
        marker_tree.remove();
    }
    
    marker_tree = new mapboxgl.Marker(marker_tree_el, {
        offset: [5.5, -22.5]
    })
    .setLngLat([d.alon,d.alat])
    .addTo(map);
    
}


function openSidebar(){
    if(!d3.select('#sidebar').classed('active')){
        d3.select('#sidebar')
        .classed('active',true);
        
        if(window.innerWidth > 768){
            map.panTo(map.getCenter(), {duration:500, offset:{x:200,y:0}});
        }
    }
}

function closeSidebar(){
    if(d3.select('#sidebar').classed('active')){
        d3.select('#sidebar')
        .classed('active',false);
        
        d3.selectAll('#sidemenu li').classed('active',false);
        
        if(window.innerWidth > 768){
            map.panTo(map.getCenter(), {duration:500, offset:{x:-200,y:0}});
        }
    }
}