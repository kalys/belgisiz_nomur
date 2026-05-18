import { useTranslations } from 'next-intl'
import type { Score } from '@/lib/api'

function scoreColor(score: number, reportCount: number) {
  if (reportCount === 0) return 'bg-gray-100 text-gray-600'
  if (score < 30) return 'bg-red-100 text-red-700'
  if (score < 60) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

export function ScoreBadge({ score }: { score: Score }) {
  const t = useTranslations('score')

  const label =
    score.report_count === 0
      ? t('unknown')
      : score.score < 30
        ? t('dangerous')
        : score.score < 60
          ? t('suspicious')
          : t('safe')

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${scoreColor(score.score, score.report_count)}`}
      >
        {label}
      </span>
      {score.report_count > 0 && (
        <span className="text-xs text-gray-400">{t(`confidence.${score.confidence}`)}</span>
      )}
    </div>
  )
}
