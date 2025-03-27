import Flowchart from "../flowchart";

export default async function Roadmap({ params }: {
  params: Promise<{ course: string }>; // Update the type to reflect that params is a Promise
}) {

  const { course } = await params; // this await is necessary

  return <Flowchart courseCode={course} />;
}