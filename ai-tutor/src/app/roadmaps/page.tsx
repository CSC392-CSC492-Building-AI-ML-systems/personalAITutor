"use client";
import React, { useState } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "react-flow-renderer";

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
  externalNode: "#ffebcd", // External resource node color
};

const sidebarTheme = {
  weekBox: {
    backgroundColor: colors.weekBox,
    color: colors.text,
    padding: "10px 16px",
    borderRadius: "4px",
    border: `1px solid ${colors.border}`,
    marginBottom: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "220px",
    display: "flex",
    justifyContent: "space-between",
  },
  topicBox: {
    backgroundColor: colors.boxBackground,
    color: colors.text,
    padding: "8px 12px",
    borderRadius: "4px",
    border: `1px solid ${colors.border}`,
    marginBottom: "6px",
    fontSize: "14px",
  },
};

// -------------------------------------------------------------------
// Course Data: Major Groups (Big Branches) and Their Topics
// -------------------------------------------------------------------
const courseData = [
  {
    id: "javaFund",
    title: "Java Fundamentals",
    topics: [
      { id: "java1", name: "Basic Java Syntax" },
      { id: "java2", name: "Java Primitive Types" },
      { id: "java3", name: "Java Objects" },
      { id: "java4", name: "Classes" },
      { id: "java5", name: "Inheritance" },
    ],
    // Intra-group topic connections (dashed lines can be used for emphasis later)
    connections: [
      { from: "java2", to: "java3" },
      { from: "java3", to: "java4" },
      { from: "java4", to: "java5" },
    ],
  },
  {
    id: "oop",
    title: "Object-Oriented Programming (OOP)",
    topics: [
      { id: "oop1", name: "Interfaces" },
      { id: "oop2", name: "Overriding/Shadowing" },
      { id: "oop3", name: "OOP Design Principles" },
      { id: "oop4", name: "SOLID" },
    ],
    connections: [
      { from: "oop1", to: "oop2" },
      { from: "oop2", to: "oop3" },
      { from: "oop3", to: "oop4" },
    ],
  },
  {
    id: "vcs",
    title: "Version Control",
    topics: [{ id: "git1", name: "Git" }],
    connections: [],
  },
  {
    id: "se",
    title: "Software Engineering Processes & Agile",
    topics: [
      { id: "se1", name: "Software Engineering Processes" },
      { id: "se2", name: "Waterfall" },
      { id: "se3", name: "Agile" },
      { id: "se4", name: "Scrum" },
      { id: "se5", name: "CRC" },
      { id: "se6", name: "UML Diagrams" },
    ],
    connections: [
      { from: "se1", to: "se2" },
      { from: "se1", to: "se3" },
      { from: "se3", to: "se4" },
      { from: "se1", to: "se5" },
      { from: "se1", to: "se6" },
    ],
  },
  {
    id: "dp",
    title: "Design Patterns & Process",
    topics: [
      { id: "dp1", name: "Design Patterns" },
      { id: "dp2", name: "Observer" },
      { id: "dp3", name: "Iterator" },
      { id: "dp4", name: "Strategy" },
      { id: "dp5", name: "Command" },
      { id: "dp6", name: "Accessibility" },
    ],
    connections: [
      { from: "dp1", to: "dp2" },
      { from: "dp1", to: "dp3" },
      { from: "dp1", to: "dp4" },
      { from: "dp1", to: "dp5" },
      { from: "dp5", to: "dp6" },
    ],
  },
  {
    id: "adv",
    title: "Advanced Concepts",
    topics: [
      { id: "adv1", name: "Parametric Polymorphism" },
      { id: "adv2", name: "Exceptions" },
      { id: "adv3", name: "Floating Point Numbers" },
      { id: "adv4", name: "IEEE 754 Format" },
      { id: "adv5", name: "Overflow/Underflow" },
    ],
    connections: [
      { from: "adv1", to: "adv2" },
      { from: "adv3", to: "adv4" },
      { from: "adv4", to: "adv5" },
    ],
  },
];

