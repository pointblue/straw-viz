(function() {
  'use strict';
  // document.addEventListener('DOMContentLoaded', function() {
  //   var URL = "1X1S6QeM3u3sFufBy2wbFhRjQe0m6mS9AdR36oK5Xj40"
  //
  // })
  // function showInfo(data) {
  //   var cols = [
  //         { data: "Name" },
  //         { data: "Latitude" },
  //         { data: "Longitude" },
  //         { data: "Number" },
  //         { data: "Description" }
  //       ]
  //   $('#table').DataTable( { data: data, columns: cols, paging: false, info: false} );
  // }




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

  let mapsvg = d3.select('#map').append('svg')
      .attr('height', height)
      .attr('width', width)
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
      .attr('class', 'counties')
  let straw = mapsvg.append('g')
      .attr('class','strawsites')
  mapsvg.call(zoom)

  tt.init('body')


  queue()
    .defer(d3.json, 'data/california-counties-topo.json')
    // .defer(d3.csv, sitesURL)
    .await(renderFirst)

  function renderFirst(error, geo, siteData) {
    if (error) throw error;
    console.log('renderFirst')

    g.selectAll('path')
      .data(topojson.feature(geo, geo.objects.californiacounties).features)
    .enter().append('path')
      .attr('class', 'county')
      .attr('d', path)
      .on('click', function(d){ return dispatcher.changeGeo(d.id) })
      .on('mouseover', function(d) {
          let me = d3.select(this),
              thisText = d.properties.name
          tt.follow(me, thisText)
        })
      .on("mouseout", tt.hide )

      let sitesURL = '1WdsOiJOfRHeyey0nTVREaeG0Ge6WuP1B0gN87inYu8c'

      Tabletop.init( { key: sitesURL, callback: sitesInfo, simpleSheet: false } )
      function sitesInfo (data) {
        data['Report-sites'].elements.shift()
        data['Report-sites'].elements.pop()
        straw.selectAll('strawsite')
            .data(data['Report-sites'].elements)
          .enter().append('circle')
            .attr('class','strawsite')
            .attr('cy', function(d){return getXY(d.site)[1]})
            .attr('cx', function(d){return getXY(d.site)[0]})
            .attr('r',10)
            .on('mouseover', function(d) {
                let me = d3.select(this),
                    thisText = d['total students'] + ' students planted ' + d['total plants'] + ' plants at ' + d.site + ' this season'
                    // debugger;
                tt.follow(me, thisText)
              })
            .on("mouseout", tt.hide )





        function findSite (sitename) {
          return data.Sites.elements.find(function(el){
            return el.Site === sitename
          })
        }

        function lonLatToXY (obj) {
          return projection([+obj['Lon-assumed'], +obj['Lat-assumed']])
        }

        function getXY (site) {
          let siteinfo = findSite(site)
          return lonLatToXY(siteinfo)
        }
      }



  }

    // g.selectAll('circle')
    //   .data()

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
