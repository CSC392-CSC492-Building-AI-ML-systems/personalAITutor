import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface LandingDropdownProps {
  availableCourses: string[];
  currCourse: string;
  selectCourse: (course: string) => void;
}

export default function LandingDropdown({ availableCourses, currCourse, selectCourse }: LandingDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="focus:outline-0 w-full text-right text-gray-400 font-mono">
          {currCourse !== "" ? currCourse : "loading..."}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-[#FAFAEB] border rounded p-2 w-fit text-center font-mono text-md"
          align="center" // Centers the dropdown under the button
          sideOffset={0} // Adjusts vertical positioning
        >
          {availableCourses.length > 0 ? (
            availableCourses.map((course) => (
              <DropdownMenu.Item
                key={course}
                className="p-2 w-full text-center font-mono text-lg text-gray-600 hover:bg-gray-200 hover:outline-0 cursor-pointer rounded-md"
                onClick={() => selectCourse(course)}
              >
                {course}
              </DropdownMenu.Item>
            ))
          ) : (
            <DropdownMenu.Item className="focus:outline-0 text-gray-500 text-sm p-2 text-center font-mono font-bold">
              No courses available
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
