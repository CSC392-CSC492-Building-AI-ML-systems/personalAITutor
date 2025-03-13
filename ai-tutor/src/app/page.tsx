

export default function Home() {
  return (
    <div className="grid flex flex-col pt-[100] place-content-center">
        <div className="relative text-5xl w-fit mx-auto">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 -mx-4 bg-[#E9F3DA]"></div>
          <div className="relative text-7xl">ADVISORY</div>
        </div>
        <div className="text-md text-center m-2">A Personal AI Tutor.</div>
          {/* Input Box */}
        <div className="relative w-[60vw] p-4 border-none rounded-full bg-[#FFF0D2]">
            {/* Input Field */}
            <input
              className="bg-transparent focus:outline-none"
              type="text"
              placeholder="As me something..."
              // value={input}
              // onChange={(e) => setInput(e.target.value)}
              // onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            
            {/* Send Button (Inside Input) */}
            <button
              className="text-3xl absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              // onClick={sendMessage}
            > 
              ➤
            </button>
        </div>
    </div>
  );
}