// Extra connections between major groups (for cross-topic links)
const extraConnections = [
  { from: "java5", to: "oop1" }, // Java Fundamentals leads into OOP
  { from: "oop4", to: "dp1" }, // SOLID leads into Design Patterns
  { from: "se3", to: "dp1" }, // Agile influences Design Patterns
];

// -------------------------------------------------------------------
// External Resources (parsed from source.csv simulation)
// -------------------------------------------------------------------
const externalResources = [
  {
    filename:
      "https://cspages.ucalgary.ca/~tam/2014/233W/notes/acrobat/intro_OO.pdf",
    subtopic: "OOP",
    resourceType: "PDF",
    processed: "Y",
  },
  {
    filename: "https://www.geeksforgeeks.org/data-types-in-java/",
    subtopic: "Java",
    resourceType: "Data Types",
    processed: "Y",
  },
  {
    filename: "https://www.geeksforgeeks.org/git-flow/",
    subtopic: "Git (version control)",
    resourceType: "Webpage",
    processed: "Y",
  },
  {
    filename:
      "https://www.geeksforgeeks.org/software-engineering-agile-software-development/",
    subtopic: "Agile Process",
    resourceType: "Webpage",
    processed: "Y",
  },
  {
    filename: "https://www.geeksforgeeks.org/what-is-a-user-story-in-agile/",
    subtopic: "User Stories",
    resourceType: "Webpage",
    processed: "Y",
  },
  {
    filename: "https://refactoring.guru/design-patterns/what-is-pattern",
    subtopic: "Design Patterns",
    resourceType: "Webpage",
    processed: "Y",
  },
  {
    filename:
      "https://www.geeksforgeeks.org/floating-point-representation-basics/",
    subtopic: "Floating Point Numbers",
    resourceType: "Webpage",
    processed: "Y",
  },
];

// Helper: map resource subtopic to target topic node ID (using first node of group)
const mapSubtopicToTargetId = (subtopic) => {
  const lower = subtopic.toLowerCase();
  if (lower.includes("oop")) return "oop1";
  if (lower.includes("java")) return "java1";
  if (lower.includes("git")) return "git1";
  if (lower.includes("agile")) return "se3";
  if (lower.includes("user story")) return "se1";
  if (lower.includes("uml")) return "se6";
  if (lower.includes("design pattern")) return "dp1";
  if (lower.includes("floating point")) return "adv3";
  return null;
};

// -------------------------------------------------------------------
// Build Flowchart Data
// -------------------------------------------------------------------
const nodeSpacingX = 300;
const groupNodeY = 20;
const topicSpacingY = 120;

// 1. Create "big branch" group nodes
const groupNodes = courseData.map((group, groupIndex) => ({
  id: group.id,
  data: { label: group.title },
  position: { x: groupIndex * nodeSpacingX, y: groupNodeY },
  style: {
    border: `2px solid ${colors.border}`,
    backgroundColor: colors.weekBox,
    padding: 12,
    borderRadius: 6,
    fontWeight: "bold",
  },
}));

// 2. Create topic nodes for each group (positioned below their group node)
const topicNodes = courseData.flatMap((group, groupIndex) =>
  group.topics.map((topic, topicIndex) => ({
    id: topic.id,
    data: { label: topic.name },
    position: {
      x: groupIndex * nodeSpacingX,
      y: 100 + topicIndex * topicSpacingY,
    },
    style: {
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.boxBackground,
      padding: 10,
      borderRadius: 4,
    },
  }))
);

// 3. Create edges from each group node to its topics (big branch edges)
const groupTopicEdges = courseData.flatMap((group) =>
  group.topics.map((topic) => ({
    id: `${group.id}-${topic.id}`,
    source: group.id,
    target: topic.id,
    animated: true,
    style: { stroke: colors.line, strokeWidth: 3 },
  }))
);

// 4. Intra-group topic-to-topic edges (from provided connections)
const intraGroupEdges = courseData.flatMap((group) =>
  group.connections.map((conn) => ({
    id: `${conn.from}-${conn.to}`,
    source: conn.from,
    target: conn.to,
    animated: true,
    style: { stroke: colors.line, strokeWidth: 2 },
  }))
);

