"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ReactFlow, Node, Edge, PanOnScrollMode, useReactFlow, ReactFlowProvider, ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getFlowchart } from "../utils/courseUtils";

// -------------------------------------------------------------------
// Color Scheme & Basic Theme Settings
// -------------------------------------------------------------------
const colors = {
  background: "#fdf6e3", // Light beige background
  boxBackground: "#f5e9c4", // Lighter yellow for nodes
  border: "#d3c7a0", // Darker border color
  text: "#2c3e50", // Dark text color
  line: "#999", // Default line color
  weekBox: "#E9F3DA", // Big branch (group) node color
};

// -------------------------------------------------------------------
// Extended Domain Mapping
// -------------------------------------------------------------------
const domainMapping = {
  "youtube.com": "YouTube",
  "docs.oracle.com": "Oracle Docs",
  "geeksforgeeks.org": "Geeks For Geeks",
  "javatpoint.com": "Javatpoint",
  "baeldung.com": "Baeldung",
  "beginnersbook.com": "Beginners Book",
  "cspages.ucalgary.ca": "UCalgary",
  "homepage.divms.uiowa.edu": "UIowa",
  "pages.cs.wisc.edu": "Wisc.edu",
  "teach.cs.toronto.edu": "UofT CS",
  "people.engr.tamu.edu": "TAMU",
  "brilliant.org": "Brilliant",
  "oracle.com": "Oracle",
  "coursera.org": "Coursera",
  "stackoverflow.com": "Stack Overflow",
  "programiz.com": "Programiz",
  "visual-paradigm.com": "Visual Paradigm",
  "interaction-design.org": "Interaction Design",
  "agilealliance.org": "Agile Alliance",
  "git-scm.com": "Git SCM",
  "gitscripts.com": "Git Scripts",
  "git.github.io": "GitHub",
  "computer.org": "Computer.org",
  "forbes.com": "Forbes",
  "pmi.org": "PMI",
  "learn.microsoft.com": "Microsoft Learn",
  "developer.ibm.com": "IBM Developer",
  "medium.com": "Medium",
  "java-design-patterns.com": "Java Design Patterns",
  "tpointtech.com": "TpointTech",
  "cs.cornell.edu": "Cornell CS",
  "introcs.cs.princeton.edu": "Princeton IntroCS",
  "eng.libretexts.org": "LibreTexts",
  "w3schools.com": "W3Schools",
  "developer.mozilla.org": "MDN",
  "w3.org": "W3.org",
};

// -------------------------------------------------------------------
// Helper function to extract domain from URL
// -------------------------------------------------------------------
const getDomain = (url) => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch (e) {
    console.error("unknown domain, error parsing URL", e);
  }
};

// -------------------------------------------------------------------
// Function to process flowchart data
// -------------------------------------------------------------------
type Topic = {
  topic: string;
  external: string[];
  internal: { path: string }[];
};

type FlowchartData = {
  [weekName: string]: Topic[];
};

