import { Messages } from "../utils/messages.ts";
import { SparkIcon } from "./Icons.tsx";

interface LogoProps {
    isCentered?: boolean;
}

export function Logo({ isCentered = false }: LogoProps) {
    return (
        <div className={isCentered ? "brand brand--centered" : "brand"}>
            <span className="logo">
                <SparkIcon />
                Faísca
            </span>
            <span className="tagline">{Messages.getTagline()}</span>
        </div>
    );
}
