import Flowchart from "../flowchart";

export default async function Roadmap({ params }: {
  params: { course: string };
}) {

  const { course } = await params; // this await is necessary

  return (<Flowchart courseCode={course} />);
}