const processFlowchartData = (flowchartData: FlowchartData) => {
  const sortedWeeksEntries = Object.entries(flowchartData).sort(
    ([weekA], [weekB]) => {
      const numA = weekA.match(/\d+/)?.[0] ? parseInt(weekA.match(/\d+/)?.[0] ?? '0') : 0;
      const numB = weekB.match(/\d+/)?.[0] ? parseInt(weekB.match(/\d+/)?.[0] ?? '0') : 0;
      return numA - numB;
    }
  );

  const weeks = sortedWeeksEntries.map(([weekName, topics]) => {
    const groupId = weekName.replace(/\s+/g, "");
    const topicsTransformed = topics.map((topicData, i) => ({
      id: `${groupId}-${i}`,
      name: topicData.topic,
      external: topicData.external,
      internal: topicData.internal,
    }));
    return {
      id: groupId,
      title: weekName,
      topics: topicsTransformed,
      connections: [],
    };
  });

  // Build mapping for topic details
  const topicLinks = {};
  weeks.forEach((week) => {
    week.topics.forEach((topic) => {
      topicLinks[topic.id] = {
        name: topic.name,
        parent: week.title,
        external: topic.external,
        internal: topic.internal,
      };
    });
  });

  // Layout constants for positioning nodes
  const groupNodeX = 150;
  const groupSpacingY = 300;
  // const topicRadius = 180;

  // Week node style
  const parentNodeStyle = {
    border: 'none',
    backgroundColor: colors.weekBox,
    padding: 20,
    borderRadius: 10,
    fontWeight: "bold",
    fontSize: "16px",
  };

  // Topic node style
  const topicNodeStyle = {
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.boxBackground,
    padding: 14,
    borderRadius: 6,
    width: 180,
    fontSize: "14px",
  };

  // 1. Week nodes arranged vertically
  const groupNodes = weeks.map((week, groupIndex) => ({
    id: week.id,
    data: { label: week.title },
    position: { x: groupNodeX, y: groupIndex * groupSpacingY + 20 },
    style: parentNodeStyle,
    sourcePosition: 'bottom',
    targetPosition: 'top'
  }));

  // 2. Topic nodes arranged in a circle around week nodes
  const topicNodes = weeks.flatMap((week, groupIndex) => {
    const baseX = groupNodes[groupIndex].position.x;
    const baseY = groupNodes[groupIndex].position.y;
    const numberOfTopics = week.topics.length;
    return week.topics.map((topic, topicIndex) => {
      return {
        id: topic.id,
        data: { label: topic.name },
        position: {
          x: baseX + topicIndex * 220 - (numberOfTopics - 1) * 100,
          y: baseY + 120
        },
        width: 200,
        style: topicNodeStyle
      };
    });
  });

  // 3. Edges from week nodes to topic nodes
  const groupTopicEdges = weeks.flatMap((week) =>
    week.topics.map((topic) => ({
      id: `${week.id}-${topic.id}`,
      source: week.id,
      target: topic.id,
      animated: false,
      style: { stroke: colors.line, strokeWidth: 3 },
    }))
  );

  // 4. Optionally connect week nodes sequentially
  type Edge = {
    id: string;
    source: string;
    target: string;
    animated: boolean;
    style: { stroke: string; strokeWidth: number };
  };

  const groupSequentialEdges: Edge[] = [];
  for (let i = 0; i < weeks.length - 1; i++) {
    groupSequentialEdges.push({
      id: `group-${weeks[i].id}-to-${weeks[i + 1].id}`,
      source: weeks[i].id,
      target: weeks[i + 1].id,
      animated: false,
      style: { stroke: colors.line, strokeWidth: 3 },
    });
  }

  // Merge all nodes and edges
  const flowNodes = [...groupNodes, ...topicNodes];
  const flowEdges = [...groupTopicEdges, ...groupSequentialEdges];

  return { flowNodes, flowEdges, topicLinks };
};

