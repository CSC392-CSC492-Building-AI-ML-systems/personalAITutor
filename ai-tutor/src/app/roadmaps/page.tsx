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

// -------------------------------------------------------------------
// Dummy Detail Data for Each Subtopic
// -------------------------------------------------------------------
const topicDetails = {
  java1:
    "Basic Java Syntax covers the essentials of writing Java programs including program structure, variables, control structures and a brief intro to object creation. It forms the foundation for all Java programming.",
  java2:
    "Java Primitive Types include data types like int, double, char, and boolean. Understanding these is crucial for managing data in your programs.",
  java3:
    "Java Objects allow you to encapsulate data and behavior. Learn how to instantiate objects and access their properties.",
  java4:
    "Classes are blueprints for objects. They encapsulate methods and fields to define behaviors and properties.",
  java5:
    "Inheritance allows one class to inherit fields and methods from another, enabling code reuse and the creation of more complex data models.",
  oop1: "Interfaces in Java define a contract that classes can implement. They are key to achieving polymorphism.",
  oop2: "Overriding and Shadowing let subclasses modify or hide the behavior of inherited methods and fields.",
  oop3: "OOP Design Principles guide the creation of maintainable and scalable object-oriented software.",
  oop4: "SOLID principles provide a set of guidelines to improve software design and maintainability.",
  oop5: "The 'super' keyword is used to access methods and constructors of a parent class.",
  oop6: "The 'final' keyword prevents modifications in classes, methods, or variables.",
  git1: "Git is a distributed version control system that helps manage source code history and collaboration among developers.",
  se1: "Software Engineering Processes provide frameworks and methodologies to manage software development projects.",
  se2: "Waterfall is a sequential development process where each phase must be completed before the next begins.",
  se3: "Agile is an iterative development methodology emphasizing customer collaboration, flexibility, and rapid delivery.",
  se4: "Scrum is an Agile framework that organizes development work into time-boxed sprints.",
  se5: "CRC (Class-Responsibility-Collaborator) cards are used for brainstorming and designing object-oriented systems.",
  se6: "UML Diagrams visually represent the architecture, design, and implementation of software systems.",
  dp1: "Design Patterns are proven solutions to common design problems. They improve code readability and maintainability.",
  dp2: "The Observer pattern enables an object to notify other objects about state changes.",
  dp3: "The Iterator pattern provides a standardized way to access elements in a collection without exposing its underlying representation.",
  dp4: "The Strategy pattern allows the algorithm used by an object to be selected at runtime.",
  dp5: "The Command pattern encapsulates a request as an object, thereby allowing for parameterization of clients with different requests.",
  dp6: "Accessibility ensures that software is usable by people with a wide range of abilities.",
  adv1: "Parametric Polymorphism in Java enables generic programming, allowing methods and classes to operate on objects of various types.",
  adv2: "Exceptions provide a mechanism to handle runtime errors gracefully.",
  adv3: "Floating Point Numbers represent real numbers in Java, though with limited precision which can lead to rounding errors.",
  adv4: "IEEE 754 is the standard that defines the representation and behavior of floating point numbers.",
  adv5: "Overflow and Underflow occur when a calculation produces a result outside the range that can be represented by the data type.",
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
      { id: "oop5", name: "super" },
      { id: "oop6", name: "final" },
    ],
    connections: [
      { from: "oop1", to: "oop2" },
      { from: "oop2", to: "oop3" },
      { from: "oop3", to: "oop4" },
      { from: "oop2", to: "oop5" },
      { from: "oop2", to: "oop6" },
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

// Extra cross-group connections
const extraConnections = [
  { from: "java5", to: "oop1" },
  { from: "oop4", to: "dp1" },
  { from: "se3", to: "dp1" },
];

// -------------------------------------------------------------------
// External Resources (CSV simulation)
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
    resourceType: "Webpage",
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

// Helper: map resource subtopic to target topic node ID (first topic in group)
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

// 1. Big branch (group) nodes
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

// 2. Topic nodes for each group
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

// 3. Edges from each group node to its topics (thick edges)
const groupTopicEdges = courseData.flatMap((group) =>
  group.topics.map((topic) => ({
    id: `${group.id}-${topic.id}`,
    source: group.id,
    target: topic.id,
    animated: true,
    style: { stroke: colors.line, strokeWidth: 3 },
  }))
);

// 4. Intra-group topic-to-topic edges
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
    position: { x: 0, y: 0 },
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

// Position external nodes relative to their target nodes
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

// 7. Additional sequential edges between group nodes
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
// Build Mapping from Topic Node to Its Parent Group
// -------------------------------------------------------------------
const topicToGroupMapping = {};
courseData.forEach((group) => {
  group.topics.forEach((topic) => {
    topicToGroupMapping[topic.id] = group.id;
  });
  topicToGroupMapping[group.id] = group.id;
});

// -------------------------------------------------------------------
// Helper Functions for Detailed Topic Info
// -------------------------------------------------------------------
const getTopicName = (topicId) => {
  for (const group of courseData) {
    for (const topic of group.topics) {
      if (topic.id === topicId) {
        return topic.name;
      }
    }
  }
  return "";
};

const getParentGroupName = (topicId) => {
  const groupId = topicToGroupMapping[topicId];
  const group = courseData.find((g) => g.id === groupId);
  return group ? group.title : "";
};

const getExternalLinksForTopic = (topicId) => {
  // Filter external resources that are mapped to this topic
  return externalResources.filter((res) => {
    const target = mapSubtopicToTargetId(res.subtopic);
    return target === topicId && res.processed === "Y";
  });
};

// -------------------------------------------------------------------
// Detailed Topic Information Component
// -------------------------------------------------------------------
const TopicDetailInfo = ({ topicId, onClose }) => {
  const topicName = getTopicName(topicId);
  const parentGroup = getParentGroupName(topicId);
  const details = topicDetails[topicId] || "No detailed information available.";
  const links = getExternalLinksForTopic(topicId);

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
      <h2 style={{ color: colors.text, marginBottom: "10px" }}>{topicName}</h2>
      <h4 style={{ color: colors.text, marginBottom: "10px" }}>
        Parent Topic: {parentGroup}
      </h4>
      <p style={{ color: colors.text, marginBottom: "10px" }}>{details}</p>
      {links.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <h4 style={{ color: colors.text }}>Related Resources:</h4>
          <ul>
            {links.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: colors.text }}
                >
                  {link.resourceType}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={onClose}
        style={{ padding: "8px 12px", cursor: "pointer" }}
      >
        Close Details
      </button>
    </div>
  );
};

// -------------------------------------------------------------------
// Main Component: Roadmaps
// -------------------------------------------------------------------
const Roadmaps = () => {
  // Left Pane: Show detailed info for selected topic (initially none)
  const [selectedTopic, setSelectedTopic] = useState(null);

  // When a node is clicked, update the selected topic (only one at a time)
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
        CSC207 Interactive Roadmap
      </h1>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Left Pane: Detailed Topic Information */}
        <div style={{ flex: 1 }}>
          {selectedTopic ? (
            <TopicDetailInfo
              topicId={selectedTopic}
              onClose={() => setSelectedTopic(null)}
            />
          ) : (
            <div
              style={{
                padding: "20px",
                border: `1px solid ${colors.border}`,
                borderRadius: "6px",
                backgroundColor: colors.boxBackground,
              }}
            >
              <p style={{ color: colors.text }}>
                Click on a node in the roadmap (right side) to view detailed
                topic information here.
              </p>
            </div>
          )}
        </div>

        {/* Right Pane: Interactive Flowchart */}
        <div
          style={{
            flex: 1,
            height: "600px",
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

export default Roadmaps;
