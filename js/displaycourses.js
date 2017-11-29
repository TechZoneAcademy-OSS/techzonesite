
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
	node.details=course
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


function getCourseGraph(rootradius,data){
	var graph={
		links:[
			
		],
		nodes:[
			{
				"group": 1, 
				"id": "root",
				"radius":2,
				"label": "",
				"color": "#F5F5F5"
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


function removeToolTip(){
	d3.selectAll(".tooltip").style("opacity",0)
}


function displayCourses(data=null){
	var width = $("#courses").width();
	var height = Math.max(400,40000/width);
	
	var svg = d3.select("#courses").append("svg").attr("width",width).attr("height",height);
	var color = d3.scaleOrdinal(d3.schemeCategory20);
		
	var simulation = d3.forceSimulation()
	.force("link", d3.forceLink().id(function(d) { return d.id; }))
	.force("charge", d3.forceManyBody().strength(-280))
	.force("center", d3.forceCenter(width / 2, height / 2-20));

	if (data!=null){
		graph=getCourseGraph(Math.max(height,width),data)
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
			if (d.id!="root"){
				d3.select(this).attr("fill","violet")
			}	
		});
		svg.selectAll("circle").on("mouseout", function(d){
			if (d.id!="root"){
				d3.select(this).attr("fill",function(d) {return d.color;  })
				d3.select(".tooltip").transition(1000).style("opacity",0)
								
			}		
			
		});
		var tooltip=d3.select("#courses").append("div")
						.style('position', 'relative')
						.attr("class","tooltip")
						.style("opacity",0)
		
		svg.selectAll("circle").on("click", function(d){
			dY=d3.mouse(this)[1]
			dX=d3.mouse(this)[0]
			console.log(d)
			if (d.id!="root"){	
				d3.select(".tooltip")
						.html("<h1><font style='color: white'>"+d.details.coursename+"</font></h1>\
								Duration<h1><font style='color: white'>"+d.details.duration+"</font></h1>\
								Registration Fee<h1><font style='color: white'>"+d.details.registrationfee+"</font></h1>\
								Monthly Fee<h1><font style='color: white'>"+d.details.monthlyfee+"</h1>\
								Certification Fee<h1><font style='color: white'>"+d.details.certificationfee+"</font></h1>")
						.transition(200)
						.style("background",d.color)
						.style("opacity",0.9)
						.style("left", dX+ "px")	
						.style("top", -height+dY-100 +"px")
						
										
						
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