// -------------------------------------------------------------------
// Detailed Topic Information Component
// -------------------------------------------------------------------
const TopicDetailInfo = ({ topicId, onClose, topicLinks }) => {
  const topicData = topicLinks[topicId];
  if (!topicData) {
    return (
      <div style={{ padding: "20px", color: colors.text }}>
        No details available.
      </div>
    );
  }

  // Domain counters for unique numbering per domain
  const domainCounts = {};

  return (
    <div
      style={{
        border: `2px solid ${colors.border}`,
        backgroundColor: colors.boxBackground,
        padding: "20px",
        borderRadius: "6px",
        marginBottom: "20px",
      }}
    >
      <button
        onClick={onClose}
        style={{
          cursor: "pointer",
          color: "black", // "Close Details" text in black
        }}
      >
        Close
      </button>
      <h2 style={{ fontWeight: 700, color: colors.text, marginBottom: "10px" }}>
      {topicData.parent} - {topicData.name}
      </h2>
      <div style={{ marginBottom: "10px" }}>
        <h3 style={{ fontWeight: 700, color: colors.text }}>External Resources:</h3>
        <ul>
          {topicData.external.map((url) => {
            const domain = getDomain(url);
            if (!domain) {
              console.error("Domain is undefined for URL:", url);
              return null;
            }
            const title = domainMapping[domain] || domain;
            domainCounts[domain] = (domainCounts[domain] || 0) + 1;
            return (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "blue" }}
                >
                  {`${title} Link ${domainCounts[domain]}`}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <h3 style={{ fontWeight: 700, color: colors.text }}>Internal Resources:</h3>
        <ul>
          {topicData.internal.map((item, index) => (
            <li key={index} style={{ color: colors.text }}>
              <a
                href={`../${item.path}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.text }}
              >
                {item.path.split("/").pop()}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

function Flow(props) {
  // Required for getting state of react flow
  const { fitView, zoomTo } = useReactFlow();
  const size = useWindowSize();

  useEffect(() => {
    fitView();
    zoomTo(1.1, { duration: 0 });
  }, [fitView, zoomTo, size]);
 
  return <ReactFlow {...props} />;
}

// -------------------------------------------------------------------
// Main Component: Flowchart
// -------------------------------------------------------------------
const Flowchart = ({ courseCode }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  // const [flowchartData, setFlowchartData] = useState(null);
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);
  const [topicLinks, setTopicLinks] = useState({});
  const [translateExt, setTranslateExt] = useState([[-4000, 0], [4000, 0]]);
  const [isReady, setIsReady] = useState(false);

  const onInit = useCallback((reactFlowInstance: ReactFlowInstance) => {
    // Called when everything is mounted and ready
    
    reactFlowInstance.fitView();
    reactFlowInstance.zoomTo(1.1, { duration: 0 });

  }, []);
  
  useEffect(() => {
    const fetchFlowchartData = async () => {
      try {
        const data = await getFlowchart(courseCode);
        const processedData = processFlowchartData(data);
        // setFlowchartData(data);
        setFlowNodes(processedData.flowNodes as Node[]);
        setFlowEdges(processedData.flowEdges);
        setTopicLinks(processedData.topicLinks);

        let minY = Infinity, maxY = -Infinity;

        if (processedData.flowNodes.length !== 0) {
          processedData.flowNodes.forEach(node => {
            const y = node.position.y;
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          });
  
          const padding = 100; // Extra space around flowNodes
      
          setTranslateExt([
            [-4000, minY - padding],
            [4000, maxY + padding],
          ]);

          setIsReady(true);
        }
      } catch (error) {
        console.error("Failed to fetch flowchart data:", error);
      }
    };

    fetchFlowchartData();
  }, [courseCode]);


  const handleNodeClick = (event, node) => {
    setSelectedTopic((prev) => (prev === node.id ? null : node.id));
  };

  const proOptions = { hideAttribution: true };
  
  return (isReady ?
    <div className="flex flex-col h-full">
      <div className="flex-0.5 relative w-fit mx-auto mt-10 mb-10">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 -mx-4 bg-[#E9F3DA]"></div>
        <div className="relative text-5xl">{courseCode.toUpperCase()} ROADMAP</div>
      </div>
      <div className="flex-1 w-full h-auto">
        <ReactFlowProvider>
          <Flow
              nodes={flowNodes}
              edges={flowEdges}
              onNodeClick={handleNodeClick}
              proOptions={proOptions}
              translateExtent={translateExt} 
              panOnDrag={false}
              panOnScroll={true}
              panOnScrollMode={PanOnScrollMode.Vertical}
              fitView={false}
              onInit={onInit}
              zoomOnDoubleClick={false}
              zoomOnPinch={false}
            >
          </Flow>
        </ReactFlowProvider>
      </div>
      <div className="absolute top-25 right-0 w-1/4 h-full">
        {selectedTopic && topicLinks[selectedTopic] ? (
          <TopicDetailInfo
            topicId={selectedTopic}
            onClose={() => setSelectedTopic(null)}
            topicLinks={topicLinks}
          />
        ) : null}
      </div>
    </div> : null
  )};

export default Flowchart;

// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state

      setWindowSize({
        width: window.innerWidth as unknown as undefined, // workaround to make linter happy
        height: window.innerHeight as unknown as undefined // same here
      });
    }
    
    // Add event listener
    window.addEventListener("resize", handleResize);
     
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}