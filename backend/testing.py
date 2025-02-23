import requests

url = "http://localhost:5000/ask"

questions = ["What is Inheritance?",
             "What is a class?",
             "What is a method?",
             "what is a design pattern?",
             "What is the purpose of the main method in a Java program?",
             "Why can floating-point numbers lead to precision issues in Java?"
             "What is the difference between a class and an object?",
             "What is the difference between a class and an interface?"]

for i in questions:
    payload = {"question": i}
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, json=payload, headers=headers)
    print(response.json())

# Results for this:
# {'answer': 'Inheritance is a fundamental concept in object-oriented programming where a new class, known as a subclass, is created based on an existing class, referred to as a superclass. The subclass inherits attributes and behaviors (methods) from the superclass, allowing for code reuse and the creation of a hierarchical class structure. This means that the subclass can use the methods and properties of the superclass, and it can also have additional methods and properties or override existing ones.'}
# {'answer': 'A class is a blueprint or prototype in programming, particularly in object-oriented programming languages like Java, from which individual objects can be created. It defines a set of common characteristics, behaviors, and properties that the objects created from it will share. A class is not a real-world entity but rather a template that does not occupy memory itself. It consists of variables of different data types and methods, and it is essential for creating programs in languages like Java. Classes can also be inherited, meaning they can pass on their attributes and methods to other classes.'}
# {'answer': 'A method is a program within a class that is coded either as a procedure or a function. It represents an operation or action that can be performed by an object, often referred to as a behavior. Methods are used to perform certain tasks and can return results to the user. They are typically associated with a specific object and are called using a dot operator followed by the method name and parentheses, which may include arguments. In the context of object-oriented programming, a method is essentially a function that is defined within a class.'}
# {'answer': 'A design pattern is a general, reusable solution to a common problem within a given context in software design. It is not a finished design that can be directly transformed into code but rather a template for how to solve a problem that can be used in many different situations. Design patterns help to speed up the development process by providing tested, proven development paradigms.'}
# {'answer': "The main method in a Java program is crucial for its execution. It serves as the entry point for the program, where the Java Virtual Machine (JVM) starts executing the code. The main method is defined with the signature `public static void main(String[] args)`, and it is responsible for initiating the program's execution flow."}
# {'answer': 'Floating-point numbers can lead to precision issues in Java due to the way they are represented in computer systems. The precision of floating-point numbers is limited by the number of significant bits they can store. For instance, a single precision floating-point number has 23 bits of resolution in its fractional part, which corresponds to about 7 decimal digits of accuracy. Double precision numbers have more bits, allowing for about 16 decimal digits of accuracy. However, not all real numbers can be exactly represented in floating-point format, leading to rounding errors and precision issues.\n\nThe difference between a class and an object in Java is fundamental to object-oriented programming. A class is a blueprint or template for creating objects. It defines the properties (fields) and behaviors (methods) that the objects created from the class will have. An object, on the other hand, is an instance of a class. It is a concrete entity that has state and behavior as defined by its class. While a class is a static definition, an object is a dynamic instance that can be manipulated during the execution of a program.'}
# {'answer': 'A class is a blueprint for creating objects and can contain both methods and attributes, including implementation details. An interface, on the other hand, is a collection of method signatures without implementations, used to define how an object interacts with the outside world. While classes can have state (instance variables) and provide default implementations for methods, interfaces are more abstract and do not contain attributes, except for public static final attributes, which are effectively constants. Classes can implement multiple interfaces, allowing for organized code and abstraction.'}
