import { MessageDTO } from "@/lib/dtos";

export default function MessageBubble(props: { message: MessageDTO }) {
    const { message } = props;
    const { role, text } = message;

    const roleStyle =
        role === "user" ?
        "self-end bg-red-600 border-red-500" :
        "self-start bg-blue-600 border-blue-500";


    return (
        <div
            className={`${roleStyle} border-2 rounded-2xl p-4 max-w-[70%] break-words shadow-md`}
        >
            <span className="text-xs text-gray-200 uppercase font-semibold">{role}</span>
            <p className="mt-1 text-white">{text}</p>
        </div>
    );
}
