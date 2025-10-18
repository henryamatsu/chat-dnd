import { MessageDTO } from "@/lib/dtos";

export default function MessageBubble(props: {message: MessageDTO}) {
    const {message} = props;
    const {role, text} = message;

    const roleStyle = role === "user" ?
    `border-red-500 self-end` :
    `border-blue-500`
    
return (
    <div className={`${roleStyle} border-2 rounded p-4 min-w-[200px] max-w-[500px] text-white bg-black`}>
        <span>{role}</span>
        <p>{text}</p>
    </div>
)
}