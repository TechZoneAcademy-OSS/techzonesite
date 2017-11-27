var  width = 900;
var height = 600;

function getCourseList(entry){
			courses=[]
			$(entry).each(function(){
				template={}
				template['courseid']=this.title.$t
				valuepairs=this.content.$t.split(",")
				$(valuepairs).each(function(){
					key=$.trim(this.split(": ")[0]);
					value=$.trim(this.split(": ")[1]);
					template[key]=value;
				});
				courses.push(template)		
			});
			return courses
		}


function getCourseNode(course){
	node={}
	node.id=course.courseid
	node.radius=10
	node.label=course.coursename
	if (course.coursetype=="Basic"){
		node.group=8
		node.radius=20
		node.color="green"
	}
	if (course.coursetype=="Intermediate"){
		node.group=4
		node.radius=20
		node.color="blue"
	}
	if (course.coursetype=="Advanced"){
		node.group=5
		node.radius=20
		node.color="orange"
	}
	if (course.coursetype=="Discretionary"){
		node.group=6
		node.radius=20
		node.color="red"
	}
	
	return node
}


function getCourseLink(course){
	link={}
	if (course.dependson=="NA"){
		link.source="root"
	}
	else{
		link.source=course.dependson
	}
	
	
	link.target=course.courseid
	link.value=1
	return link
}


function getCourseGraph(data){
	var graph={
		links:[
			
		],
		nodes:[
			{
				"group": 1, 
				"id": "root",
				"radius": width,
				"label": "",
				"color": "white"
			}, 
			
		]
	}
	for (row in data){
		course=data[row]
		node=getCourseNode(course)
		link=getCourseLink(course)
		graph.nodes.push(node)
		graph.links.push(link)
	}
	return graph
	
}



function displayCourses(data=null){
	var svg = d3.select("#courses").append("svg").attr("width",width).attr("height",height);
	var color = d3.scaleOrdinal(d3.schemeCategory20);
	var div2=d3.select("body").append("div")
					.attr("class","legend")
					.style("opacity",1)
					.style("left", "620px")
					.style("top","60px")
					.html('<svg/>')
	
	div2.select("svg")
		.append("circle")
			.attr("r",10)
			.attr("cx",10)
			.attr("cy",10)
			.attr("fill","green")
	
	div2.select("svg")
		.append("circle")
			.attr("r",10)
			.attr("cx",60)
			.attr("cy",10)
			.attr("fill","blue")
	
	div2.select("svg")
		.append("circle")
			.attr("r",10)
			.attr("cx",110)
			.attr("cy",10)
			.attr("fill","orange")
	
	div2.select("svg")
		.append("circle")
			.attr("r",10)
			.attr("cx",160)
			.attr("cy",10)
			.attr("fill","red")
	
		
	var simulation = d3.forceSimulation()
	.force("link", d3.forceLink().id(function(d) { return d.id; }))
	.force("charge", d3.forceManyBody().strength(-650))
	.force("center", d3.forceCenter(width / 2, height / 2));

	if (data!=null){
		graph=getCourseGraph(data)
		//console.log(graph)
		var node = svg.append("g")
			.attr("class", "nodes")
			.selectAll("circle")
			.data(graph.nodes)
			.enter().append("circle")
				 .attr("r", function(d) {return d.radius;  })
				 .attr("fill", function(d) {return d.color;  })
				 .call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));
				
		svg.selectAll("circle").on("mouseover", function(d){
			//console.log(d)
			//console.log(this)
			if (d.id!="root"){
				d3.select(this).attr("fill","violet")
			}	
		});
		svg.selectAll("circle").on("mouseout", function(d){
			//console.log(d)
			//console.log(this)
			if (d.id!="root"){
				d3.select(this).attr("fill",function(d) {return d.color;  })
			}		
			
		});
		svg.selectAll("circle").on("click", function(d){
			d3.selectAll(".tooltip").remove();
			dY=this.cy.animVal.valueAsString
			dX=this.cx.animVal.valueAsString
			console.log(dX)
			if (d.id!="root"){
				var tooltip=d3.select("body").append("div")
						.attr("class","tooltip")
						.style("opacity",0.95)
						.style("left",  dX+ "px")	
						.style("top", dY +"px")
						
			}
		});
		 
		var link = svg.append("g")
			.attr("class", "links")
			.selectAll("line")
			.data(graph.links)
			.enter().append("line")
				.attr("stroke-width", function(d) { return Math.sqrt(d.value); });

		

		node.append("svg:title")
			.text(function(d) {return d.label; })
			.attr("dx",12)
			.attr("dy",".35em")
		   
		var labels = svg.append("g")
			.attr("class", "label")
			.selectAll("text")
			.data(graph.nodes)
			.enter().append("text")
			  .attr("dx", function(d){return d.radius*0})
			  .attr("dy", function(d){return d.radius*0})
			  .text(function(d) { return d.label });

			   
		simulation
			  .nodes(graph.nodes)
			  .on("tick", ticked);

		simulation.force("link")
			  .links(graph.links);
	

		function ticked(d) {
			link
				.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });

			node
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });
			labels
				.attr("x", function(d) { return d.x; })
				.attr("y", function(d) { return d.y; }); 
		}
	}
	function dragstarted(d) {
		  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		  d.fx = d.x;
		  d.fy = d.y;
	}

	function dragged(d) {
		  d.fx = d3.event.x;
		  d.fy = d3.event.y;
	}

	function dragended(d) {
		  if (!d3.event.active) simulation.alphaTarget(0);
		  d.fx = null;
		  d.fy = null;
	}
}


