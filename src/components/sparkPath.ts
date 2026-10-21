// Four-pointed spark, the brand's mark: used in the logo, the collar tag and the celebrations.
export function getSparkPath(centerX: number, centerY: number, radius: number): string {
    const waist: number = radius * 0.28;
    return [
        `M${centerX} ${centerY - radius}`,
        `Q${centerX + waist} ${centerY - waist} ${centerX + radius} ${centerY}`,
        `Q${centerX + waist} ${centerY + waist} ${centerX} ${centerY + radius}`,
        `Q${centerX - waist} ${centerY + waist} ${centerX - radius} ${centerY}`,
        `Q${centerX - waist} ${centerY - waist} ${centerX} ${centerY - radius}`,
        "Z"
    ].join(" ");
}
