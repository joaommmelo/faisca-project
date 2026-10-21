import moment from "moment";

export class TimeUtils {
    public static formatElapsed(elapsedMilliseconds: number): string {
        const duration: moment.Moment = moment.utc(elapsedMilliseconds);
        return elapsedMilliseconds >= moment.duration(1, "hour").asMilliseconds() ? duration.format("H:mm:ss") : duration.format("m:ss");
    }
}
