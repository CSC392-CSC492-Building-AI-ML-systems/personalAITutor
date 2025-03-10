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
  externalNode: "#ffebcd", // External resource node color (not used now)
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

// -------------------------------------------------------------------
// Layout constants for a star/circle layout
// -------------------------------------------------------------------
const groupNodeX = 150;
const groupSpacingY = 500; // vertical distance between parent nodes
const topicRadius = 180; // radius for subtopics around the parent

// Parent node style
const parentNodeStyle = {
  border: `2px solid ${colors.border}`,
  backgroundColor: colors.weekBox,
  padding: 20,
  borderRadius: 10,
  fontWeight: "bold",
  fontSize: "16px",
};

// Subtopic node style
const subtopicStyle = {
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.boxBackground,
  padding: 14,
  borderRadius: 6,
  fontSize: "14px",
};

// 1. Parent (group) nodes arranged vertically
const groupNodes = courseData.map((group, groupIndex) => ({
  id: group.id,
  data: { label: group.title },
  position: { x: groupNodeX, y: groupIndex * groupSpacingY + 20 },
  style: parentNodeStyle,
}));

// 2. Subtopic nodes for each group, arranged in a circle around the parent
const topicNodes = courseData.flatMap((group, groupIndex) => {
  const baseX = groupNodes[groupIndex].position.x;
  const baseY = groupNodes[groupIndex].position.y;
  const numberOfTopics = group.topics.length;

  return group.topics.map((topic, topicIndex) => {
    // Spread subtopics evenly in a circle, with first near the top
    const angle = (2 * Math.PI * topicIndex) / numberOfTopics - Math.PI / 2;
    return {
      id: topic.id,
      data: { label: topic.name },
      position: {
        x: baseX + topicRadius * Math.cos(angle),
        y: baseY + topicRadius * Math.sin(angle),
      },
      style: subtopicStyle,
    };
  });
});

// 3. Only keep edges from each parent node to its subtopics (one line per subtopic)
const groupTopicEdges = courseData.flatMap((group) =>
  group.topics.map((topic) => ({
    id: `${group.id}-${topic.id}`,
    source: group.id,
    target: topic.id,
    animated: true,
    style: { stroke: colors.line, strokeWidth: 3 },
  }))
);

// 4. Optional: Connect parent nodes in a chain for a vertical flow
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

// Merge the nodes and edges
const flowNodes = [...groupNodes, ...topicNodes];
const flowEdges = [...groupTopicEdges, ...groupSequentialEdges];

// -------------------------------------------------------------------
// Map each topic to its parent group
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

// -------------------------------------------------------------------
// Detailed Topic Information Component
// -------------------------------------------------------------------
const TopicDetailInfo = ({ topicId, onClose }) => {
  const topicName = getTopicName(topicId);
  const parentGroup = getParentGroupName(topicId);
  const details = topicDetails[topicId] || "No detailed information available.";

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
        <div style={{ flex: 0.5 }}>
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

export default Roadmaps;
