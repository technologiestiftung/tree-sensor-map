/*global mapboxgl,d3,console*/

detailShow = false,
geojson = {},
filterElements = {},
filterKeys = {},
postcodes = null, postcodeKeys = [],
searchterm = '',
scales = {},
timeOpen = false,
timeClose = false,
borderRadius = 2.5, width = 287,
timesOpen = [],
timesClose = [],
acceptance = {over:{key:'over',count:0,state:false}, under:{key:'under',count:0,state:false}},
overCount = 0,
underCount = 0,
filter = ['type','languages','topics','educational','parentType'], //parent;
filters = {},
home = false,
init = false;

var map = new mapboxgl.Map({
  container: 'map',
  style: 'style.json',
  center: [13.4244,52.5047],
  zoom: 10
});
// TODO: get right data
map.on('load', function(e){
  if(!init){
    init = true;
    d3.queue()
    .defer(d3.csv, "data/kitas_clean.csv")
    .defer(d3.json, "data/kitas_dict.json")
    .defer(d3.csv, "data/plz.csv")
    .await(function(error, file1, file2, file3) {
      if (error) { console.error(error); 
      } else {
        kitas = file1;
        kitas_dict = file2;
        postcodes = file3;
        postcodes.forEach(function(p){
          postcodeKeys.push(p.id);
        });
      }
      welcome();
    });
  }
});

map.fitBounds([[13.0790332437,52.3283651024],[13.7700526861,52.6876624308]],
  {
    offset: [0, 50],
    speed:999
  });  
  
  map.addSource('kitas-default', { type: 'geojson', data: geojson });
  
  map.addLayer({
    "id": "kitas-default",
    "type": "circle",
    "source": "kitas-default",
    "paint": {
      'circle-radius': {
        property: 'size',
        'base': 1.75,
        stops: [
          [{zoom: 2, value: 0}, 0],
          [{zoom: 2, value: d3.max(kitas, function(d){return d.size;})}, 3],
          [{zoom: 22, value: 0}, 0],
          [{zoom: 22, value: d3.max(kitas, function(d){return d.size;})}, 500]
        ]
      },
      'circle-color': {
        property: 'class',
        type: 'categorical',
        stops: [
          ['normal', 'rgba(230,4,51,1)'],
          ['focussed', 'transparent'],
          ['inactive', '#999999']]
        }
      }
    });
    
    (['kitas-default']).forEach(function(k){
      
      map.on('click', k, function (e) {
        var d = JSON.parse(e.features[0].properties.data);
        setDetails(d);
      });
      
      map.on('mouseenter', k, function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      
      map.on('mouseleave', k, function () {
        map.getCanvas().style.cursor = '';
      });
      
    });
    
    geojson.features = geojson.features.sort(function(a,b){
      if (a.properties.data.name < b.properties.data.name) {
        return -1;
      }
      if (a.properties.data.name > b.properties.data.name) {
        return 1;
      }
      return 0;
    });
    
    setList();  
    
    d3.select('#detail-close').on('click', function(){
      if(marker_kita){
        marker_kita.remove();
      }
      
      if(d3.selectAll('#sidemenu li.active').size()==0){
        closeSidebar();
      }else{
        d3.select('#details').style('display','none');
        d3.selectAll('.sidebar-content').style('visibility','visible');
        detailShow = false;
      }
    });
    