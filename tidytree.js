window.addEventListener("load", createtidytree);


function createtidytree() {
  const colorlist = ["#F6BD60", "#F7EDE2", "#F5CAC3", "#84A59D", "#F28482"];
  const colorset = {
    fillset: colorlist,
    strokeset: colorlist.slice(1, 6)

  };

  d3.json("tidytree.json").then(function (data) {
    /**
 * 基本配置 
 */
    const width = 900;
    const height = 925;
    const padding = 30;
    const margin = ({ top: 50, right: 10, bottom: 10, left: 40 });

    var dx = 40;
    var dy = 150;

    var diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);
    var tree = d3.tree().nodeSize([dx, dy]);

    const root = d3.hierarchy(data);

    root.x0 = dy / 2;
    root.y0 = 0;
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
        if (d.depth == 2) d.children = null;
    });

    const svg = d3.select("#treemap")
      .attr("viewBox", [-margin.left, -margin.top, width, dx])
      // .style("font", "10px sans-serif")
      .style("user-select", "none");

    const gLink = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const gNode = svg.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    function update(source) {
      const duration = d3.event && d3.event.altKey ? 2500 : 250;
      const nodes = root.descendants().reverse();
      const links = root.links();

      // Compute the new tree layout.
      tree(root);

      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const height = right.x - left.x + margin.top + margin.bottom;

      const transition = svg.transition()
        .duration(duration)
        .attr("viewBox", [-margin.left, left.x - margin.top, width, height])
        .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

      // Update the nodes…
      const node = gNode.selectAll("g")
        .data(nodes, d => d.id);

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", d => {
          d.children = d.children ? null : d._children;
          update(d);
        });

      nodeEnter.append("rect")
        .attr("fill", d => d._children ? colorset.fillset[0] : colorset.fillset[1] )
        .attr("stroke-width", 0.5)
        .attr("stroke", colorset.fillset[2])
        .attr("width", 100)
        .attr("height", 30)
        .attr("x", -50)
        .attr("y", -15);

      nodeEnter.append("text")
        .attr("font-size", 9)
        .attr("font-color", "#fff")
        .attr("text-anchor", "middle")
        .selectAll("tspan")
        .data(d => d.data.name)
        .join("tspan")
        .text(d => d);

      // Transition nodes to their new position.
      const nodeUpdate = node.merge(nodeEnter).transition(transition)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

      // Transition exiting nodes to the parent's new position.
      const nodeExit = node.exit().transition(transition).remove()
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      // Update the links…
      const link = gLink.selectAll("path")
        .data(links, d => d.target.id);

      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().append("path")
        .attr("d", d => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        });

      // Transition links to their new position.
      link.merge(linkEnter).transition(transition)
        .attr("d", diagonal);

      // Transition exiting nodes to the parent's new position.
      link.exit().transition(transition).remove()
        .attr("d", d => {
          const o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        });

      // Stash the old positions for transition.
      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    update(root);

  });





}
