import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface CourseDropdownProps {
  availableCourses: string[];
  sidebarCourses: string[];
  addCourse: (course: string) => void;
}

export default function CourseDropdown({ availableCourses, sidebarCourses, addCourse }: CourseDropdownProps) {
  const filteredCourses = availableCourses.filter(course => !sidebarCourses.includes(course));

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="w-full p-3 rounded-md bg-yellow-50 text-gray-600 text-2xl font-mono">
          +
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-[#FAFAEB] border rounded shadow-md p-2 w-40 text-center font-mono text-lg"
          align="center" // Centers the dropdown under the button
          sideOffset={5} // Adjusts vertical positioning
        >
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <DropdownMenu.Item
                key={course}
                className="p-2 w-full text-center font-mono text-lg hover:bg-gray-200 cursor-pointer rounded-md"
                onClick={() => addCourse(course)}
              >
                {course}
              </DropdownMenu.Item>
            ))
          ) : (
            <DropdownMenu.Item className="text-gray-500 text-sm p-2 text-center font-mono font-bold">
              No more courses available
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}