// 5. Extra cross-group edges
const extraFlowEdges = extraConnections.map((conn) => ({
  id: `${conn.from}-${conn.to}`,
  source: conn.from,
  target: conn.to,
  animated: true,
  style: { stroke: colors.line, strokeDasharray: "5,5", strokeWidth: 2 },
}));

// 6. External resource nodes & their edges
let externalFlowNodes = [];
let externalFlowEdges = [];
externalResources.forEach((res, index) => {
  if (res.processed !== "Y") return;
  const targetId = mapSubtopicToTargetId(res.subtopic);
  if (!targetId) return;
  const extNodeId = `ext-${index}`;
  externalFlowNodes.push({
    id: extNodeId,
    data: {
      label: (
        <a
          href={res.filename}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: colors.text,
            textDecoration: "none",
            fontSize: "12px",
          }}
        >
          {res.resourceType}
        </a>
      ),
    },
    position: { x: 0, y: 0 }, // Temporary – adjusted below
    style: {
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.externalNode,
      padding: 6,
      borderRadius: 4,
      fontSize: "12px",
    },
  });
  externalFlowEdges.push({
    id: `${targetId}-${extNodeId}`,
    source: targetId,
    target: extNodeId,
    animated: true,
    style: { stroke: colors.line, strokeDasharray: "2,2", strokeWidth: 1 },
  });
});

// Position external nodes relative to their target topic nodes
const targetPositions = {};
[...topicNodes, ...groupNodes].forEach((node) => {
  targetPositions[node.id] = node.position;
});
externalFlowNodes = externalFlowNodes.map((node) => {
  const edge = externalFlowEdges.find((e) => e.target === node.id);
  if (edge && targetPositions[edge.source]) {
    const base = targetPositions[edge.source];
    return {
      ...node,
      position: { x: base.x + 150, y: base.y + 20 },
    };
  }
  return node;
});

// 7. Additional big branch edges between group nodes (sequential connection)
const groupSequentialEdges = [];
for (let i = 0; i < courseData.length - 1; i++) {
  groupSequentialEdges.push({
    id: `group-${courseData[i].id}-to-${courseData[i + 1].id}`,
    source: courseData[i].id,
    target: courseData[i + 1].id,
    animated: false,
    style: { stroke: colors.line, strokeWidth: 3 },
  });
}

// Merge all nodes and edges
const flowNodes = [...groupNodes, ...topicNodes, ...externalFlowNodes];
const flowEdges = [
  ...groupTopicEdges,
  ...intraGroupEdges,
  ...extraFlowEdges,
  ...externalFlowEdges,
  ...groupSequentialEdges,
];

// -------------------------------------------------------------------
// Main Component: Roadmaps
// -------------------------------------------------------------------
const Roadmaps = () => {
  // Sidebar state: expand/collapse each group
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    courseData.forEach((group) => {
      initial[group.id] = true;
    });
    return initial;
  });

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
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
        CSC207 Interactive Roadmap
      </h1>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Sidebar Navigation */}
        <div style={{ flex: 1 }}>
          {courseData.map((group) => (
            <div key={group.id} style={{ marginBottom: "16px" }}>
              <div
                style={sidebarTheme.weekBox}
                onClick={() => toggleGroup(group.id)}
              >
                {group.title}
                <span>{expandedGroups[group.id] ? "−" : "+"}</span>
              </div>
              {expandedGroups[group.id] && (
                <div style={{ marginLeft: "20px", marginTop: "8px" }}>
                  {group.topics.map((topic) => (
                    <div key={topic.id} style={sidebarTheme.topicBox}>
                      {topic.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Flowchart */}
        <div
          style={{
            flex: 1,
            height: "600px",
            border: `1px solid ${colors.border}`,
            borderRadius: "4px",
          }}
        >
          <ReactFlow nodes={flowNodes} edges={flowEdges} fitView>
            <MiniMap nodeColor={() => colors.boxBackground} />
            <Controls />
            <Background color={colors.line} gap={16} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default Roadmaps;
