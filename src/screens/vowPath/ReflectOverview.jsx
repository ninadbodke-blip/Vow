import StageOverview from './StageOverview'
import {
  REFLECT_V2_DAYS as REFLECT_DAYS,
  REFLECT_V2_TOTAL_DAYS as REFLECT_TOTAL_DAYS,
  REFLECT_V2_PHASES as REFLECT_PHASES,
} from './data/reflectV2Content'

export default function ReflectOverview() {
  return (
    <StageOverview
      stageKey="reflect"
      title="Reflect"
      phases={REFLECT_PHASES}
      days={REFLECT_DAYS}
      totalDays={REFLECT_TOTAL_DAYS}
      routeBase="/app/vow-path/reflect"
      libraryRoute="/app/library/reflect"
      progressLabel="days gathered"
      stageEndLabel="End of Reflect"
    />
  )
}