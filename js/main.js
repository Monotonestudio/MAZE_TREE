// Tree configuration
var branches = [];

var w = 1024;
var h = 800;

var centre = { x: (w/2.0), y: (h/2.0) }

var startAngle;
var seed;
var pointOnEdge;

var da = 0.2; // Angle delta
var dl = 0.87; // Length delta (factor)
var ar = 2.; // Randomness
var maxDepth = 5;
var branchLength = 200;

var branchWidth = "10px";

resetSeed();

function calculateAngle(x1,y1,x2,y2) { // calculate angle between two points
	var deltaX = x2 - x1;
	var deltaY = y2 - y1;
	return Math.atan2(deltaX,deltaY);
}

function resetSeed() { // reset seed
	pointOnEdge = randomPointOnEdge();
	startAngle = calculateAngle(pointOnEdge.x,pointOnEdge.y,centre.x,centre.y);
	seed = {i: 0, x: pointOnEdge.x, y: h - pointOnEdge.y, a: startAngle, l: branchLength, d:0};
}

function randomPointOnEdge() { // only generates points on the  rectangular edge of the canvas
	var p = Math.random();
	var edgeOffset = 0; // this decides how far the root is of the edge.

	var x = 0;
	var y = 0;

	if (p < 0.25) {
		x = Math.random() * (h-edgeOffset);
		y = edgeOffset;
	} else if (p < 0.5) {
		x = Math.random() * (w-edgeOffset);
		y = h;
	} else if (p < 0.75) {
		x = edgeOffset;
		y = Math.random() * (h-edgeOffset);
	} else {
		x = w-edgeOffset;
		y = Math.random() * (h-edgeOffset);
	}
	return { x: x , y: y };
}

// Tree creation functions
function branch(b) {
	var end = endPt(b), daR, newB;

	branches.push(b);

	if (b.d === maxDepth)
		return;

	// Left branch
	daR = ar * Math.random() - ar * 0.5;
	newB = {
		i: branches.length,
		x: end.x,
		y: end.y,
		a: b.a - da + daR,
		l: b.l * dl ,
		d: b.d + 1,
		parent: b.i
	};
	branch(newB);

	// Right branch
		daR = ar * Math.random() - ar * 0.5;
		newB = {
			i: branches.length,
			x: end.x, 
			y: end.y, 
			a: b.a + da + daR, 
			l: b.l * dl, 
			d: b.d + 1,
			parent: b.i
		};
		branch(newB);
}

function regenerate(initialise) {
	branches = [];
	resetSeed();
	branch(seed);
	initialise ? create() : update();
}

function endPt(b) {
	// Return endpoint of branch
	var x = b.x + b.l * Math.sin( b.a );
	var y = b.y - b.l * Math.cos( b.a );
	return {x: x, y: y};
}


// D3 functions
function x1(d) {return d.x;}
function y1(d) {return d.y;}
function x2(d) {return endPt(d).x;}
function y2(d) {return endPt(d).y;}
function highlightParents(d) {
	var colour = d3.event.type === 'mouseover' ? 'green' : "rgba(0,0,0,0.5)";
	var depth = d.d;
	for(var i = 0; i <= depth; i++) {

		d3.select('#id-'+parseInt(d.i)).style('stroke', colour);
		d = branches[d.parent];
	}
}

function create() {
	d3.select('svg')
		.selectAll('line')
		.data(branches)
		.enter()
		.append('line')
		.attr('x1', x1)
		.attr('y1', y1)
		.attr('x2', x2)
		.attr('y2', y2)
		.style('stroke-width', branchWidth)
		.style('stroke', "rgba(0,0,0,0.5)")
		.attr('id', function(d) {return 'id-'+d.i;})
		.on('mouseover', highlightParents)
		.on('mouseout', highlightParents)
		.on('click',function(d) {
			d3.select('#id-'+parseInt(d.i)).style('stroke', "pink");
			console.log("hallo hallo ! " + d.i);
		} );

	d3.select('svg')
		.selectAll('circle')
		.data(branches)
		.enter()
		.append('circle')
		.attr('cx',x1)
		.attr('cy',y1)
		.attr('r',10)
		.attr('stroke',"rgba(0,0,0,0.5")
		//.attr('id', function(d) {return 'id-'+d.i;});
}

function update() {
	d3.select('svg')
		.selectAll('line')
		.data(branches)
		.transition()
		.duration(1000)
		.attr('x1', x1)
		.attr('y1', y1)
		.attr('x2', x2)
		.attr('y2', y2);

	d3.select('svg')
		.selectAll('circle')
		.data(branches)
		.transition()
		.duration(1000)
		.attr('cx',x1)
		.attr('cy',y1)
		.attr('r',10)
		.attr('stroke',"rgba(0,0,0,0.5")

}

d3.selectAll('.regenerate')
	.on('click', regenerate);

regenerate(true);

window.onload = init;
var context;
var bufferLoader;

function init() {
  context = new webkitAudioContext();

  bufferLoader = new BufferLoader(
    context,
    [
      'BowieMono.wav',
      '3_overtones.mp3'
    ],
    finishedLoading
    );

  bufferLoader.load();
}

function finishedLoading(bufferList) {
  // Create two sources and play them both together.
  var source1 = context.createBufferSource();
  var source2 = context.createBufferSource();
  source1.buffer = bufferList[0];
  source2.buffer = bufferList[1];

  source1.connect(context.destination);
  source2.connect(context.destination);
  source1.noteOn(0);
  source2.noteOn(0);
}

function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
            }    
        );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');        
    }

    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}
