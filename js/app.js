(function() {
  'use strict';
  // document.addEventListener('DOMContentLoaded', function() {
  //   var URL = "1X1S6QeM3u3sFufBy2wbFhRjQe0m6mS9AdR36oK5Xj40"
  //   Tabletop.init( { key: URL, callback: showInfo, simpleSheet: true } )
  // })

  function showInfo(data) {
    var cols = [
          { data: "Name" },
          { data: "Latitude" },
          { data: "Longitude" },
          { data: "Number" },
          { data: "Description" }
        ]
    $('#table').DataTable( { data: data, columns: cols, paging: false, info: false} );
  }


  // // tooltip methods
  let tt = {
    init: function(element){
      d3.select(element).append('div')
          .attr('id', 'tooltip')
          .attr('class', 'hidden')
        .append('span')
          .attr('class', 'value')
    },
    follow: function(element, caption, options) {
      element.on('mousemove', null);
      element.on('mousemove', function() {
        let position = d3.mouse(document.body);
        d3.select('#tooltip')
          .style('top', ( (position[1] + 30)) + "px")
          .style('left', ( position[0]) + "px");
        d3.select('#tooltip .value')
          .html(caption);
      });
      d3.select('#tooltip').classed('hidden', false);
    },
    hide: function() {
      d3.select('#tooltip').classed('hidden', true);
    }
  }

  function zoomed() {
    let g = d3.select('#map .geoBoundaries');
    g.style("stroke-width", 1 / d3.event.scale + "px");
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  let margin = {top: 0, left: 40, bottom: 40, right: 0},
      width = parseInt(d3.select('#map').style('width'))
      // width = window.getComputedStyle(document.getElementById("map_container"), null).getPropertyValue("width"),
      // width = width - margin.left - margin.right
  let mapRatio = 1,
      height = width * mapRatio,
      scaleMultiplier = 18 // TODO: set this programmitically with bounding box from turf

  let mapsvg = d3.select('#map_container').append('svg')
      .attr('height', height)
      .attr('id','map')

  let colorMap = d3.map(),
      keymap = []

  let quantize = d3.scale.quantize()
      .range(d3.range(9).map(function(i) { return 'q' + i + '-9' }))

  let prettify = d3.format(".01f")

  // let tiler = d3.geo.tile()
  //     .size([width, height])

  let projection = d3.geo.mercator()
      .center([-122.31, 37.95])
      .scale(width*scaleMultiplier)
      .translate([width / 2, height / 2])

  var zoom = d3.behavior.zoom()
      .translate([0, 0])
      .scale(1)
      .scaleExtent([1, 5])
      .on("zoom", zoomed);

  let path = d3.geo.path()
      .projection(projection)

  let g = mapsvg.append('g')
      .attr('class', 'geoBoundaries')

  mapsvg.call(zoom)

  tt.init('body')


  queue()
    .defer(d3.json, 'data/watersheds-topo2.json')
    .await(renderFirst)

  function renderFirst(error, geo) {
    if (error) throw error;

    console.log('renderFirst')

    let defaultData = [],
        topo = topojson.feature(geo, geo.objects['watersheds.geo']).features

    g.selectAll('path')
      .data(topo)
    .enter().append('path')
      .attr('class', '.watershed')
      .attr('d', path)
      .on('click', function(d){ return dispatcher.changeGeo(d.id) })
      // .on('mouseover', function(d) {
      //   let me = d3.select(this)
      //       value = colorMap.get(d.id),
      //       thisText = d.properties.name + '<br>watershed id: ' + d.id + '<br> value: '+ prettify(value);
      //   tt.follow(me, 'test')
      // })
      // .on("mouseout", tt.hide )
      debugger;
  };

  /* page listeners */
  // d3.select('#defaultData-year-dropdown').on('change', function(){
  //   return dispatcher.changeYear();
  // })
  //
  /* dispatcher events */
  let dispatcher = d3.dispatch('changeGeo')
  dispatcher.on('changeGeo', function(geo){

  })
}());
