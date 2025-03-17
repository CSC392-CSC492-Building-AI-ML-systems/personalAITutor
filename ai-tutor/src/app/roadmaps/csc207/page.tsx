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
    return "unknown";
  }
};

// -------------------------------------------------------------------
// Flowchart Data (from flowchart.json)
// -------------------------------------------------------------------
const flowchartData = {
  "Week 1": [
    {
      topic: "Basic Java Syntax",
      external: [
        "https://www.youtube.com/watch?v=eIrMbAQSU34&t=106s&ab_channel=ProgrammingwithMosh",
        "https://www.youtube.com/watch?v=xk4_1vDrzzo",
      ],
      internal: [
        {
          path: "resources/video_slides/week1-video-slides.pdf",
          page: "2-27, 31-36",
        },
      ],
    },
    {
      topic: "Java Primitive Types",
      external: [
        "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/datatypes.html",
        "https://www.geeksforgeeks.org/data-types-in-java/",
        "https://www.javatpoint.com/type-casting-in-java",
      ],
      internal: [
        {
          path: "resources/video_slides/week1-video-slides.pdf",
          page: "14-18",
        },
      ],
    },
    {
      topic: "Java Objects",
      external: [
        "https://www.baeldung.com/java-generics",
        "https://www.geeksforgeeks.org/classes-objects-java/?ref=ml_lbp#:~:text=GeeksForGeeks-,Java%20Objects,-An%20object%20in",
      ],
      internal: [
        {
          path: "resources/video_slides/week1-video-slides.pdf",
          page: "19-24",
        },
      ],
    },
    {
      topic: "Classes",
      external: [
        "https://www.geeksforgeeks.org/types-of-classes-in-java/",
        "https://www.geeksforgeeks.org/classes-objects-java/?ref=ml_lbp#:~:text=Mercedes%2C%20Ferrari%2C%20etc.-,Java%20Classes,-A%20class%20in",
      ],
      internal: [
        {
          path: "resources/video_slides/week1-video-slides.pdf",
          page: "25-27",
        },
      ],
    },
    {
      topic: "Inheritance",
      external: [
        "https://www.w3schools.com/java/java_inheritance.asp",
        "https://www.geeksforgeeks.org/inheritance-in-java/",
        "https://docs.oracle.com/javase/tutorial/java/IandI/subclasses.html#:~:text=all%20JDK%20releases.-,Inheritance,-In%20the%20preceding",
      ],
      internal: [
        {
          path: "resources/video_slides/week1-video-slides.pdf",
          page: "28-30",
        },
        { path: "resources/video_slides/week2-video-slides.pdf", page: "2" },
      ],
    },
  ],
  "Week 2": [
    {
      topic: "Interfaces",
      external: [
        "https://www.geeksforgeeks.org/videos/comparable-interface-in-java-with-examples/",
        "https://docs.oracle.com/javase/8/docs/api/java/lang/Comparable.html",
        "https://www.geeksforgeeks.org/difference-between-abstract-class-and-interface-in-java/#:~:text=Avinash%0A21%0A222.2-,Interface%20in%20Java,-1.%20Definition%3A",
        "https://www.baeldung.com/java-interface-vs-abstract-class#:~:text=4.-,When%20to%20Use%20an%20Interface,-Let%E2%80%99s%20look%20at",
        "https://stackoverflow.com/questions/10040069/abstract-class-vs-interface-in-java#:~:text=blog%20post%3A-,Interface%3A,-A%20class%20can",
        "https://stackoverflow.com/questions/10040069/abstract-class-vs-interface-in-java#:~:text=95-,When%20To%20Use%20Interfaces,-An%20interface%20allows",
      ],
      internal: [
        { path: "resources/video_slides/week2-video-slides.pdf", page: "3-13" },
      ],
    },
    {
      topic: "File I/O",
      external: [
        "https://www.geeksforgeeks.org/java-io-tutorial/",
        "https://www.geeksforgeeks.org/file-handling-in-java/",
        "https://docs.oracle.com/javase/tutorial/essential/io/#:~:text=O%20of%20objects.-,File%20I/O%20(Featuring%20NIO.2),-What%20is%20a",
      ],
      internal: [
        {
          path: "resources/video_slides/week2-video-slides.pdf",
          page: "15-19",
        },
      ],
    },
    {
      topic: "Overriding/Shadowing",
      external: [
        "https://www.geeksforgeeks.org/method-overloading-in-java/",
        "https://beginnersbook.com/2014/01/method-overriding-in-java-with-example/",
        "https://www.geeksforgeeks.org/shadowing-in-java/",
      ],
      internal: [
        {
          path: "resources/video_slides/week2-video-slides.pdf",
          page: "22-40",
        },
      ],
    },
    {
      topic: "Object Oriented Design Principles",
      external: [
        "https://cspages.ucalgary.ca/~tam/2014/233W/notes/acrobat/intro_OO.pdf",
        "https://homepage.divms.uiowa.edu/~slonnegr/oosd/22OOP.pdf",
        "https://pages.cs.wisc.edu/~cs302-5/resources/18_CS302_IntroOOP.pdf",
        "https://www.teach.cs.toronto.edu/~csc207h/summer/lectures/week11/design_principles.pdf",
        "https://homepage.divms.uiowa.edu/~sgoddard/Courses/CS2820/Lectures/14-OOD-Principles.pdf",
        "https://people.engr.tamu.edu/choe/choe/courses/20fall/315/lectures/slide23-solid.pdf",
        "https://www.geeksforgeeks.org/introduction-of-object-oriented-programming/",
        "https://brilliant.org/wiki/object-oriented-programming/",
        "https://www.geeksforgeeks.org/python-oops-concepts/",
        "https://www.oracle.com/java/technologies/oop.html",
        "https://www.coursera.org/learn/concepts-of-object-oriented-programming",
        "https://www.geeksforgeeks.org/oops-object-oriented-design/",
        "https://www.geeksforgeeks.org/solid-principle-in-programming-understand-with-real-life-examples/",
        "https://www.baeldung.com/solid-principles",
        "https://www.youtube.com/watch?v=SiBw7os-_zI",
        "https://www.youtube.com/watch?v=JeznW_7DlB0",
        "https://www.youtube.com/watch?v=m_MQYyJpIjg",
      ],
      internal: [
        {
          path: "/resources/lecture_slides/week2-lecture-slides.pdf",
          page: "8-23",
        },
      ],
    },
    {
      topic: "SOLID",
      external: [
        "https://www.baeldung.com/solid-principles#why:~:text=The%20Reason%20for%20SOLID%20Principles",
        "https://www.geeksforgeeks.org/solid-principle-in-programming-understand-with-real-life-examples/",
      ],
      internal: [
        {
          path: "/resources/lecture_slides/week2-lecture-slides.pdf",
          page: "8-23",
        },
      ],
    },
    {
      topic: "super",
      external: [
        "https://www.geeksforgeeks.org/super-keyword/",
        "https://docs.oracle.com/javase/tutorial/java/IandI/super.html#:~:text=all%20JDK%20releases.-,Using%20the%20Keyword%20super,-Accessing%20Superclass%20Members",
        "https://www.programiz.com/java-programming/super-keyword",
      ],
      internal: [
        {
          path: "resources/video_slides/week2-video-slides.pdf",
          page: "22-23",
        },
      ],
    },
    {
      topic: "final",
      external: [
        "https://www.w3schools.com/java/java_inheritance.asp#:~:text=perform%20different%20tasks.-,The%20final%20Keyword,-If%20you%20don%27t",
      ],
      internal: [
        { path: "resources/video_slides/week2-video-slides.pdf", page: "26" },
      ],
    },
  ],
  "Week 3": [
    {
      topic: "Parametric Polymorphism",
      external: ["https://www.w3schools.com/java/java_polymorphism.asp"],
      internal: [
        { path: "resources/video_slides/week3-video-slides.pdf", page: "2-8" },
      ],
    },
    {
      topic: "Exceptions",
      external: [
        "https://www.geeksforgeeks.org/exceptions-in-java/",
        "https://www.programiz.com/java-programming/exception-handling",
      ],
      internal: [
        { path: "resources/video_slides/week3-video-slides.pdf", page: "9-24" },
      ],
    },
    {
      topic: "User Stories",
      external: [
        "https://www.geeksforgeeks.org/user-stories-in-agile-software-development/",
        "https://www.visual-paradigm.com/guide/agile-software-development/what-is-user-story/",
        "https://www.interaction-design.org/literature/topics/user-stories",
        "https://www.agilealliance.org/glossary/user-stories/",
        "https://www.geeksforgeeks.org/what-is-a-user-story-in-agile/",
      ],
      internal: [
        {
          path: "resources/video_slides/week3-video-slides.pdf",
          page: "30-31",
        },
        { path: "resources/video_slides/week4-video-slides.pdf", page: "7-10" },
      ],
    },
    {
      topic: "Git",
      external: [
        "https://www.geeksforgeeks.org/basics-of-git/",
        "https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control#",
        "https://git-scm.com/book/en/v2/Getting-Started-Installing-Git",
        "https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup",
        "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging",
        "https://www.geeksforgeeks.org/branching-strategies-in-git/",
        "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell",
        "https://git-scm.com/docs/git-branch",
        "https://gitscripts.com/git-branching-strategy-for-multiple-environments",
        "https://git.github.io/git-reference/branching/",
        "https://www.geeksforgeeks.org/git-flow/",
        "https://www.youtube.com/watch?v=e9lnsKot_SQ",
        "https://www.youtube.com/watch?v=Sqsz1-o7nXk",
        "https://www.youtube.com/watch?v=USjZcfj8yxE",
      ],
      internal: [
        { path: "/resources/lecture_slides/git.pdf", page: "3-5" },
        {
          path: "/resources/lecture_slides/week3-lecture-slides.pdf",
          page: "17-30",
        },
      ],
    },
  ],
  "Week 4": [
    {
      topic: "Software Engineering Processes",
      external: [
        "https://www.geeksforgeeks.org/software-processes-in-software-engineering/#:~:text=to%20Software%20Processes-,What%20are%20Software%20Processes%3F,-Software%20processes%20in",
        "https://www.computer.org/resources/software-engineering-process#:~:text=DOWNLOAD%20SWEBOK-,Software%20Engineering%20Process%20Fundamentals,-What%20is%20the",
      ],
      internal: [],
    },
    {
      topic: "Waterfall",
      external: [
        "https://www.forbes.com/advisor/business/what-is-waterfall-methodology/",
        "https://www.geeksforgeeks.org/waterfall-model/",
      ],
      internal: [],
    },
    {
      topic: "Agile",
      external: [
        "https://www.geeksforgeeks.org/software-engineering-agile-software-development/",
        "https://www.geeksforgeeks.org/what-is-agile-methodology/",
        "https://www.geeksforgeeks.org/agile-software-process-and-its-principles/",
        "https://www.pmi.org/disciplined-agile/agile/theagilemanifesto",
        "https://learn.microsoft.com/en-us/devops/plan/what-is-agile",
        "https://www.coursera.org/articles/what-is-agile-a-beginners-guide",
        "https://developer.ibm.com/articles/5-steps-of-test-driven-development/",
        "https://www.geeksforgeeks.org/difference-between-agile-and-sdlc/?ref=lbp#:~:text=milestones%20and%20processes.-,What%20is%20Agile%3F,-Agile%20is%20a",
      ],
      internal: [
        { path: "resources/video_slides/week4-video-slides.pdf", page: "4-6" },
      ],
    },
    {
      topic: "Scrum",
      external: [
        "https://www.geeksforgeeks.org/scrum-software-development/",
        "https://www.geeksforgeeks.org/software-engineering-agile-software-development/#:~:text=Agile%20Software%20Development-,Scrum,-%3A%20Scrum%20is",
      ],
      internal: [],
    },
    {
      topic: "CRC",
      external: [
        "https://www.geeksforgeeks.org/class-responsibility-collaboration-card/",
        "https://en.wikipedia.org/wiki/Class-responsibility-collaboration_card",
        "https://agilemodeling.com/artifacts/crcmodel.htm",
      ],
      internal: [
        { path: "resources/video_slides/week4-video-slides.pdf", page: "2-3" },
      ],
    },
    {
      topic: "UML Diagrams",
      external: [
        "https://www.lucidchart.com/pages/landing/uml-diagram-software",
        "https://www.geeksforgeeks.org/unified-modeling-language-uml-introduction/",
        "https://www.youtube.com/watch?v=WnMQ8HlmeXc",
        "https://www.youtube.com/watch?v=6XrL5jXmTwM",
        "https://www.youtube.com/watch?v=pCK6prSq8aw",
        "https://www.youtube.com/watch?v=4emxjxonNRI",
      ],
      internal: [
        { path: "resources/video_slides/week5-video-slides.pdf", page: "5-10" },
      ],
    },
  ],
  "Week 5/6/7": [
    {
      topic: "Design Patterns",
      external: [
        "https://refactoring.guru/design-patterns/what-is-pattern",
        "https://refactoring.guru/design-patterns/classification",
        "https://refactoring.guru/design-patterns/catalog",
        "https://refactoring.guru/design-patterns/factory-method",
        "https://refactoring.guru/design-patterns/abstract-factory",
        "https://refactoring.guru/design-patterns/builder",
        "https://refactoring.guru/design-patterns/prototype",
        "https://refactoring.guru/design-patterns/singleton",
        "https://refactoring.guru/design-patterns/adapter",
        "https://refactoring.guru/design-patterns/bridge",
        "https://refactoring.guru/design-patterns/composite",
        "https://refactoring.guru/design-patterns/decorator",
        "https://refactoring.guru/design-patterns/facade",
        "https://refactoring.guru/design-patterns/flyweight",
        "https://refactoring.guru/design-patterns/proxy",
        "https://refactoring.guru/design-patterns/chain-of-responsibility",
        "https://refactoring.guru/design-patterns/command",
        "https://refactoring.guru/design-patterns/iterator",
        "https://refactoring.guru/design-patterns/mediator",
        "https://refactoring.guru/design-patterns/memento",
        "https://refactoring.guru/design-patterns/observer",
        "https://refactoring.guru/design-patterns/state",
        "https://refactoring.guru/design-patterns/strategy",
        "https://refactoring.guru/design-patterns/template-method",
        "https://refactoring.guru/design-patterns/visitor",
        "https://www.geeksforgeeks.org/mvc-design-pattern/",
        "https://www.geeksforgeeks.org/mvc-architecture-system-design/",
        "https://www.geeksforgeeks.org/mvc-framework-introduction/",
        "https://www.youtube.com/watch?v=tv-_1er1mWI",
        "https://www.youtube.com/watch?v=tAuRQs_d9F8",
        "https://www.youtube.com/watch?v=DUg2SWWK18I",
        "https://java-design-patterns.com/patterns/producer-consumer/",
        "https://www.baeldung.com/java-producer-consumer-problem",
        "https://medium.com/@nirajranasinghe/design-patterns-for-concurrent-programming-producer-consumer-pattern-39193cac195a",
      ],
      internal: [
        { path: "resources/video_slides/week7-video-slides.pdf", page: "1-47" },
        {
          path: "resources/video_slides/week9-video-slides.pdf",
          page: "22-24",
        },
        { path: "resources/video_slides/week8-video-slides.pdf", page: "1-15" },
        { path: "resources/video_slides/week5-video-slides.pdf", page: "1-34" },
      ],
    },
    {
      topic: "Observer",
      external: [
        "https://refactoring.guru/design-patterns/chain-of-responsibility#:~:text=Observer%20lets%20receivers%20dynamically%20subscribe%20to%20and%20unsubscribe%20from%20receiving%20requests.",
        "https://refactoring.guru/design-patterns/command#:~:text=Chain%20of%20Responsibility,from%20receiving%20requests.",
        "https://refactoring.guru/design-patterns/mediator#:~:text=The%20difference%20between,set%20of%20observers.",
        "https://refactoring.guru/design-patterns/observer",
        "https://youtu.be/tv-_1er1mWI?t=467",
        "https://youtu.be/tAuRQs_d9F8?t=218",
        "https://java-design-patterns.com/patterns/producer-consumer/#:~:text=Observer%3A%20While%20both%20deal%20with%20notifying%20or%20handling%20events%2C%20the%20Observer%20pattern%20is%20more%20about%20event%20subscription%20and%20notification%2C%20whereas%20Producer%2DConsumer%20focuses%20on%20decoupled%20data%20production%20and%20consumption.",
      ],
      internal: [
        {
          path: "/resources/lecture_slides/week6-lecture-slides.pdf",
          page: "5-6",
        },
        {
          path: "resources/video_slides/week8-video-slides.pdf",
          page: "2-3,11-15",
        },
        {
          path: "resources/video_slides/week5-video-slides.pdf",
          page: "11-16",
        },
      ],
    },
    {
      topic: "Iterator",
      external: [
        "https://refactoring.guru/design-patterns/factory-method#:~:text=You%20can%20use%20Factory%20Method%20along%20with%20Iterator%20to%20let%20collection%20subclasses%20return%20different%20types%20of%20iterators%20that%20are%20compatible%20with%20the%20collections.",
        "https://refactoring.guru/design-patterns/composite#:~:text=You%20can%20use%20Iterators%20to%20traverse%20Composite%20trees.",
        "https://refactoring.guru/design-patterns/iterator",
        "https://refactoring.guru/design-patterns/memento#:~:text=You%20can%20use%20Memento%20along%20with%20Iterator%20to%20capture%20the%20current%20iteration%20state%20and%20roll%20it%20back%20if%20necessary.",
        "https://refactoring.guru/design-patterns/visitor#:~:text=You%20can%20use%20Visitor%20along%20with%20Iterator%20to%20traverse%20a%20complex%20data%20structure%20and%20execute%20some%20operation%20over%20its%20elements%2C%20even%20if%20they%20all%20have%20different%20classes.",
        "https://youtu.be/tv-_1er1mWI?t=405",
        "https://youtu.be/tAuRQs_d9F8?t=312",
      ],
      internal: [
        { path: "resources/video_slides/week7-video-slides.pdf", page: "2" },
        { path: "resources/video_slides/week5-video-slides.pdf", page: "9-10" },
      ],
    },
    {
      topic: "Strategy",
      external: [
        "https://refactoring.guru/design-patterns/bridge#:~:text=Bridge%2C%20State,the%20pattern%20solves.",
        "https://refactoring.guru/design-patterns/decorator#:~:text=Decorator%20lets%20you%20change%20the%20skin%20of%20an%20object%2C%20while%20Strategy%20lets%20you%20change%20the%20guts.",
        "https://refactoring.guru/design-patterns/command#:~:text=Command%20and%20Strategy,single%20context%20class.",
        "https://refactoring.guru/design-patterns/state#:~:text=Bridge%2C%20State,context%20at%20will.",
        "https://refactoring.guru/design-patterns/strategy",
        "https://refactoring.guru/design-patterns/template-method#:~:text=Template%20Method%20is%20based,switch%20behaviors%20at%20runtime.",
        "https://youtu.be/tAuRQs_d9F8?t=388",
      ],
      internal: [
        { path: "resources/video_slides/week8-video-slides.pdf", page: "15" },
        {
          path: "resources/video_slides/week5-video-slides.pdf",
          page: "18-26",
        },
      ],
    },
    {
      topic: "Command",
      external: [
        "https://refactoring.guru/design-patterns/prototype#:~:text=Prototype%20can%20help%20when%20you%20need%20to%20save%20copies%20of%20Commands%20into%20history.",
        "https://refactoring.guru/design-patterns/chain-of-responsibility#:~:text=Handlers%20in%20Chain%20of%20Responsibility%20can%20be%20implemented%20as%20Commands.%20In%20this%20case%2C%20you%20can%20execute%20a%20lot%20of%20different%20operations%20over%20the%20same%20context%20object%2C%20represented%20by%20a%20request.",
        "https://refactoring.guru/design-patterns/command",
        "https://refactoring.guru/design-patterns/mediator#:~:text=Chain%20of%20Responsibility,from%20receiving%20requests.",
        "https://refactoring.guru/design-patterns/memento#:~:text=You%20can%20use%20Command%20and%20Memento%20together%20when%20implementing%20%E2%80%9Cundo%E2%80%9D.%20In%20this%20case%2C%20commands%20are%20responsible%20for%20performing%20various%20operations%20over%20a%20target%20object%2C%20while%20mementos%20save%20the%20state%20of%20that%20object%20just%20before%20a%20command%20gets%20executed.",
        "https://refactoring.guru/design-patterns/observer#:~:text=Chain%20of%20Responsibility,from%20receiving%20requests.",
        "https://refactoring.guru/design-patterns/strategy#:~:text=Command%20and%20Strategy,single%20context%20class.",
        "https://refactoring.guru/design-patterns/visitor#:~:text=You%20can%20treat%20Visitor%20as%20a%20powerful%20version%20of%20the%20Command%20pattern.%20Its%20objects%20can%20execute%20operations%20over%20various%20objects%20of%20different%20classes.",
      ],
      internal: [
        {
          path: "resources/video_slides/week5-video-slides.pdf",
          page: "27-34",
        },
      ],
    },
    {
      topic: "Accessibility",
      external: [
        "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG",
        "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable",
        "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Operable",
        "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Understandable",
        "https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Robust",
        "https://www.w3.org/WAI/standards-guidelines/wcag/",
        "https://www.w3.org/WAI/WCAG22/Understanding/intro#understanding-the-four-principles-of-accessibility",
      ],
      internal: [
        {
          path: "/resources/lecture_slides/week6-lecture-slides.pdf",
          page: "7-15",
        },
        { path: "resources/video_slides/accessibility.pdf", page: "3-34" },
      ],
    },
  ],
  "Week 11": [
    {
      topic: "Floating Point Numbers",
      external: [
        "https://www.geeksforgeeks.org/floating-point-representation-basics/#:~:text=What%20is%20Floating%20Point%20Representation%3F",
        "https://www.geeksforgeeks.org/ieee-standard-754-floating-point-numbers/",
        "https://www.cs.cornell.edu/~tomf/notes/cps104/floating.html",
        "https://introcs.cs.princeton.edu/java/91float/",
        "https://eng.libretexts.org/Bookshelves/Computer_Science/Programming_and_Computation_Fundamentals/High_Performance_Computing_(Severance)/02%3A_Modern_Computer_Architectures/2.02%3A_Floating-Point_Numbers#:~:text=of%20calculation.3-,Mantissa/Exponent,-The%20floating%2Dpoint",
        "https://www.youtube.com/watch?v=8afbTaA-gOQ",
        "https://www.geeksforgeeks.org/data-types-in-java/#:~:text=6.%20float%20Data,errors%20in%20java.",
        "https://www.tpointtech.com/type-casting-in-java#:~:text=From%20byte%20to,also%20be%20used.",
      ],
      internal: [
        {
          path: "resources/video_slides/week11-video-slides.pdf",
          page: "1-52",
        },
      ],
    },
    {
      topic: "IEEE 754 Format",
      external: [
        "https://www.geeksforgeeks.org/floating-point-representation-basics/",
        "https://www.geeksforgeeks.org/ieee-standard-754-floating-point-numbers/",
        "https://www.cs.cornell.edu/~tomf/notes/cps104/floating.html",
        "https://introcs.cs.princeton.edu/java/91float/#:~:text=IEEE%20754%20binary%20floating%20point%20representation.",
        "https://eng.libretexts.org/Bookshelves/Computer_Science/Programming_and_Computation_Fundamentals/High_Performance_Computing_(Severance)/02%3A_Modern_Computer_Architectures/2.02%3A_Floating-Point_Numbers#:~:text=the%20same%20order.-,IEEE%20Storage%20Format,-The%20two%20most",
        "https://www.youtube.com/watch?v=8afbTaA-gOQ",
        "https://www.geeksforgeeks.org/data-types-in-java/#:~:text=6.%20float%20Data,errors%20in%20java.",
      ],
      internal: [
        {
          path: "resources/video_slides/week11-video-slides.pdf",
          page: "19-52",
        },
      ],
    },
    {
      topic: "Overflow/Underflow",
      external: [
        "https://www.geeksforgeeks.org/floating-point-representation-basics/#:~:text=Overflow%20and%20Underflow",
        "https://www.geeksforgeeks.org/ieee-standard-754-floating-point-numbers/#:~:text=There%20are%20five,approximated%20by%20zero.",
        "https://introcs.cs.princeton.edu/java/91float/#:~:text=to%206%20digits.-,Roundoff%20error.,-Programming%20with%20floating",
        "https://eng.libretexts.org/Bookshelves/Computer_Science/Programming_and_Computation_Fundamentals/High_Performance_Computing_(Severance)/02%3A_Modern_Computer_Architectures/2.02%3A_Floating-Point_Numbers#:~:text=Exceptions%20and%20Traps",
        "https://www.geeksforgeeks.org/data-types-in-java/#:~:text=It%20is%20recommended%20to%20go%20through%20rounding%20off%20errors%20in%20java.",
        "https://www.tpointtech.com/type-casting-in-java#:~:text=int%20type%3A%20166-,Potential%20Data%20Loss,-One%20of%20the",
      ],
      internal: [
        {
          path: "resources/video_slides/week11-video-slides.pdf",
          page: "34-35",
        },
      ],
    },
  ],
  "Week 9": [
    {
      topic: "Threading",
      external: [
        "https://youtu.be/xk4_1vDrzzo?t=40116",
        "https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.State.html",
        "https://www.geeksforgeeks.org/synchronization-in-java/#:~:text=Without%20Synchronization%2C%20data%20inconsistency%20or%20corruption%20can%20occur%20when%20multiple%20threads%20try%20to%20access%20and%20modify%20shared%20variables%20simultaneously.",
        "https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html",
        "https://www.geeksforgeeks.org/java-threads/",
        "https://www.baeldung.com/java-producer-consumer-problem#:~:text=Java%20Example%20Using%20Threads",
        "https://medium.com/@nirajranasinghe/design-patterns-for-concurrent-programming-producer-consumer-pattern-39193cac195a",
      ],
      internal: [
        { path: "resources/video_slides/week9-video-slides.pdf", page: "9-21" },
      ],
    },
    {
      topic: "Synchronization",
      external: [
        "https://www.geeksforgeeks.org/synchronization-in-java/",
        "https://www.baeldung.com/java-producer-consumer-problem#:~:text=In%20Java%2C%20the%20synchronized%20block%20uses%20an%20object%20to%20achieve%20thread%20synchronization.%20Each%20object%20has%20an%20intrinsic%20lock.%20Only%20the%20thread%20that%20acquires%20the%20lock%20first%20is%20allowed%20to%20execute%20the%20synchronized%20block.",
      ],
      internal: [
        {
          path: "resources/video_slides/week9-video-slides.pdf",
          page: "14-21",
        },
      ],
    },
    {
      topic: "Concurrency Pattern: Producer/Consumer Pattern",
      external: [
        "https://java-design-patterns.com/patterns/producer-consumer/#:~:text=Observer%3A%20While%20both%20deal%20with%20notifying%20or%20handling%20events%2C%20the%20Observer%20pattern%20is%20more%20about%20event%20subscription%20and%20notification%2C%20whereas%20Producer%2DConsumer%20focuses%20on%20decoupled%20data%20production%20and%20consumption.",
        "https://www.baeldung.com/java-producer-consumer-problem",
        "https://medium.com/@nirajranasinghe/design-patterns-for-concurrent-programming-producer-consumer-pattern-39193cac195a",
      ],
      internal: [
        {
          path: "resources/video_slides/week9-video-slides.pdf",
          page: "22-24",
        },
        { path: "resources/video_slides/week5-video-slides.pdf", page: "8" },
      ],
    },
  ],
  "Week 8": [
    {
      topic: "Model-View-Controller Design",
      external: [
        "https://www.geeksforgeeks.org/mvc-design-pattern/",
        "https://www.geeksforgeeks.org/mvc-architecture-system-design/",
        "https://www.geeksforgeeks.org/mvc-framework-introduction/",
        "https://www.youtube.com/watch?v=DUg2SWWK18I",
      ],
      internal: [
        { path: "resources/video_slides/week8-video-slides.pdf", page: "4-15" },
        {
          path: "resources/video_slides/week5-video-slides.pdf",
          page: "18,29-30",
        },
      ],
    },
  ],
};

// -------------------------------------------------------------------
// Sort weeks by numeric value (extracting the first number)
// -------------------------------------------------------------------
const sortedWeeksEntries = Object.entries(flowchartData).sort(
  ([weekA], [weekB]) => {
    const numA = parseInt(weekA.match(/\d+/)[0]);
    const numB = parseInt(weekB.match(/\d+/)[0]);
    return numA - numB;
  }
);

// Transform sorted weeks into our weeks structure
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

// -------------------------------------------------------------------
// Layout constants for positioning nodes
// -------------------------------------------------------------------
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
const groupSequentialEdges = [];
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

// -------------------------------------------------------------------
// Detailed Topic Information Component
// -------------------------------------------------------------------
const TopicDetailInfo = ({ topicId, onClose }) => {
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
// Main Component: Roadmaps
// -------------------------------------------------------------------
const Roadmaps = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);

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

export default Roadmaps;
