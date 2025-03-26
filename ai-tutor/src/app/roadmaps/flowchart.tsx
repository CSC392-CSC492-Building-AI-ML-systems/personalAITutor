"use client";
import React, { useState, useEffect } from "react";
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from "react-flow-renderer";
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
  weekBox: "#f0dc9e", // Big branch (group) node color
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
  const groupSpacingY = 500;
  const topicRadius = 180;

  // Week node style
  const parentNodeStyle = {
    border: `2px solid ${colors.border}`,
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
    fontSize: "14px",
  };

  // 1. Week nodes arranged vertically
  const groupNodes = weeks.map((week, groupIndex) => ({
    id: week.id,
    data: { label: week.title },
    position: { x: groupNodeX, y: groupIndex * groupSpacingY + 20 },
    style: parentNodeStyle,
  }));

  // 2. Topic nodes arranged in a circle around week nodes
  const topicNodes = weeks.flatMap((week, groupIndex) => {
    const baseX = groupNodes[groupIndex].position.x;
    const baseY = groupNodes[groupIndex].position.y;
    const numberOfTopics = week.topics.length;
    return week.topics.map((topic, topicIndex) => {
      const angle = (2 * Math.PI * topicIndex) / numberOfTopics - Math.PI / 2;
      return {
        id: topic.id,
        data: { label: topic.name },
        position: {
          x: baseX + topicRadius * Math.cos(angle),
          y: baseY + topicRadius * Math.sin(angle),
        },
        style: topicNodeStyle,
      };
    });
  });

  // 3. Edges from week nodes to topic nodes
  const groupTopicEdges = weeks.flatMap((week) =>
    week.topics.map((topic) => ({
      id: `${week.id}-${topic.id}`,
      source: week.id,
      target: topic.id,
      animated: true,
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
      <h2 style={{ color: colors.text, marginBottom: "10px" }}>
        {topicData.name}
      </h2>
      <h4 style={{ color: colors.text, marginBottom: "10px" }}>
        Parent Week: {topicData.parent}
      </h4>
      <div style={{ marginBottom: "10px" }}>
        <h3 style={{ color: colors.text }}>External Resources:</h3>
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
        <h3 style={{ color: colors.text }}>Internal Resources:</h3>
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
      <button
        onClick={onClose}
        style={{
          padding: "8px 12px",
          cursor: "pointer",
          color: "black", // "Close Details" text in black
        }}
      >
        Close Details
      </button>
    </div>
  );
};

// -------------------------------------------------------------------
// Main Component: Flowchart
// -------------------------------------------------------------------
const Flowchart = ({ courseCode }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [flowchartData, setFlowchartData] = useState(null);
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);
  const [flowEdges, setFlowEdges] = useState<Edge[]>([]);
  const [topicLinks, setTopicLinks] = useState({});

  useEffect(() => {
    const fetchFlowchartData = async () => {
      try {
        const data = await getFlowchart(courseCode);
        const processedData = processFlowchartData(data);
        setFlowchartData(data);
        setFlowNodes(processedData.flowNodes);
        setFlowEdges(processedData.flowEdges);
        setTopicLinks(processedData.topicLinks);
      } catch (error) {
        console.error("Failed to fetch flowchart data:", error);
      }
    };

    fetchFlowchartData();
  }, [courseCode]);

  if (!flowchartData) {
    return <div>Loading...</div>;
  }

  const handleNodeClick = (event, node) => {
    setSelectedTopic((prev) => (prev === node.id ? null : node.id));
  };

  return (
    <div
      style={{
        backgroundColor: colors.background,
        minHeight: "100vh",
        fontFamily: "sans-serif",
        padding: "20px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: colors.text,
          marginBottom: "20px",
        }}
      >
        Interactive Roadmap
      </h1>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Left Pane: Detailed Topic Information */}
        <div style={{ flex: 0.5 }}>
          {selectedTopic && topicLinks[selectedTopic] ? (
            <TopicDetailInfo
              topicId={selectedTopic}
              onClose={() => setSelectedTopic(null)}
              topicLinks={topicLinks}
            />
          ) : (
            <div
              style={{
                padding: "20px",
                border: `1px solid ${colors.border}`,
                borderRadius: "6px",
                backgroundColor: colors.boxBackground,
                color: colors.text,
              }}
            >
              <p>
                Click on a topic node in the roadmap (right side) to view its
                associated links.
              </p>
            </div>
          )}
        </div>
        {/* Right Pane: Interactive Flowchart */}
        <div
          style={{
            flex: 1.5,
            height: "700px",
            border: `1px solid ${colors.border}`,
            borderRadius: "4px",
          }}
        >
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodeClick={handleNodeClick}
            fitView
          >
            <MiniMap nodeColor={() => colors.boxBackground} />
            <Controls />
            <Background color={colors.line} gap={16} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default Flowchart;